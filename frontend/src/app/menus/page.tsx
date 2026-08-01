"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import { api, type NurseryMenu } from "@/lib/api";

export default function MenusPage() {
  const [menus, setMenus] = useState<NurseryMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMenus = () => {
    api
      .listMenus()
      .then(setMenus)
      .catch((err) => setError(err instanceof Error ? err.message : "献立表の取得に失敗しました"))
      .finally(() => setLoading(false));
  };

  useEffect(loadMenus, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await api.uploadMenu(file);
      loadMenus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "アップロードに失敗しました");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <main id="main-content">
      <AppNav />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <h1>献立表の取り込み</h1>
      <div className="card">
        <p>保育園から配布された献立表（PDF または画像）をアップロードしてください。</p>
        <label className="button" style={{ display: "inline-block", cursor: "pointer" }}>
          {uploading ? "読み取り中..." : "献立表をアップロード"}
          <input type="file" accept=".pdf,image/png,image/jpeg,image/webp" onChange={handleUpload} hidden />
        </label>
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      </div>

      {loading ? (
        <p>読み込み中...</p>
      ) : menus.length === 0 ? (
        <div className="card">
          <p>まだ取り込んだ献立表がありません。上のボタンからアップロードしてください。</p>
        </div>
      ) : (
        menus.map((menu) => (
          <div className="card" key={menu.id}>
            <h2>{menu.date}</h2>
            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{menu.menu_text}</pre>
          </div>
        ))
      )}
      <Link href="/meal-plan" className="button">
        AI 献立提案へ進む
      </Link>
      </div>
    </main>
  );
}
