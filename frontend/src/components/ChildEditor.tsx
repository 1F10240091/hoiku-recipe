"use client";
import { useState } from "react";
import { api, type Child } from "@/lib/api";
import { useMutation } from "@/lib/useMutation";
import MutationStatus from "./MutationStatus";

export default function ChildEditor({ child, ingredients, onChanged, onDeleted }: {
  child: Child; ingredients: string[]; onChanged: (child: Child) => void; onDeleted: (id: string) => void;
}) {
  const mutation = useMutation();
  const [allergy, setAllergy] = useState("");
  const [preference, setPreference] = useState("");
  const [mode, setMode] = useState("exclude");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(child.name);
  const [birth, setBirth] = useState(child.birth_date?.slice(0, 7) ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const addAllergy = () => {
    if (!allergy.trim()) return;
    void mutation.run("アレルギーを保存中", async () => {
      onChanged(await api.addAllergy(child.id, allergy.trim())); setAllergy("");
    }, "アレルギーを追加しました。");
  };
  return <section className="card" aria-label={`${child.name}の情報`} aria-busy={Boolean(mutation.pending)}>
    <div className="child-card-heading"><h2>{child.name}</h2><div className="child-card-actions">
      <button type="button" className="button button--secondary button--sm" disabled={Boolean(mutation.pending)} onClick={() => setEditing(!editing)}>編集</button>
      <button type="button" className="button button--danger button--sm" disabled={Boolean(mutation.pending)} onClick={() => setConfirmDelete(true)}>お子様を削除</button>
    </div></div>
    <MutationStatus {...mutation} />
    {confirmDelete && <div className="delete-confirm" role="group" aria-label="削除の確認">
      <p>「{child.name}」と、このお子様のアレルギー・好き嫌いを削除します。元に戻せません。</p>
      <button type="button" className="button button--danger" disabled={Boolean(mutation.pending)} onClick={() => void mutation.run("お子様を削除中", async () => { await api.deleteChild(child.id); onDeleted(child.id); }, "削除しました。")}>削除する</button>{" "}
      <button type="button" className="button button--secondary" disabled={Boolean(mutation.pending)} onClick={() => setConfirmDelete(false)}>キャンセル</button>
    </div>}
    {editing ? <form onSubmit={(event) => { event.preventDefault(); void mutation.run("お子様の情報を保存中", async () => {
      onChanged(await api.updateChild(child.id, { name: name.trim(), birth_date: birth ? `${birth}-01` : null })); setEditing(false);
    }); }}>
      <fieldset className="recipe-post-fields" disabled={Boolean(mutation.pending)}>
        <label className="form-field"><span>名前</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required /></label>
        <label className="form-field"><span>生年月</span><input className="input" type="month" value={birth} onChange={(e) => setBirth(e.target.value)} /></label>
        <button className="button" disabled={!name.trim()}>変更を保存</button>
      </fieldset>
    </form> : <p className="card__text">生年月：{child.birth_date ? child.birth_date.slice(0,7).replace("-", "年") + "月" : "未設定"}</p>}
    <fieldset className="recipe-post-fields" disabled={Boolean(mutation.pending)}>
      <h3>アレルギー</h3>
      {child.allergies.length ? <ul className="list">{child.allergies.map((item) => <li className="list__item" key={item.id}>
        <span className="badge">{item.ingredient}</span>
        <button type="button" className="button button--danger button--sm" aria-label={`${item.ingredient}のアレルギーを削除`} onClick={() => void mutation.run("アレルギーを削除中", async () => onChanged(await api.deleteAllergy(child.id, item.id)), "アレルギーを削除しました。")}>削除</button>
      </li>)}</ul> : <p className="card__text">未登録</p>}
      <form className="input-row" onSubmit={(e) => { e.preventDefault(); addAllergy(); }}>
        <label className="sr-only" htmlFor={`allergy-${child.id}`}>アレルギー食材</label>
        <input id={`allergy-${child.id}`} className="input" list={`ingredients-${child.id}`} value={allergy} onChange={(e) => setAllergy(e.target.value)} placeholder="食材を入力してEnter（例：卵、小麦）" maxLength={100} />
        <datalist id={`ingredients-${child.id}`}>{ingredients.map((name) => <option key={name} value={name} />)}</datalist>
        <button className="button button--secondary" disabled={!allergy.trim()}>追加</button>
      </form>
      <p className="note">候補にない食材も登録できます。商品表示の原材料も確認してください。</p>
      <h3>好き嫌い</h3>
      {child.preferences.length ? <ul className="list">{child.preferences.map((item) => <li className="list__item" key={item.id}>
        <span>{item.ingredient}（{item.mode === "exclude" ? "除外" : "改善優先"}）</span>
        <button type="button" className="button button--danger button--sm" aria-label={`${item.ingredient}の好みを削除`} onClick={() => void mutation.run("好みを削除中", async () => onChanged(await api.deletePreference(child.id, item.id)), "好みを削除しました。")}>削除</button>
      </li>)}</ul> : <p className="card__text">未登録</p>}
      <form className="input-row" onSubmit={(e) => { e.preventDefault(); if (preference.trim()) void mutation.run("好みを保存中", async () => { onChanged(await api.addPreference(child.id, preference.trim(), mode)); setPreference(""); }); }}>
        <input className="input" value={preference} onChange={(e) => setPreference(e.target.value)} placeholder="食材を入力してEnter" aria-label="好き嫌いの食材" maxLength={100} />
        <select className="select" value={mode} onChange={(e) => setMode(e.target.value)} aria-label="好みの扱い"><option value="exclude">除外</option><option value="improve">改善優先</option></select>
        <button className="button button--secondary" disabled={!preference.trim()}>追加</button>
      </form>
    </fieldset>
  </section>;
}
