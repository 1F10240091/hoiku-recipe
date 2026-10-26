import Link from "next/link";

export const metadata = { title: "免責事項 | ほいくレシピ" };

export default function DisclaimerPage() {
  return (
    <main className="legal-page">
      <div className="legal-page__inner">
        <Link href="/" className="legal-page__back">← ほいくレシピ</Link>
        <h1>免責事項</h1>
        <p className="legal-page__updated">制定日：2026年10月27日</p>
        <h2>献立・栄養情報</h2>
        <p>表示される献立、栄養情報、アレルギー判定、料理提案は参考情報です。医療・栄養指導の代替ではありません。</p>
        <h2>アレルギーと安全確認</h2>
        <p>食物アレルギーがある場合は、原材料表示、調味料、加工品、調理器具の混入を必ず確認してください。少しでも不安がある場合は専門家へ相談してください。</p>
        <h2>損害について</h2>
        <p>運営者は、サービスの利用または利用できなかったことにより生じた損害について、法令上許される範囲で責任を負いません。</p>
      </div>
    </main>
  );
}
