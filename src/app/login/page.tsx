'use client';

import Link from 'next/link';
import { ArrowLeft, Chrome, LockKeyhole, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useFirebaseStatus } from '@/components/FirebaseBootstrap';

export default function LoginPage() {
  const { status, loginWithGoogle, authBusy, authError, clearAuthError } = useFirebaseStatus();

  return (
    <div className="min-h-screen px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-[500px] lg:max-w-2xl">
        <header className="mb-6 flex items-center gap-4">
          <Link href="/" className="neo-icon-btn">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="neo-badge-dark mb-2">
              <ShieldCheck size={12} />
              ACCOUNT
            </div>
            <h1 className="neo-title">계정 연결</h1>
          </div>
        </header>

        <div className="space-y-5">
          <div className="neo-card-dark p-6">
            <div className="neo-badge-lime mb-4">
              <Zap size={12} />
              UPGRADE
            </div>
            <h2 className="neo-title-lg text-white">
              Google 계정으로<br />건강 기록을 안전하게
            </h2>
            <p className="neo-body mt-4 text-slate-300">
              지금은 익명 Firebase 세션으로도 동작하지만, Google 로그인을 연결하면 기기 변경 후에도 Libre 데이터와 가족 기록을 더 안정적으로 이어갈 수 있습니다.
            </p>
          </div>

          <div className="neo-card p-5">
            <p className="neo-subtitle mb-4">현재 동기화 상태</p>
            <div className="rounded-xl border-2 border-black bg-slate-50 px-4 py-3">
              <p className="font-semibold">{status.message}</p>
              {status.email && <p className="mt-1 text-sm text-slate-600">계정: {status.email}</p>}
              {status.userId && <p className="mt-1 text-xs text-slate-500">UID: {status.userId}</p>}
            </div>

            {status.isAnonymous ? (
              <button
                onClick={() => {
                  clearAuthError();
                  loginWithGoogle();
                }}
                disabled={authBusy}
                className="neo-btn neo-btn-primary mt-4 w-full disabled:opacity-50"
              >
                <Chrome size={18} />
                {authBusy ? 'Google 로그인 연결 중...' : 'Google 계정 연결'}
              </button>
            ) : (
              <div className="neo-badge-lime mt-4 w-full justify-center py-3">
                이미 Google 계정으로 연결되어 있습니다
              </div>
            )}

            {authError && (
              <div className="neo-badge-rose mt-3 w-full justify-center py-3">{authError}</div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="neo-card-cyan p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} />
                <p className="font-bold">기기 변경 대응</p>
              </div>
              <p className="neo-body mt-3">
                휴대폰을 바꿔도 Firebase 계정으로 동일한 스냅샷을 다시 불러옵니다.
              </p>
            </div>
            <div className="neo-card-violet p-5">
              <div className="flex items-center gap-2">
                <LockKeyhole size={20} />
                <p className="font-bold">개인 데이터 보호</p>
              </div>
              <p className="neo-body mt-3">
                Firestore rules로 본인 UID 경로만 읽고 쓰게 제한합니다.
              </p>
            </div>
          </div>

          <Link href="/" className="neo-btn neo-btn-secondary w-full">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
