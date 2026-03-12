'use client';

import { browserLocalPersistence, GoogleAuthProvider, linkWithPopup, onAuthStateChanged, setPersistence, signInAnonymously, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { firebaseApp, firebaseAuth, firebaseDb, bootFirebaseAnalytics } from '@/lib/firebase';
import { AppSnapshot, getAppSnapshot, hasMeaningfulSnapshot, registerStorageSync, replaceAppSnapshot } from '@/lib/storage';

export type CloudSyncState = 'idle' | 'connecting' | 'ready' | 'local-only' | 'error';

export interface CloudSyncStatus {
  state: CloudSyncState;
  userId: string | null;
  message: string;
  isAnonymous: boolean;
  displayName: string | null;
  email: string | null;
  lastSyncedAt: string | null;
}

const SNAPSHOT_VERSION = 1;
const SNAPSHOT_PATH = 'app';
const SNAPSHOT_DOC = 'primary';

let initialized = false;
let savingTimer: ReturnType<typeof setTimeout> | null = null;
let hydrating = false;

function buildStatus(state: CloudSyncState, message: string, user: User | null): CloudSyncStatus {
  return {
    state,
    userId: user?.uid ?? null,
    message,
    isAnonymous: user?.isAnonymous ?? true,
    displayName: user?.displayName ?? null,
    email: user?.email ?? null,
    lastSyncedAt: null,
  };
}

function getSnapshotRef(userId: string) {
  return doc(firebaseDb, 'users', userId, SNAPSHOT_PATH, SNAPSHOT_DOC);
}

async function saveSnapshot(userId: string) {
  if (hydrating) return;
  const snapshot = getAppSnapshot();
  const syncedAt = new Date().toISOString();
  await setDoc(getSnapshotRef(userId), {
    version: SNAPSHOT_VERSION,
    snapshot,
    updatedAt: serverTimestamp(),
    syncedAt,
    appId: firebaseApp.name,
  }, { merge: true });
  return syncedAt;
}

function queueSave(userId: string, onStatusChange?: (status: CloudSyncStatus) => void) {
  if (savingTimer) clearTimeout(savingTimer);
  savingTimer = setTimeout(() => {
    saveSnapshot(userId)
      .then((syncedAt) => {
        const user = firebaseAuth.currentUser;
        if (!user) return;
        onStatusChange?.({
          ...buildStatus('ready', user.isAnonymous ? '익명 Firebase 세션으로 동기화 중입니다.' : 'Google 계정으로 Firebase 동기화 중입니다.', user),
          lastSyncedAt: syncedAt ?? null,
        });
      })
      .catch(() => {
        // Keep local app fully usable even if cloud save fails.
      });
  }, 500);
}

async function hydrateSnapshot(userId: string) {
  hydrating = true;
  try {
    const localSnapshot = getAppSnapshot();
    const remoteDoc = await getDoc(getSnapshotRef(userId));
    const remoteSnapshot = remoteDoc.exists() ? (remoteDoc.data().snapshot as Partial<AppSnapshot> | undefined) : undefined;
    const remoteSyncedAt = remoteDoc.exists() ? (remoteDoc.data().syncedAt as string | undefined) : undefined;

    if (remoteSnapshot && hasMeaningfulSnapshot(remoteSnapshot as AppSnapshot)) {
      replaceAppSnapshot(remoteSnapshot);
      return remoteSyncedAt ?? null;
    }

    if (hasMeaningfulSnapshot(localSnapshot)) {
      return (await saveSnapshot(userId)) ?? null;
    }
    return null;
  } finally {
    hydrating = false;
  }
}

async function ensureSignedIn() {
  await setPersistence(firebaseAuth, browserLocalPersistence);
  if (firebaseAuth.currentUser) return firebaseAuth.currentUser;
  const result = await signInAnonymously(firebaseAuth);
  return result.user;
}

export async function startCloudSync(onStatusChange?: (status: CloudSyncStatus) => void) {
  if (initialized) {
    return () => registerStorageSync(null);
  }

  initialized = true;
  onStatusChange?.(buildStatus('connecting', 'Firebase에 연결하는 중...', firebaseAuth.currentUser));

  try {
    await bootFirebaseAnalytics();
    const user = await ensureSignedIn();
    const initialSyncedAt = await hydrateSnapshot(user.uid);
    registerStorageSync(() => queueSave(user.uid, onStatusChange));

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (nextUser: User | null) => {
      if (!nextUser) {
        onStatusChange?.(buildStatus('local-only', '로그아웃되어 로컬 모드로 동작 중입니다.', null));
        registerStorageSync(null);
        return;
      }

      const syncedAt = await hydrateSnapshot(nextUser.uid);
      registerStorageSync(() => queueSave(nextUser.uid, onStatusChange));
      onStatusChange?.({
        ...buildStatus('ready', nextUser.isAnonymous ? '익명 Firebase 세션으로 동기화 중입니다.' : 'Google 계정으로 Firebase 동기화 중입니다.', nextUser),
        lastSyncedAt: syncedAt,
      });
    });

    onStatusChange?.({
      ...buildStatus('ready', user.isAnonymous ? '익명 Firebase 세션으로 동기화 중입니다.' : 'Google 계정으로 Firebase 동기화 중입니다.', user),
      lastSyncedAt: initialSyncedAt,
    });
    return () => {
      unsubscribe();
      registerStorageSync(null);
    };
  } catch (error) {
    registerStorageSync(null);
    onStatusChange?.(buildStatus('local-only', '로컬 모드로 동작 중입니다. 데이터는 기기에 안전하게 저장됩니다.', null));
    return () => registerStorageSync(null);
  }
}

export async function signInWithGoogleAccount() {
  await setPersistence(firebaseAuth, browserLocalPersistence);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const currentUser = firebaseAuth.currentUser;
  try {
    if (currentUser?.isAnonymous) {
      return await linkWithPopup(currentUser, provider);
    }

    return await signInWithPopup(firebaseAuth, provider);
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error) {
      const code = String(error.code);
      if (code === 'auth/popup-closed-by-user') {
        throw new Error('Google 로그인 창이 닫혔습니다. 다시 시도해주세요.');
      }
      if (code === 'auth/cancelled-popup-request') {
        throw new Error('이미 로그인 창이 열려 있습니다. 기존 창을 완료해주세요.');
      }
      if (code === 'auth/credential-already-in-use' || code === 'auth/account-exists-with-different-credential') {
        throw new Error('이 Google 계정은 다른 Firebase 계정과 연결되어 있습니다. 다른 브라우저 세션에서 로그인했는지 확인해주세요.');
      }
    }

    throw error instanceof Error ? error : new Error('Google 로그인에 실패했습니다.');
  }
}

export async function signOutFromFirebase() {
  await signOut(firebaseAuth);
}
