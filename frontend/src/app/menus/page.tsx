"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import { api, type NurseryMenu, type MenuDraft } from "@/lib/api";
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
  const [editFoods, setEditFoods] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<MenuDraft[]>([]);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState("");
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const changeDraft = (index: number, patch: Partial<MenuDraft>) => setDrafts(current => current.map((item, i) => i === index ? { ...item, ...patch } : item));
  const confirmDrafts = async () => {
    setUploading(true); setError(null);
    try {
      await api.confirmMenus(drafts);
      const first = drafts[0]?.date;
      if (first) { setMonth(new Date(first + "T00:00:00")); setSelectedDate(first); }
      setDrafts([]); setUploadStatus("saved"); loadMenus();
    } catch (err) { setError(err instanceof Error ? err.message : "保存に失敗しました"); }
    finally { setUploading(false); }
  };

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
    if (!file || uploading || drafts.length) return;
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
      setDrafts(await api.previewMenus(file));
      setUploadStatus("idle");
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
    setEditFoods(Array.isArray(menu.ingredients.foods) ? menu.ingredients.foods.join("\n") : "");
  };

  const saveEdit = async (menuId: string) => {
    if (!editDate || !editText.trim()) return;
    setSavingId(menuId);
    setError(null);
    try {
      const updated = await api.updateMenu(menuId, { date: editDate, menu_text: editText.trim(), foods: editFoods.split("\n").map(s => s.trim()).filter(Boolean) });
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
              disabled={uploading || drafts.length > 0}
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
            <span className={drafts.length ? "is-active" : ""}>3. 確認・修正</span>
            <span className={uploadStatus === "saved" ? "is-done" : ""}>4. 保存</span>
          </div>
          {uploadStatus === "saved" && (
            <div className="alert alert--success">献立表を解析して保存しました。</div>
          )}
          {error && <div className="alert alert--error">{error}</div>}
          </div>
        </div>

        {drafts.length > 0 && <form className="card" onSubmit={e => { e.preventDefault(); void confirmDrafts(); }}>
          <h2>読み取り結果の確認（まだ保存されていません）</h2>
          <p>元の献立表と照らして日付・料理名・材料を確認してください。同じ日付の保存済み献立は置き換わります。</p>
          <fieldset disabled={uploading}>
          {drafts.map((draft, index) => <div className="card" key={index}>
            <label className="form-field">日付<input className="input" type="date" required value={draft.date || ""} onChange={e => changeDraft(index, { date: e.target.value })} /></label>
            {menus.some(m => m.date === draft.date) && <p role="note">この日付の献立は上書きされます。</p>}
            <label className="form-field">食事区分<input className="input" value={draft.meal_type} onChange={e => changeDraft(index, { meal_type: e.target.value })} /></label>
            <label className="form-field">料理名（1行に1品）<textarea className="textarea" required value={draft.dishes.join("\n")} onChange={e => changeDraft(index, { dishes: e.target.value.split("\n") })} /></label>
            <label className="form-field">材料欄から読み取った食材（1行に1つ）<textarea className="textarea" value={draft.ingredients.join("\n")} onChange={e => changeDraft(index, { ingredients: e.target.value.split("\n") })} /></label>
            <p className="note">材料欄がない場合は空欄です。空欄は「食材が含まれない」という意味ではありません。</p>
            <button className="button button--secondary" type="button" onClick={() => setDrafts(items => items.filter((_, i) => i !== index))}>この日を保存対象から外す</button>
          </div>)}
          <button className="button" disabled={uploading}>確認した献立を保存</button>
          <button className="button button--secondary" type="button" onClick={() => setDrafts([])}>読み取りを破棄</button>
          </fieldset>
        </form>}
        <section className="card" aria-label="献立カレンダー">
          <div className="child-card-actions">
            <button className="button button--secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>前月</button>
            <h2>{month.getFullYear()}年{month.getMonth() + 1}月</h2>
            <button className="button button--secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>翌月</button>
          </div>
          <div className="menu-calendar">
            {["日", "月", "火", "水", "木", "金", "土"].map(day => <div key={day}>{day}</div>)}
            {Array.from({ length: new Date(month.getFullYear(), month.getMonth(), 1).getDay() }, (_, i) => <div key={`blank-${i}`} />)}
            {Array.from({ length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() }, (_, i) => {
              const day = `${monthKey}-${String(i + 1).padStart(2, "0")}`;
              const entries = menus.filter(m => m.date === day);
              return <button type="button" key={day} className="menu-calendar__day" aria-pressed={selectedDate === day} aria-label={`${day} ${entries.length ? "献立あり" : "献立なし"}`} onClick={() => setSelectedDate(day)}>
                <strong>{i + 1}</strong><span>{entries.length ? entries.map(m => m.menu_text).join(" / ") : "—"}</span>
              </button>;
            })}
          </div>
          <p className="note">日付を選ぶと、その日の献立の編集・削除ができます。</p>
        </section>
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
          {!selectedDate && <p>カレンダーから日付を選んでください。</p>}
          {selectedDate && !menus.some(m => m.date === selectedDate) && <p>{selectedDate} の献立はありません。</p>}
          {menus.filter(menu => menu.date === selectedDate).map((menu) => (
            <div className="card menu-entry" key={menu.id}>
              {editingId === menu.id ? <div className="menu-edit-form">
                <label className="form-field"><span>日付</span><input type="date" className="input" value={editDate} onChange={(event) => setEditDate(event.target.value)} /></label>
                <label className="form-field"><span>献立内容</span><textarea className="textarea" rows={5} value={editText} onChange={(event) => setEditText(event.target.value)} /></label>
                <label className="form-field"><span>材料（1行に1つ）</span><textarea className="textarea" value={editFoods} onChange={e => setEditFoods(e.target.value)} /></label>
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
                <p className="note">読み取り材料：{Array.isArray(menu.ingredients.foods) && menu.ingredients.foods.length ? menu.ingredients.foods.join("・") : "未登録"}</p>
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
