'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  BarChart3, 
  Home, 
  Settings, 
  Sparkles, 
  Users,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { label: '홈', href: '/', icon: Home },
  { label: '기록', href: '/record', icon: Activity },
  { label: '리포트', href: '/report', icon: BarChart3 },
  { label: '가족', href: '/family', icon: Users },
  { label: '설정', href: '/settings', icon: Settings },
];

export default function DesktopShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <header className="sticky top-0 z-50 border-b-3 border-black bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-lime-400">
              <Sparkles size={20} />
            </div>
            <span className="text-xl font-black tracking-tight">UricAI</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? 'border-2 border-black bg-lime-400 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="neo-icon-btn md:hidden"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="border-t-2 border-black bg-white p-4 md:hidden">
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold ${
                      isActive
                        ? 'border-2 border-black bg-lime-400'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={20} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-10">
        {children}
      </main>

      <footer className="border-t-3 border-black bg-slate-900 py-8 text-white">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-lime-400 bg-lime-400">
                <Sparkles size={16} className="text-black" />
              </div>
              <span className="font-bold">UricAI</span>
            </div>
            <p className="text-sm text-slate-400">
              가족 대사 건강을 함께 관리하는 AI 코치
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
