"use client";
import { allergenCatalog, canonicalAllergen } from "@/lib/allergens";
import type { Child } from "@/lib/api";

type Props = { child: Child; disabled: boolean; onToggle: (name: string) => void };
export default function AllergenPicker({ child, disabled, onToggle }: Props) {
  const selected = new Set(child.allergies.map((item) => canonicalAllergen(item.ingredient)));
  const count = allergenCatalog.items.filter((item) => selected.has(item.name)).length;
  return <div className="allergen-picker" aria-label={`${child.name}の29品目から選ぶアレルギー`}>
    <div className="allergen-picker__heading"><h4>29品目からかんたん選択</h4><span>{count}品目を登録中</span></div>
    <p className="note">該当するものを押すと保存します。もう一度押すと解除できます。</p>
    {([ ["required", "表示義務の対象（9品目）"], ["recommended", "表示推奨の対象（20品目）"] ] as const).map(([group, title]) => <details className="allergen-picker__group" key={group}>
      <summary className="allergen-picker__summary"><span>{title}</span><span className="allergen-picker__chevron" aria-hidden="true">∨</span></summary><div className="allergen-picker__options" role="group" aria-label={title}>
        {allergenCatalog.items.filter((item) => item.group === group).map((item) => {
          const active = selected.has(item.name);
          return <button type="button" key={item.name} className={`allergen-chip${active ? " allergen-chip--selected" : ""}`}
            aria-pressed={active} aria-label={`${item.label}を${active ? "解除" : "登録"}`} disabled={disabled} onClick={() => onToggle(item.name)}>
            <span className="allergen-chip__mark" aria-hidden="true">{active ? "✓" : "+"}</span>{item.label}
          </button>;
        })}
      </div>
    </details>)}
    <p className="allergen-picker__source"><a href={allergenCatalog.source_url} target="_blank" rel="noreferrer">消費者庁・2026年4月版に基づく29品目</a></p>
    <p className="note">未選択は「安全」の判定ではありません。実際の商品表示も確認してください。</p>
  </div>;
}
