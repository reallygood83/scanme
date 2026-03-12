'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  BarChart3, 
  Heart, 
  Home, 
  Settings, 
  Sparkles, 
  Users, 
  Zap,
  TrendingUp,
  Shield,
  Smartphone
} from 'lucide-react';

const NAV_ITEMS = [
  { label: '홈', href: '/', icon: Home },
  { label: '기록', href: '/record', icon: Activity },
  { label: '리포트', href: '/report', icon: BarChart3 },
  { label: '가족', href: '/family', icon: Users },
  { label: '설정', href: '/settings', icon: Settings },
];

const FEATURES = [
  { icon: TrendingUp, label: 'Libre CGM', desc: '실시간 혈당 데이터' },
  { icon: Shield, label: 'Firebase', desc: '클라우드 동기화' },
  { icon: Heart, label: '가족 케어', desc: '함께 관리하는 건강' },
];

export default function DesktopShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[320px_1fr_320px] lg:gap-6 lg:p-6 xl:gap-8 xl:p-8">
      <aside className="hidden lg:flex lg:flex-col lg:gap-6">
        <div className="neo-card-lime p-6">
          <div className="neo-badge-dark mb-4">
            <Sparkles size={12} />
            URICAI
          </div>
          <h1 className="neo-title text-black">
            가족 대사 건강을<br />함께 관리합니다
          </h1>
          <p className="neo-body mt-4 text-slate-800">
            요산, 혈당, 식사를 한 화면에서 확인하고 AI 코치의 개인화된 조언을 받으세요.
          </p>
        </div>

        <nav className="neo-card p-4">
          <p className="neo-caption mb-3 px-2">메뉴</p>
          <ul className="space-y-2">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all ${
                      isActive
                        ? 'neo-nav-item-active'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="neo-card-cyan p-5">
          <p className="neo-caption mb-4">주요 기능</p>
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div 
                key={label} 
                className="flex items-center gap-3 rounded-xl border-2 border-black bg-white p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold">{label}</p>
                  <p className="text-xs text-slate-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="relative min-h-screen lg:min-h-0">
        <div className="mx-auto min-h-screen max-w-[500px] lg:max-w-none lg:min-h-0">
          <div className="neo-card-flat lg:min-h-[calc(100vh-64px)] lg:overflow-y-auto lg:bg-white">
            {children}
          </div>
        </div>
      </main>

      <aside className="hidden lg:flex lg:flex-col lg:gap-6">
        <div className="neo-card-dark p-6">
          <div className="mb-4 flex items-center gap-2">
            <Zap size={18} className="text-lime-400" />
            <span className="neo-badge-lime">LIVE</span>
          </div>
          <p className="neo-caption text-slate-400">실시간 연동</p>
          <div className="mt-3">
            <span className="neo-stat-value text-white">24/7</span>
          </div>
          <p className="neo-body mt-4 text-slate-300">
            Libre CGM과 연동하여 혈당 데이터를 자동으로 가져옵니다.
          </p>
        </div>

        <div className="neo-card p-5">
          <p className="neo-caption mb-4">빠른 액션</p>
          <div className="space-y-3">
            <Link href="/login" className="neo-btn neo-btn-primary w-full">
              <Shield size={18} />
              계정 연결
            </Link>
            <Link href="/record?tab=glucose" className="neo-btn neo-btn-cyan w-full">
              <Activity size={18} />
              Libre 업로드
            </Link>
            <Link href="/report" className="neo-btn neo-btn-secondary w-full">
              <BarChart3 size={18} />
              주간 리포트
            </Link>
          </div>
        </div>

        <div className="neo-card-orange p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-white">
              <Smartphone size={24} />
            </div>
            <div>
              <p className="font-bold">모바일 앱</p>
              <p className="mt-1 text-sm text-slate-800">
                PWA로 홈 화면에 추가하여 네이티브 앱처럼 사용하세요.
              </p>
            </div>
          </div>
        </div>

        <div className="neo-card-violet p-5 text-center">
          <p className="neo-caption">투자자 여러분께</p>
          <p className="neo-subtitle mt-2">
            헬스케어의 미래,<br />UricAI와 함께
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <span className="neo-badge-dark">Series A</span>
            <span className="neo-badge-lime">2024</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
