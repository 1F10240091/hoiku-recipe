"use client";
import { useEffect, useRef, useState } from "react";
import { ingredientSuggestions } from "@/lib/ingredient-suggestions";

type Props = { id: string; value: string; onChange: (value: string) => void; candidates: string[]; disabled: boolean };
export default function IngredientAutocomplete({ id, value, onChange, candidates, disabled }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const suggestions = ingredientSuggestions(candidates, value);
  const visible = open && !disabled;
  const listId = `${id}-suggestions`;
  const activeIndex = active < suggestions.length ? active : -1;
  useEffect(() => {
    if (visible && activeIndex >= 0) root.current?.querySelectorAll<HTMLElement>('[role="option"]')[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [visible, activeIndex]);
  const choose = (name: string) => { onChange(name); setOpen(false); setActive(-1); };
  return <div ref={root} className="ingredient-autocomplete" onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setActive(-1); }
  }}>
    <label className="sr-only" htmlFor={id}>その他のアレルギー食材</label>
    <div className="ingredient-autocomplete__field">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg>
      <input id={id} className="input" value={value} maxLength={100} autoComplete="off" disabled={disabled}
        placeholder="食材名を入力（例：にんじん、トマト）" role="combobox" aria-autocomplete="list" aria-expanded={visible}
        aria-controls={visible ? listId : undefined} aria-activedescendant={visible && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        aria-describedby={`${id}-hint`}
        onFocus={() => setOpen(true)} onChange={(event) => { onChange(event.target.value); setOpen(true); setActive(-1); }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === "ArrowDown" && suggestions.length) {
            event.preventDefault(); setOpen(true); setActive(visible ? (activeIndex + 1) % suggestions.length : 0);
          } else if (event.key === "ArrowUp" && suggestions.length) {
            event.preventDefault(); setOpen(true); setActive(visible && activeIndex > 0 ? activeIndex - 1 : suggestions.length - 1);
          } else if (event.key === "Escape") {
            if (visible) { event.preventDefault(); event.stopPropagation(); setOpen(false); setActive(-1); }
          } else if (event.key === "Enter" && visible && activeIndex >= 0) {
            event.preventDefault(); choose(suggestions[activeIndex]);
          } else if (event.key === "Enter") {
            setOpen(false); setActive(-1);
          }
        }} />
    </div>
    {visible && <div className="ingredient-autocomplete__panel">
      <div className="ingredient-autocomplete__heading"><span>{value.trim() ? "入力に合う食材" : "食材の候補"}</span><span>{suggestions.length}件</span></div>
      <div role="listbox" id={listId} aria-label="29品目以外の食材候補">
        {suggestions.map((name, index) => <button type="button" role="option" tabIndex={-1} id={`${listId}-${index}`} key={name}
          aria-selected={activeIndex === index} className={`ingredient-autocomplete__option${activeIndex === index ? " is-active" : ""}`}
          onMouseDown={(event) => event.preventDefault()} onClick={() => choose(name)}>
          <span>{name}</span><span className="ingredient-autocomplete__select" aria-hidden="true">選択 <span>↗</span></span>
        </button>)}
      </div>
      <p className="ingredient-autocomplete__footer">{suggestions.length ? "候補を選ぶか、食材名を入力して追加" : "候補がなくても、入力した名前で追加できます"}</p>
    </div>}
  </div>;
}
