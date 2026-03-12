'use client';

import Link from 'next/link';
import { Activity, HeartPulse, ShieldCheck, Sparkles } from 'lucide-react';

export default function DesktopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(280px,1fr)_440px_minmax(280px,1fr)] lg:gap-8 lg:px-8 lg:py-8">
      <aside className="hidden lg:flex lg:flex-col lg:justify-between lg:rounded-[36px] lg:border lg:border-white/70 lg:bg-[linear-gradient(160deg,rgba(15,23,42,0.96),rgba(15,76,129,0.88))] lg:p-8 lg:text-white lg:shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-sky-100">
            <Sparkles size={14} />
            URICAI WEB
          </div>
          <h2 className="mt-6 text-4xl font-semibold leading-tight">가족 대사 건강을 위한 더 나은 웹 경험</h2>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            모바일 PWA 감성은 유지하되, 데스크톱에서는 더 넓은 시선과 더 깊은 정보 밀도로 제품답게 보이도록 구성했습니다.
          </p>
        </div>

        <div className="space-y-3">
          {[
            ['Libre 실데이터', 'CSV 업로드 후 즉시 혈당 흐름과 TIR 반영'],
            ['Firebase 동기화', '익명 세션과 Google 계정 연결을 모두 지원'],
            ['가족 중심 UX', '식사, 요산, 체중, 혈당을 한 화면에서 조망'],
          ].map(([title, description]) => (
            <div key={title} className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4">
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-2 text-xs leading-6 text-slate-300">{description}</p>
            </div>
          ))}
        </div>
      </aside>

      <main className="relative min-h-screen lg:min-h-0 lg:overflow-hidden lg:rounded-[40px] lg:border lg:border-white/80 lg:bg-white/70 lg:shadow-[0_30px_90px_rgba(15,23,42,0.14)] lg:backdrop-blur">
        <div className="hidden lg:block lg:absolute lg:inset-x-0 lg:top-0 lg:h-12 lg:bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0))]" />
        <div className="relative mx-auto min-h-screen max-w-[430px] lg:min-h-[860px] lg:bg-white lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          {children}
        </div>
      </main>

      <aside className="hidden lg:flex lg:flex-col lg:gap-4">
        <div className="rounded-[32px] border border-white/70 bg-white/82 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.1)] backdrop-blur">
          <div className="flex items-center gap-2 text-sky-700">
            <HeartPulse size={18} />
            <p className="text-sm font-semibold text-slate-900">웹 대시보드 포인트</p>
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li className="rounded-2xl bg-slate-50 px-4 py-3">넓은 화면에서도 중앙 앱이 고립돼 보이지 않도록 제품 정보 패널을 같이 배치했습니다.</li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">설정, 로그인, 리포트 흐름은 데스크톱에서도 신뢰감 있게 읽히도록 간격과 프레이밍을 키웠습니다.</li>
          </ul>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/82 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.1)] backdrop-blur">
          <div className="flex items-center gap-2 text-emerald-700">
            <ShieldCheck size={18} />
            <p className="text-sm font-semibold text-slate-900">빠른 이동</p>
          </div>
          <div className="mt-4 grid gap-3">
            <Link href="/login" className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white">계정 연결</Link>
            <Link href="/record?tab=glucose" className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700">Libre 업로드</Link>
            <Link href="/report" className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700">주간 리포트</Link>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-xs leading-5 text-sky-700">
            <Activity size={14} />
            지금 구조는 PWA와 웹 모두를 함께 고려한 하이브리드 레이아웃입니다.
          </div>
        </div>
      </aside>
    </div>
  );
}
