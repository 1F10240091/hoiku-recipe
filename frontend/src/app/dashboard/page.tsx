"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import ChildEditor from "@/components/ChildEditor";
import MutationStatus from "@/components/MutationStatus";
import { api, type Child, type User } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useMutation } from "@/lib/useMutation";

export default function DashboardPage() {
  const ready = useRequireAuth();
  const router = useRouter();
  const mutation = useMutation();
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [children, setChildren] = useState<Child[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (!ready) return;
    Promise.all([api.me(), api.listChildren(), api.listRecipeIngredients()]).then(([user, children, ingredients]) => {
      setUser(user); setUsername(user.username); setChildren(children); setIngredients(ingredients);
    }).catch((error: unknown) => setLoadError(error instanceof Error ? error.message : "読み込みに失敗しました。"))
      .finally(() => setLoading(false));
  }, [ready]);
  return <main className="main"><AppNav /><div className="container" style={{ paddingBottom: 80 }}>
    <div className="page-header"><p className="page-header__en">PROFILE</p><div className="child-card-heading"><h1 className="page-header__title">プロフィール</h1>
      <button className="button button--secondary button--sm" onClick={() => { localStorage.removeItem("token"); router.push("/login"); }}>ログアウト</button></div>
      <p className="page-header__subtitle">お子様の情報とアレルギー・好き嫌いを管理できます。</p></div>
    {loading ? <p className="loading" role="status">読み込み中…</p> : loadError ? <div className="alert alert--error" role="alert">{loadError}<button className="button button--secondary" onClick={() => window.location.reload()}>再読み込み</button></div> : <>
    <MutationStatus {...mutation} />
    <fieldset className="recipe-post-fields" disabled={Boolean(mutation.pending)} aria-busy={Boolean(mutation.pending)}>
      <form className="card" onSubmit={(event) => { event.preventDefault(); void mutation.run("プロフィールを保存中", async () => { const updated = await api.updateMe({username: username.trim()}); setUser(updated); setUsername(updated.username); }); }}>
        <h2 className="card__title">アカウント</h2><p>ユーザーネーム：<strong>{user?.username}</strong></p>
        <label className="form-field"><span>ユーザーネームの変更</span><input className="input" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={30} required /></label>
        <button className="button" disabled={!username.trim()}>プロフィールを保存</button>
      </form>
      <h2 style={{marginTop: 32}}>お子様管理</h2>
      <form className="card" onSubmit={(event) => { event.preventDefault(); if (!name.trim()) return; void mutation.run("お子様を追加中", async () => {
        const child = await api.createChild({name: name.trim(), birth_date: birth ? `${birth}-01` : null, allergies: [], preferences: []});
        setChildren((current) => [...current, child]); setName(""); setBirth("");
      }, "お子様を追加しました。"); }}>
        <h3 className="card__title">お子様を追加</h3>
        <label className="form-field"><span>名前</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="例：ゆうた" maxLength={100} required /></label>
        <label className="form-field"><span>生年月（任意）</span><input type="month" className="input" value={birth} onChange={(e) => setBirth(e.target.value)} /></label>
        <button className="button" disabled={!name.trim()}>{mutation.pending === "お子様を追加中" ? "追加中…" : "お子様を追加"}</button>
      </form>
    </fieldset>
    {children.length ? children.map((child) => <ChildEditor key={child.id} child={child} ingredients={ingredients}
      onChanged={(updated) => setChildren((current) => current.map((item) => item.id === updated.id ? updated : item))}
      onDeleted={(id) => setChildren((current) => current.filter((item) => item.id !== id))} />) : <div className="card"><p>お子様が登録されていません。上のフォームから登録できます。</p></div>}
    <div className="action-links"><Link href="/meal-plan" className="button">献立を作成する</Link></div>
    <form className="card" onSubmit={(event) => { event.preventDefault(); void mutation.run("ご意見を送信中", async () => {
      await api.submitFeedback(rating, comment); setSubmitted(true); setRating(null); setComment("");
    }, "ご意見を送信しました。"); }}><h2>ご意見ボックス</h2>
      {submitted ? <p role="status">ご協力ありがとうございました。<button className="button button--secondary" type="button" onClick={() => setSubmitted(false)}>追加で送る</button></p> : <fieldset className="recipe-post-fields" disabled={Boolean(mutation.pending)}>
        <label className="form-field"><span>満足度（1〜5）</span><select className="select" value={rating ?? ""} onChange={(e) => setRating(e.target.value ? Number(e.target.value) : null)}><option value="">未選択</option>{[1,2,3,4,5].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="form-field"><span>ご意見・ご要望</span><textarea className="textarea" rows={4} value={comment} maxLength={2000} onChange={(e) => setComment(e.target.value)} /></label>
        <button className="button" disabled={rating === null && !comment.trim()}>送信する</button>
      </fieldset>}
    </form>
    </>}
  </div></main>;
}
