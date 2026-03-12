'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { signInWithGoogleAccount, signOutFromFirebase, startCloudSync, type CloudSyncStatus } from '@/lib/cloud-sync';

const defaultStatus: CloudSyncStatus = {
  state: 'idle',
  userId: null,
  message: 'Firebase를 준비 중입니다.',
  isAnonymous: true,
  displayName: null,
  email: null,
  lastSyncedAt: null,
};

interface FirebaseContextValue {
  status: CloudSyncStatus;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  authBusy: boolean;
  authError: string;
  clearAuthError: () => void;
}

const FirebaseStatusContext = createContext<FirebaseContextValue>({
  status: defaultStatus,
  loginWithGoogle: async () => {},
  logout: async () => {},
  authBusy: false,
  authError: '',
  clearAuthError: () => {},
});

export function useFirebaseStatus() {
  return useContext(FirebaseStatusContext);
}

export default function FirebaseBootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<CloudSyncStatus>(defaultStatus);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    startCloudSync((nextStatus) => {
      setStatus(nextStatus);
      if (nextStatus.state === 'ready' || nextStatus.state === 'local-only' || nextStatus.state === 'error') {
        setReady(true);
      }
    }).then((dispose) => {
      cleanup = dispose;
      setReady(true);
    });

    return () => cleanup?.();
  }, []);

  const value = useMemo<FirebaseContextValue>(() => ({
    status,
    authBusy,
    authError,
    clearAuthError: () => setAuthError(''),
    loginWithGoogle: async () => {
      setAuthBusy(true);
      setAuthError('');
      try {
        await signInWithGoogleAccount();
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : 'Google 로그인 중 문제가 발생했습니다.');
      } finally {
        setAuthBusy(false);
      }
    },
    logout: async () => {
      setAuthBusy(true);
      setAuthError('');
      try {
        await signOutFromFirebase();
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : '로그아웃 중 문제가 발생했습니다.');
      } finally {
        setAuthBusy(false);
      }
    },
  }), [authBusy, authError, status]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 text-center">
        <div className="max-w-xs rounded-[28px] bg-white px-6 py-8 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-500">Firebase Sync</p>
          <p className="mt-3 text-base font-semibold text-slate-900">데이터를 준비하고 있습니다.</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">로컬 기록과 Firebase 클라우드 저장소를 연결하는 중입니다.</p>
        </div>
      </div>
    );
  }

  return <FirebaseStatusContext.Provider value={value}>{children}</FirebaseStatusContext.Provider>;
}
