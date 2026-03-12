"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  MessageCircle,
  BarChart3,
  Menu,
} from "lucide-react";

const tabs = [
  { label: "홈", href: "/", icon: Home },
  { label: "기록", href: "/record", icon: ClipboardList },
  { label: "AI코치", href: "/coach", icon: MessageCircle },
  { label: "리포트", href: "/report", icon: BarChart3 },
  { label: "더보기", href: "/settings", icon: Menu },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-3 left-1/2 z-50 w-[calc(100%-24px)] max-w-[406px] -translate-x-1/2 rounded-[28px] border border-white/80 bg-white/92 px-2 py-2 shadow-[0_18px_60px_rgba(15,23,42,0.16)] backdrop-blur">
      <ul className="flex items-center justify-around">
        {tabs.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex min-w-[68px] flex-col items-center gap-1 rounded-[20px] px-3 py-2 text-[11px] font-medium transition-all ${
                  isActive ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
