import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ほいくレシピ | 保育園児のいる家庭の夕食づくり支援",
  description:
    "保育園の献立表を読み取り、アレルギー・好き嫌い・冷蔵庫の在庫を考慮した夕食の候補をまとめて提案します。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fff8f1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800&family=Zen+Maru+Gothic:wght@500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div id="main-content">{children}</div>
        <footer className="site-footer">
          <Link href="/terms">利用規約</Link>
          <Link href="/privacy">プライバシー</Link>
          <Link href="/disclaimer">免責事項</Link>
        </footer>
      </body>
    </html>
  );
}
