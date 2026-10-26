"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type IconProps = { active: boolean };

function IconProfile({ active }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4 21a8 8 0 0 1 16 0" />
      {active && <circle cx="12" cy="8" r="2" fill="currentColor" stroke="none" />}
    </svg>
  );
}

function IconDocument() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconHistory() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
      <path d="M3 4v4h4" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
      <path d="M3 4h2l2.5 12h11L21 8H6" />
    </svg>
  );
}

// 並び順: 先頭がアプリのトップ（レシピ検索）、末尾がプロフィール。
const NAV_ITEMS = [
  {
    href: "/recipe-search",
    label: "レシピ検索",
    short: "レシピ",
    icon: IconSearch,
  },
  {
    href: "/menus",
    label: "献立表",
    short: "献立表",
    icon: IconDocument,
  },
  {
    href: "/meal-plan",
    label: "こんだて提案",
    short: "こんだて",
    icon: IconSparkle,
  },
  {
    href: "/recipes",
    label: "提案の記録",
    short: "記録",
    icon: IconHistory,
  },
  {
    href: "/shopping",
    label: "買い物メモ",
    short: "買い物",
    icon: IconCart,
  },
  {
    href: "/dashboard",
    label: "お子さん・プロフィール",
    short: "プロフィール",
    icon: IconProfile,
  },
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
          <Link href="/recipe-search" className="app-nav__brand">
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
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
      <nav
        className="app-bottom-nav"
        aria-label="メインナビゲーション（モバイル）"
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`app-bottom-nav__link${active ? " app-bottom-nav__link--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon active={active} />
              <span>{item.short}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
