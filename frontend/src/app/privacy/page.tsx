import Link from "next/link";

export const metadata = { title: "プライバシー | ほいくレシピ" };

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="legal-page__inner">
        <Link href="/" className="legal-page__back">← ほいくレシピ</Link>
        <h1>プライバシーについて</h1>
        <p className="legal-page__updated">制定日：2026年10月27日</p>
        <h2>収集する情報</h2>
        <p>ユーザーネーム、パスワードのハッシュ、登録したお子さんの情報、アレルギー・好き嫌い、献立・在庫情報を保存します。</p>
        <h2>献立表の外部送信</h2>
        <p>献立表を解析するとき、アップロードしたPDFまたは画像は解析に必要な範囲でOpenAI APIへ送信されます。送信した献立表は、献立解析以外の目的ではアプリ側で使用しません。APIキーはサーバー側だけで管理し、ブラウザには公開しません。</p>
        <h2>利用目的</h2>
        <p>アカウント認証、献立提案、献立表解析、買い物リスト作成、サービス改善のために利用します。</p>
        <h2>第三者提供・安全管理</h2>
        <p>法令に基づく場合を除き、保存した個人情報を第三者へ提供しません。パスワードはハッシュ化して保存します。</p>
        <h2>削除・問い合わせ</h2>
        <p>保存情報の削除を希望する場合は、運営者へ連絡してください。本アプリが試験運用中の場合は、運用環境の管理者にご相談ください。</p>
      </div>
    </main>
  );
}
