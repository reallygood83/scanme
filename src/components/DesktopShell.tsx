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
} from 'lucide-react';

const NAV_ITEMS = [
  { label: '홈', href: '/', icon: Home },
  { label: '기록', href: '/record', icon: Activity },
  { label: '리포트', href: '/report', icon: BarChart3 },
  { label: '가족', href: '/family', icon: Users },
  { label: '설정', href: '/settings', icon: Settings },
];

export default function DesktopShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <header className="sticky top-0 z-50 border-b-3 border-black bg-white">
        <div className="flex h-16 items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-lime-400">
              <Sparkles size={20} />
            </div>
            <span className="text-xl font-black tracking-tight">UricAI</span>
          </Link>

          <nav className="flex items-center gap-1">
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
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="px-6 py-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
