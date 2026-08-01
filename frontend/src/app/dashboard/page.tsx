"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, type Child } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listChildren()
      .then(setChildren)
      .catch((err) => setError(err instanceof Error ? err.message : "読み込みに失敗しました"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) return <main style={{ padding: 40 }}>読み込み中...</main>;

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <nav style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "center" }}>
        <Link href="/dashboard">お子様</Link>
        <Link href="/menus">献立表</Link>
        <Link href="/meal-plan">AI 献立提案</Link>
        <Link href="/recipes">提案献立</Link>
        <Link href="/shopping">買い物リスト</Link>
        <button onClick={handleLogout} style={{ marginLeft: "auto", cursor: "pointer" }}>
          ログアウト
        </button>
      </nav>
      <h1>お子様管理</h1>
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      {children.length === 0 ? (
        <div className="card">
          <p>お子様が登録されていません。まずはお子様を登録しましょう。</p>
        </div>
      ) : (
        children.map((child) => (
          <div className="card" key={child.id}>
            <h2>{child.name}</h2>
            <p>アレルギー: {child.allergies.length > 0 ? child.allergies.map((a) => a.ingredient).join("、") : "なし"}</p>
            <p>
              好き嫌い:{" "}
              {child.preferences.length > 0
                ? child.preferences.map((p) => `${p.ingredient}（${p.mode === "exclude" ? "除外" : "改善優先"}）`).join("、")
                : "なし"}
            </p>
          </div>
        ))
      )}
      <Link href="/meal-plan" className="button">
        献立を作成する
      </Link>
    </main>
  );
}
