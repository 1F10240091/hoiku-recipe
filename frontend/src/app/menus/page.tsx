"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import { api, type NurseryMenu } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";

export default function MenusPage() {
  const authReady = useRequireAuth();
  const [menus, setMenus] = useState<NurseryMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "saved">("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMenus = () => {
    api
      .listMenus()
      .then(setMenus)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "献立表の取得に失敗しました",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authReady) loadMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady]);

  const uploadFile = async (file?: File) => {
    if (!file) return;
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("PDF・PNG・JPEG・WebPのファイルを選択してください");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("ファイルサイズは15MB以下にしてください");
      return;
    }
    setUploading(true);
    setUploadStatus("uploading");
    setError(null);
    try {
      await api.uploadMenu(file);
      setUploadStatus("saved");
      loadMenus();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "アップロードに失敗しました",
      );
    } finally {
      setUploading(false);
      if (!error) {
        window.setTimeout(() => setUploadStatus("idle"), 2500);
      }
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await uploadFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    await uploadFile(e.dataTransfer.files?.[0]);
  };

  return (
    <main className="main">
      <AppNav />
      <div className="container" style={{ paddingBottom: 80 }}>
        <div className="page-header">
          <p className="page-header__en">MENU SCAN</p>
          <h1 className="page-header__title">献立表の取り込み</h1>
          <p className="page-header__subtitle">
            保育園から配布された献立表を読み取り、デジタル化します。
          </p>
        </div>
        <div
          className={"card menu-upload-card" + (isDragging ? " menu-upload-card--dragging" : "")}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            if (e.currentTarget === e.target) setIsDragging(false);
          }}
          onDrop={handleDrop}
        >
          <p className="card__text">
            保育園から配布された献立表（PDF
            または画像）をアップロードしてください。
          </p>
          <div className="privacy-note" role="note">
            <strong>取り扱いについて</strong>
            <br />
            アップロードした献立表は解析のためGemini APIへ送信されます。
            解析以外の目的では使用せず、アプリ内の献立データとして保存します。
            個人名などが含まれる場合は、必要に応じて隠してからアップロードしてください。
          </div>
          <p className="drop-hint">ここにPDF・画像をドラッグ＆ドロップ</p>
          <label
            className="button upload-button"
            style={{ display: "inline-block", cursor: "pointer" }}
          >
            {uploading ? "解析中..." : "PDF・画像を選ぶ"}
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              onChange={handleUpload}
              hidden
            />
          </label>
          <div className="upload-status" aria-live="polite">
            <span className={uploadStatus === "uploading" ? "is-active" : ""}>1. アップロード</span>
            <span className={uploadStatus === "uploading" ? "is-active" : uploadStatus === "saved" ? "is-done" : ""}>2. AI解析</span>
            <span className={uploadStatus === "saved" ? "is-done" : ""}>3. 保存</span>
          </div>
          {uploadStatus === "saved" && (
            <div className="alert alert--success">献立表を解析して保存しました。</div>
          )}
          {error && <div className="alert alert--error">{error}</div>}
        </div>

        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : menus.length === 0 ? (
          <div className="card">
            <p className="card__text">
              まだ取り込んだ献立表がありません。上のボタンからアップロードしてください。
            </p>
          </div>
        ) : (
          <>
            <p className="section-caption">保存済みの献立（{menus.length}件）</p>
          {menus.map((menu) => (
            <div className="card" key={menu.id}>
              <h2>{menu.date}</h2>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  margin: 0,
                }}
              >
                {menu.menu_text}
              </pre>
            </div>
          ))}
          </>
        )}
        <div className="action-links">
          <Link href="/meal-plan" className="button">
            こんだて提案へ進む
          </Link>
        </div>
      </div>
    </main>
  );
}
