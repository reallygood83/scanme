'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ClipboardList,
  MessageCircle,
  BarChart3,
  Menu,
} from 'lucide-react';

const tabs = [
  { label: '홈', href: '/', icon: Home },
  { label: '기록', href: '/record', icon: ClipboardList },
  { label: 'AI코치', href: '/coach', icon: MessageCircle },
  { label: '리포트', href: '/report', icon: BarChart3 },
  { label: '더보기', href: '/settings', icon: Menu },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-[420px] -translate-x-1/2 neo-nav px-3 py-3 lg:hidden">
      <ul className="flex items-center justify-around">
        {tabs.map(({ label, href, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                className={`neo-nav-item ${isActive ? 'neo-nav-item-active' : ''}`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
