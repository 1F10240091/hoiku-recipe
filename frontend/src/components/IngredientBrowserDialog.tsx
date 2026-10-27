"use client";
import { useEffect, useRef, useState } from "react";
import { canonicalAllergen, relatedAllergens } from "@/lib/allergens";
import { ingredientSuggestions } from "@/lib/ingredient-suggestions";

type Props = { id: string; candidates: string[]; selected: string[]; onChoose: (name: string) => void; onDismiss: () => void };
export default function IngredientBrowserDialog({ id, candidates, selected, onChoose, onDismiss }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const all = ingredientSuggestions(candidates, "", Number.POSITIVE_INFINITY);
  const matches = ingredientSuggestions(all, query, Number.POSITIVE_INFINITY);
  const registered = new Set(selected.map(canonicalAllergen));
  useEffect(() => { dialog.current?.showModal(); }, []);
  const close = () => dialog.current?.close();
  return <dialog ref={dialog} className="ingredient-browser" aria-labelledby={`${id}-title`} onClose={onDismiss}>
    <div className="ingredient-browser__header"><div><p className="ingredient-browser__eyebrow">食材を探す</p><h2 id={`${id}-title`}>レシピの食材一覧</h2></div>
      <button type="button" className="ingredient-browser__close" onClick={close} aria-label="食材一覧を閉じる">×</button>
    </div>
    <p className="ingredient-browser__description">食材名のほか「小麦」でうどん・パンなどの関連食材も検索できます。関連表示は照合の目安です。商品の原材料も確認してください。</p>
    <label className="sr-only" htmlFor={`${id}-search`}>すべての食材から検索</label>
    <input id={`${id}-search`} type="search" className="input ingredient-browser__search" placeholder="食材名で検索（ひらがな・カタカナ対応）"
      value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing) event.preventDefault(); }} />
    <p className="ingredient-browser__count" role="status">{query.trim() ? `${matches.length}件が一致 ／ 全${all.length}件` : `すべての食材 ${all.length}件`}</p>
    <div className="ingredient-browser__results">
      {matches.length ? <ul className="ingredient-browser__grid">{matches.map((name) => {
        const active = registered.has(canonicalAllergen(name));
        const related = relatedAllergens(name);
        return <li key={name}><button type="button" className={`ingredient-browser__item${active ? " is-registered" : ""}`} disabled={active}
          onClick={() => { onChoose(name); close(); }}>
          <span>{name}</span>
          {related.length > 0 && <span className="ingredient-browser__related">関連：{related.join("・")}</span>}
          <span className="ingredient-browser__item-action">{active ? "✓ 登録済み" : "+ 選択"}</span>
        </button></li>;
      })}</ul> : <div className="ingredient-browser__empty"><p>{all.length ? "一致する食材がありません。" : "レシピに登録された食材はまだありません。"}</p><p>一覧にない食材は、元の入力欄から自由に登録できます。</p></div>}
    </div>
    <div className="ingredient-browser__footer"><span>登録済みの食材も含めて表示しています</span><button type="button" className="button button--secondary button--sm" onClick={close}>閉じる</button></div>
  </dialog>;
}
