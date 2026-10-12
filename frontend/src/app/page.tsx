import Link from "next/link";
import styles from "./page.module.css";

const STEPS = [
  {
    no: "01",
    color: "pink",
    title: "献立表をぽんっ",
    text: "園の献立表の写真・PDFをアップするだけ。お昼ごはんをまるっと読み取ります。",
    icon: (
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
        <rect x="4" y="7" width="24" height="18" fill="none" strokeWidth="2.5" />
        <path d="M4 9 L16 18 L28 9" fill="none" strokeWidth="2.5" />
        <circle cx="24" cy="21" r="4" />
        <path d="M22.5 21 h3 M24 19.5 v3" strokeWidth="2" />
      </svg>
    ),
  },
  {
    no: "02",
    color: "lemon",
    title: "お子さんカード登録",
    text: "アレルギー・にがて・年齢をふわっと登録。毎日の提案に自動で反映されます。",
    icon: (
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
        <circle cx="16" cy="12" r="6" fill="none" strokeWidth="2.5" />
        <path
          d="M5 27 c1.5-6 6-8.5 11-8.5 s9.5 2.5 11 8.5"
          fill="none"
          strokeWidth="2.5"
        />
      </svg>
    ),
  },
  {
    no: "03",
    color: "mint",
    title: "夜ごはんがぱっ",
    text: "お昼とかぶらない・おうちの食材いかす・つくりやすい。1〜7日分まとめて提案。",
    icon: (
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
        <path
          d="M5 15 h22 v3 a11 11 0 0 1-22 0 z"
          fill="none"
          strokeWidth="2.5"
        />
        <path d="M11 15 v-4 M16 15 v-6 M21 15 v-4" strokeWidth="2.5" />
        <path d="M9 26 h14" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    no: "04",
    color: "sky",
    title: "お買い物メモ完成",
    text: "足りないものだけをふわっと抜き出し。そのままお買い物に持っていけます。",
    icon: (
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
        <path
          d="M6 12 h20 l-2.5 11 h-15 z"
          fill="none"
          strokeWidth="2.5"
        />
        <path d="M10 12 a6 6 0 0 1 12 0" fill="none" strokeWidth="2.5" />
        <path d="M13 17 v5 M16 17 v5 M19 17 v5" strokeWidth="2" />
      </svg>
    ),
  },
];

function Sun() {
  return (
    <svg
      className={styles.sun}
      viewBox="0 0 100 100"
      width="92"
      height="92"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="20" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        const x1 = 50 + Math.cos(a) * 28;
        const y1 = 50 + Math.sin(a) * 28;
        const x2 = 50 + Math.cos(a) * 40;
        const y2 = 50 + Math.sin(a) * 40;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="5" />
        );
      })}
      <circle cx="43" cy="47" r="2.6" fill="#fff" stroke="none" />
      <circle cx="57" cy="47" r="2.6" fill="#fff" stroke="none" />
      <path
        d="M43 55 q7 6 14 0"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
      />
    </svg>
  );
}

function Cloud({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 60"
      width="120"
      height="60"
      aria-hidden="true"
    >
      <path d="M20 50 a12 12 0 0 1 2-23 a16 16 0 0 1 30-6 a13 13 0 0 1 22 8 a11 11 0 0 1 8 21 z" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.logo}>
            <span className={styles.logoMark}>●</span>
            ほいくレシピ
          </span>
          <nav className={styles.nav}>
            <Link href="/login" className={styles.loginLink}>
              ログイン
            </Link>
            <Link href="/register" className={styles.registerLink}>
              新規登録
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <Sun />
          <Cloud className={`${styles.cloud} ${styles.cloudA}`} />
          <Cloud className={`${styles.cloud} ${styles.cloudB}`} />
          <div className={styles.heroInner}>
            <p className={styles.kicker}>
              <span className={styles.en}>MENU LETTER</span>
              ほいくえんの おうちごはん応援
            </p>
            <h1 className={styles.title}>
              きょうの夜ごはん、
              <br />
              ふわっと決まる。
            </h1>
            <p className={styles.subtitle}>
              園のお昼ごはんと重ならないように、アレルギー・好き嫌い・
              冷蔵庫の中身を見て、夜ごはんの候補をまとめて提案します。
            </p>
            <div className={styles.ctaRow}>
              <Link href="/register" className={styles.cta}>
                はじめてみる ♪
              </Link>
              <Link href="/login" className={styles.ctaGhost}>
                ログイン
              </Link>
            </div>

            <aside className={styles.heroPaper} aria-label="提案イメージ">
              <p className={styles.heroPaperHead}>
                <span className={styles.en}>TODAY&apos;S MENU</span>
                10/7（火）の夜ごはん
              </p>
              <div className={styles.heroPaperBody}>
                <div className={styles.lunch}>
                  <span>おひる</span>
                  鮭の塩焼き・ほうれん草のごま和え・みそ汁
                </div>
                <div className={styles.night}>
                  <span>よ る</span>
                  鶏むねの照り焼き・キャベツの塩昆布和え・わかめスープ
                </div>
              </div>
              <p className={styles.heroPaperFoot}>
                おうちにあるよ：鶏むね・キャベツ ／ 買うもの：塩昆布だけ
              </p>
            </aside>
          </div>
          <svg
            className={styles.heroWaves}
            viewBox="0 0 1440 48"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 28 Q60 8 120 24 T240 24 T360 24 T480 24 T600 24 T720 24 T840 24 T960 24 T1080 24 T1200 24 T1320 24 T1440 24 V48 H0 Z" />
          </svg>
        </section>

        <section className={styles.features}>
          <p className={styles.sectionKicker}>
            <span className={styles.en}>HOW TO USE</span>
            つかいかたは かんたん4ステップ
          </p>
          <h2 className={styles.sectionTitle}>ぽんっ・ぱっ・ふわっと</h2>
          <ol className={styles.grid}>
            {STEPS.map((s) => (
              <li
                key={s.no}
                className={`${styles.feature} ${styles[`feature_${s.color}`]}`}
              >
                <span className={styles.featureIcon}>{s.icon}</span>
                <span className={styles.featureNo}>{s.no}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.safety}>
          <div className={styles.safetyInner}>
            <p className={styles.safetyKicker}>
              <span className={styles.en}>SAFETY FIRST</span>
              あんしんポイント
            </p>
            <h2>アレルギーと にがてに やさしい</h2>
            <p>
              食べられないものは使わないよ。練習中の食材は少しずつ。
              お子さんごとの記録がそのまま提案に引き継がれます。
            </p>
            <Link href="/register" className={styles.safetyLink}>
              お子さんカードをつくる →
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          <span className={styles.en}>HOIKU RECIPE</span>
          ほいくレシピ ─ おうちごはんを ふわっと応援
        </p>
      </footer>
    </div>
  );
}
