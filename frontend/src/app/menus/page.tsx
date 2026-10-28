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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editText, setEditText] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

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
  }, [authReady]);

  const uploadFile = async (file?: File) => {
    if (!file || uploading) return;
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("PDF・PNG・JPEG・WebPのファイルを選択してください");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("ファイルサイズは4MB以下にしてください");
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
      setUploadStatus("idle");
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

  const startEdit = (menu: NurseryMenu) => {
    setEditingId(menu.id);
    setEditDate(menu.date);
    setEditText(menu.menu_text);
  };

  const saveEdit = async (menuId: string) => {
    if (!editDate || !editText.trim()) return;
    setSavingId(menuId);
    setError(null);
    try {
      const updated = await api.updateMenu(menuId, { date: editDate, menu_text: editText.trim() });
      setMenus((current) => current.map((menu) => menu.id === menuId ? updated : menu).sort((a, b) => a.date.localeCompare(b.date)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "献立の保存に失敗しました");
    } finally {
      setSavingId(null);
    }
  };

  const deleteMenu = async (menu: NurseryMenu) => {
    if (!window.confirm(`${menu.date}の献立を削除しますか？`)) return;
    setSavingId(menu.id);
    setError(null);
    try {
      await api.deleteMenu(menu.id);
      setMenus((current) => current.filter((item) => item.id !== menu.id));
      if (editingId === menu.id) setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "献立の削除に失敗しました");
    } finally {
      setSavingId(null);
    }
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
          <label className="menu-drop-zone" htmlFor="menu-file-input" aria-disabled={uploading}>
            <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
              <path d="M13 34h23a8 8 0 0 0 .6-16 13 13 0 0 0-24.8 3A6.5 6.5 0 0 0 13 34Z" />
              <path d="M24 30V19m-5 5 5-5 5 5" />
            </svg>
            <span className="menu-drop-zone__title">{uploading ? "解析中…" : "献立表をアップロード"}</span>
            <span className="menu-drop-zone__hint">またはクリックしてファイルを選択</span>
            <span className="menu-drop-zone__formats">PDF・PNG・JPEG・WebP（4MB以下）</span>
            <input
              id="menu-file-input"
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              onChange={handleUpload}
              disabled={uploading}
              hidden
            />
          </label>
          <div className="menu-upload-details">
          <p className="card__text">
            保育園から配布された献立表をアップロードしてください。
          </p>
          <div className="privacy-note" role="note">
            <strong>取り扱いについて</strong>
            <br />
            アップロードした献立表は解析のためGemini APIへ送信されます。
            解析以外の目的では使用せず、アプリ内の献立データとして保存します。
            個人名などが含まれる場合は、必要に応じて隠してからアップロードしてください。
          </div>
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
            <div className="card menu-entry" key={menu.id}>
              {editingId === menu.id ? <div className="menu-edit-form">
                <label className="form-field"><span>日付</span><input type="date" className="input" value={editDate} onChange={(event) => setEditDate(event.target.value)} /></label>
                <label className="form-field"><span>献立内容</span><textarea className="textarea" rows={5} value={editText} onChange={(event) => setEditText(event.target.value)} /></label>
                <div className="child-card-actions">
                  <button className="button" type="button" disabled={savingId === menu.id || !editText.trim()} onClick={() => void saveEdit(menu.id)}>{savingId === menu.id ? "保存中…" : "保存"}</button>
                  <button className="button button--secondary" type="button" disabled={savingId === menu.id} onClick={() => setEditingId(null)}>取り消し</button>
                </div>
              </div> : <>
                <div className="child-card-heading"><h2>{menu.date}</h2><div className="child-card-actions">
                  <button className="button button--secondary button--sm" type="button" disabled={Boolean(savingId)} onClick={() => startEdit(menu)}>編集</button>
                  <button className="button button--danger button--sm" type="button" disabled={Boolean(savingId)} onClick={() => void deleteMenu(menu)}>削除</button>
                </div></div>
                <pre className="menu-entry__text">{menu.menu_text}</pre>
              </>}
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
