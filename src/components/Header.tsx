"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  right?: ReactNode;
}

export default function Header({ title, showBack, right }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center h-14 px-4 bg-white">
      <div className="w-8">
        {showBack && (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="뒤로 가기"
          >
            <ArrowLeft size={24} />
          </button>
        )}
      </div>
      <h1 className="flex-1 text-center text-lg font-semibold truncate">
        {title}
      </h1>
      <div className="w-8 flex justify-end">{right}</div>
    </header>
  );
}
