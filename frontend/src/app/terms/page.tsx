import Link from "next/link";

export const metadata = { title: "利用規約 | ほいくレシピ" };

export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="legal-page__inner">
        <Link href="/" className="legal-page__back">← ほいくレシピ</Link>
        <h1>利用規約</h1>
        <p className="legal-page__updated">制定日：2026年10月27日</p>
        <h2>1. サービスについて</h2>
        <p>ほいくレシピは、保育園の献立表をもとに家庭の献立づくりを支援するサービスです。</p>
        <h2>2. 利用上の注意</h2>
        <p>利用者は、登録情報を自らの責任で管理し、第三者に利用させないものとします。違法行為、迷惑行為、サービス運営を妨げる行為は禁止します。</p>
        <h2>3. AI機能</h2>
        <p>AIが生成・解析した内容には誤りが含まれる場合があります。食物アレルギー、年齢、体調に関する最終確認は利用者が行ってください。</p>
        <h2>4. 変更・停止</h2>
        <p>運営者は、保守・障害・セキュリティ対応などのため、予告なくサービスを変更または停止することがあります。</p>
        <h2>5. 規約の変更</h2>
        <p>必要に応じて本規約を変更できます。重要な変更はアプリ上でお知らせします。</p>
      </div>
    </main>
  );
}
