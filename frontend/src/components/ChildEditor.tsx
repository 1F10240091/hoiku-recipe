"use client";
import { useState } from "react";
import { api, type Child } from "@/lib/api";
import { useMutation } from "@/lib/useMutation";
import { allergenCatalog, canonicalAllergen } from "@/lib/allergens";
import IngredientAutocomplete from "./IngredientAutocomplete";
import AllergenPicker from "./AllergenPicker";
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
  const standardNames = new Set(allergenCatalog.items.map((item) => item.name));
  const otherAllergies = child.allergies.filter((item) => !standardNames.has(canonicalAllergen(item.ingredient)));
  const customCandidates = ingredients.filter((name) => !standardNames.has(canonicalAllergen(name)) && !otherAllergies.some((item) => item.ingredient === name));
  const toggleStandard = (name: string) => {
    const matches = child.allergies.filter((item) => canonicalAllergen(item.ingredient) === name);
    void mutation.run(matches.length ? `${name}を解除中` : `${name}を登録中`, async () => {
      if (matches.length) {
        for (const item of matches) onChanged(await api.deleteAllergy(child.id, item.id));
      } else onChanged(await api.addAllergy(child.id, name));
    }, matches.length ? `${name}を解除しました。` : `${name}を登録しました。`);
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
      <AllergenPicker child={child} disabled={Boolean(mutation.pending)} onToggle={toggleStandard} />
      <h4>その他のアレルギー・自由入力</h4>
      {otherAllergies.length ? <ul className="list">{otherAllergies.map((item) => <li className="list__item" key={item.id}>
        <span className="badge">{item.ingredient}</span>
        <button type="button" className="button button--danger button--sm" aria-label={`${item.ingredient}のアレルギーを削除`} onClick={() => void mutation.run("アレルギーを削除中", async () => onChanged(await api.deleteAllergy(child.id, item.id)), "アレルギーを削除しました。")}>削除</button>
      </li>)}</ul> : <p className="card__text">未登録</p>}
      <form className="custom-allergy-form" onSubmit={(e) => { e.preventDefault(); addAllergy(); }}>
        <IngredientAutocomplete id={`allergy-${child.id}`} value={allergy} onChange={setAllergy} candidates={customCandidates} disabled={Boolean(mutation.pending)} />
        <button className="button custom-allergy-form__add" disabled={!allergy.trim()}>＋ 追加</button>
      </form>
      <p className="note" id={`allergy-${child.id}-hint`}>候補にない食材もEnterで登録できます。商品表示の原材料も確認してください。</p>
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
