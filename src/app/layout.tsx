import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from 'next/font/google';
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: "UricAI - 스마트 건강관리",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable} bg-[var(--bg)] text-[var(--text)] antialiased`}>
        {children}
      </body>
    </html>
  );
}
