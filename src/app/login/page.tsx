'use client';

import Link from 'next/link';
import { Chrome, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { useFirebaseStatus } from '@/components/FirebaseBootstrap';

export default function LoginPage() {
  const { status, loginWithGoogle, authBusy, authError, clearAuthError } = useFirebaseStatus();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e7f1ff,transparent_36%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_100%)] px-4 py-8">
      <div className="mx-auto flex max-w-[430px] flex-col gap-5">
        <div className="rounded-[32px] bg-slate-950 px-6 py-7 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-sky-100">
            <Sparkles size={14} />
            ACCOUNT UPGRADE
          </div>
          <h1 className="mt-4 text-[30px] font-semibold leading-tight">Google 계정으로 건강 기록을 안전하게 이어가세요.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            지금은 익명 Firebase 세션으로도 동작하지만, Google 로그인을 연결하면 기기 변경 후에도 Libre 데이터와 가족 기록을 더 안정적으로 이어갈 수 있습니다.
          </p>
        </div>

        <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm font-semibold text-slate-900">현재 동기화 상태</p>
          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p>{status.message}</p>
            {status.email && <p className="mt-1 text-xs text-slate-500">계정: {status.email}</p>}
            {status.userId && <p className="mt-1 text-xs text-slate-400">UID: {status.userId}</p>}
          </div>

          {status.isAnonymous ? (
            <button
              onClick={() => {
                clearAuthError();
                loginWithGoogle();
              }}
              disabled={authBusy}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Chrome size={18} />
              {authBusy ? 'Google 로그인 연결 중...' : 'Google 계정 연결'}
            </button>
          ) : (
            <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              이미 Google 계정으로 연결되어 있습니다.
            </div>
          )}

          {authError && <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{authError}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center gap-2 text-sky-600">
              <ShieldCheck size={18} />
              <p className="text-sm font-semibold text-slate-900">기기 변경 대응</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">휴대폰을 바꿔도 Firebase 계정으로 동일한 스냅샷을 다시 불러옵니다.</p>
          </div>
          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center gap-2 text-violet-600">
              <LockKeyhole size={18} />
              <p className="text-sm font-semibold text-slate-900">개인 데이터 보호</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">Firestore rules로 본인 UID 경로만 읽고 쓰게 제한합니다.</p>
          </div>
        </div>

        <Link href="/" className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
