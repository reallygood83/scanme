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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200 z-50">
      <ul className="flex justify-around items-center h-14">
        {tabs.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 text-xs ${
                  isActive ? "text-[#3B82F6]" : "text-gray-400"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
