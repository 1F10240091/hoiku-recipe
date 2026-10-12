"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "お子さん・プロフィール" },
  { href: "/menus", label: "献立表" },
  { href: "/meal-plan", label: "こんだて提案" },
  { href: "/recipe-search", label: "レシピ検索" },
  { href: "/recipes", label: "提案の記録" },
  { href: "/shopping", label: "買い物メモ" },
  { href: "/feedback", label: "ご意見" },
];

export default function AppNav() {
  const pathname = usePathname();

  return (
    <>
      <a href="#main-content" className="skip-link">
        メインコンテンツへスキップ
      </a>
      <nav className="app-nav" aria-label="メインナビゲーション">
        <div className="app-nav__inner">
          <Link href="/dashboard" className="app-nav__brand">
            ほいくレシピ
          </Link>
          <ul className="app-nav__list">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`app-nav__link${active ? " app-nav__link--active" : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
