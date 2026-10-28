"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import ChildCreateDialog from "@/components/ChildCreateDialog";
import ChildEditor from "@/components/ChildEditor";
import MutationStatus from "@/components/MutationStatus";
import { api, type Child, type User } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useMutation } from "@/lib/useMutation";
import { allergenCatalog, canonicalAllergen } from "@/lib/allergens";

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
  const [showCreate, setShowCreate] = useState(false);
  const [childNotice, setChildNotice] = useState("");
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [initialAllergies, setInitialAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState("");
  const birthYear = birth.split("-")[0] ?? "";
  const birthMonth = birth.split("-")[1] ?? "";
  const setBirthPart = (part: "year" | "month", value: string) => {
    const [year = "", month = ""] = birth.split("-");
    const nextYear = part === "year" ? value : year;
    const nextMonth = part === "month" ? value : month;
    setBirth(nextYear || nextMonth ? `${nextYear}-${nextMonth}` : "");
  };
  const toggleInitialAllergy = (ingredient: string) => {
    setInitialAllergies((current) => current.some((item) => canonicalAllergen(item) === ingredient)
      ? current.filter((item) => canonicalAllergen(item) !== ingredient)
      : [...current, ingredient]);
  };
  const addCustomAllergy = () => {
    const value = customAllergy.trim();
    if (!value || initialAllergies.some((item) => canonicalAllergen(item) === canonicalAllergen(value))) return;
    setInitialAllergies((current) => [...current, value]);
    setCustomAllergy("");
  };
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (!ready) return;
    Promise.all([api.me(), api.listChildren(), api.listRecipeIngredients(true)]).then(([user, children, ingredients]) => {
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
      <div className="child-card-heading" style={{marginTop: 32, marginBottom: 16}}><h2>お子様管理</h2>
        {children.length > 0 && <button className="button" type="button" onClick={() => setShowCreate(true)}>＋ お子様を追加</button>}
      </div>
      {children.length === 0 && <form className="card" onSubmit={(event) => { event.preventDefault(); if (!name.trim()) return; void mutation.run("お子様を追加中", async () => {
        const child = await api.createChild({name: name.trim(), birth_date: birthYear && birthMonth ? `${birthYear}-${birthMonth}-01` : null, allergies: initialAllergies.map((ingredient) => ({ingredient})), preferences: []});
        setChildren((current) => [...current, child]); setName(""); setBirth(""); setInitialAllergies([]);
      }, "お子様を追加しました。"); }}>
        <h3 className="card__title">お子様を追加</h3>
        <label className="form-field"><span>名前</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="例：ゆうた" maxLength={100} required /></label>
        <div className="form-field"><span>生年月（任意）</span>
          <input type="month" className="input birth-month-input" value={birth} onChange={(e) => setBirth(e.target.value)} />
          <div className="birth-month-selects">
            <select className="select" aria-label="生まれた年" value={birthYear} onChange={(e) => setBirthPart("year", e.target.value)}><option value="">年を選択</option>{Array.from({length: Math.max(0, new Date().getFullYear() - 2015 + 1)}, (_, index) => 2015 + index).map((year) => <option key={year} value={year}>{year}年</option>)}</select>
            <select className="select" aria-label="生まれた月" value={birthMonth} onChange={(e) => setBirthPart("month", e.target.value)}><option value="">月を選択</option>{Array.from({length: 12}, (_, index) => index + 1).map((month) => <option key={month} value={String(month).padStart(2, "0")}>{month}月</option>)}</select>
          </div>
        </div>
        <section className="allergen-picker" aria-label="アレルギー登録">
          <div className="allergen-picker__heading"><h4>アレルギー（任意）</h4><span>{initialAllergies.length}品目を登録中</span></div>
          <p className="note">該当する食材を選択してください。登録後もいつでも追加できます。</p>
          {([ ["required", "9品目"], ["recommended", "20品目"] ] as const).map(([group, title]) => <details className="allergen-picker__group" key={group}>
            <summary className="allergen-picker__summary"><span>{title}</span><span className="allergen-picker__chevron" aria-hidden="true">▼</span></summary>
            <div className="allergen-picker__options" role="group" aria-label={title}>
              {allergenCatalog.items.filter((item) => item.group === group).map((item) => {
                const active = initialAllergies.some((value) => canonicalAllergen(value) === item.name);
                return <button type="button" key={item.name} className={`allergen-chip${active ? " allergen-chip--selected" : ""}`} aria-pressed={active} onClick={() => toggleInitialAllergy(item.name)}><span className="allergen-chip__mark" aria-hidden="true">{active ? "✓" : "+"}</span>{item.label}</button>;
              })}
            </div>
          </details>)}
          <p className="allergen-picker__source"><a href={allergenCatalog.source_url} target="_blank" rel="noreferrer">消費者庁・2026年4月版に基づく29品目</a></p>
          <ul className="list">{initialAllergies.filter((value) => !allergenCatalog.items.some((item) => item.name === canonicalAllergen(value))).map((value) => <li className="list__item" key={value}><span>{value}</span><button type="button" className="button button--danger button--sm" onClick={() => toggleInitialAllergy(value)}>削除</button></li>)}</ul>
          <div className="custom-allergy-form">
            <input className="input" value={customAllergy} onChange={(event) => setCustomAllergy(event.target.value)} maxLength={100} placeholder="その他のアレルギー" aria-label="その他のアレルギー" />
            <button type="button" className="button custom-allergy-form__add" disabled={!customAllergy.trim()} onClick={addCustomAllergy}>＋ 追加</button>
          </div>
          <p className="note">未選択でも安全とは限りません。アレルギーがある場合は、商品パッケージの原材料表示もご確認ください。</p>
        </section>
        <button className="button" disabled={!name.trim()}>{mutation.pending === "お子様を追加中" ? "追加中…" : "お子様を追加"}</button>
      </form>}
    </fieldset>
    {childNotice && <p className="mutation-success" role="status">{childNotice}</p>}
    {showCreate && <ChildCreateDialog onCreated={(child) => { setChildren((current) => [...current, child]); setChildNotice(`${child.name}さんを追加しました。`); }} onDismiss={() => setShowCreate(false)} />}
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
