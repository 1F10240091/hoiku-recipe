"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const MEAL_TYPE_LABELS: Record<string, string> = {
  main: "主菜",
  side: "副菜",
  soup: "汁物",
  staple: "主食",
};

interface SearchBarProps {
  initial?: {
    keyword?: string;
    meal_type?: string;
    ingredient?: string;
    max_cook_time?: number;
  };
}

export default function SearchBar({ initial = {} }: SearchBarProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initial.keyword ?? "");
  const [mealType, setMealType] = useState(initial.meal_type ?? "");
  const [ingredient, setIngredient] = useState(initial.ingredient ?? "");
  const [maxCookTime, setMaxCookTime] = useState(
    initial.max_cook_time ? String(initial.max_cook_time) : "",
  );
  const [ingredientSuggestions, setIngredientSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const query = ingredient.trim();
    if (!query) {
      setIngredientSuggestions([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      api.getIngredientSuggestions(query)
        .then((suggestions) => { if (!cancelled) setIngredientSuggestions(suggestions); })
        .catch(() => { if (!cancelled) setIngredientSuggestions([]); });
    }, 180);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [ingredient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (mealType) params.set("meal_type", mealType);
    if (ingredient.trim()) params.set("ingredient", ingredient.trim());
    if (maxCookTime) params.set("max_cook_time", maxCookTime);
    router.push(`/recipe-search?${params.toString()}`);
  };

  const handleReset = () => {
    setKeyword("");
    setMealType("");
    setIngredient("");
    setMaxCookTime("");
    router.push("/recipe-search");
  };

  return (
    <form
      className="card search-form"
      onSubmit={handleSubmit}
      aria-label="レシピ検索"
    >
      <div className="search-form__field search-form__field--keyword">
        <label htmlFor="search-keyword">キーワード</label>
        <input
          id="search-keyword"
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="レシピ名や作り方で検索"
        />
      </div>
      <div className="search-form__field">
        <label htmlFor="search-meal-type">カテゴリ</label>
        <select
          id="search-meal-type"
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
        >
          <option value="">すべて</option>
          {Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="search-form__field search-form__field--ingredient">
        <label htmlFor="search-ingredient">材料</label>
        <div className="ingredient-search-control">
          <input
            id="search-ingredient"
            type="text"
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
            aria-autocomplete="list"
            aria-expanded={showSuggestions && ingredientSuggestions.length > 0}
            aria-controls="ingredient-search-suggestions"
            placeholder="例: にんじん, 豚肉"
          />
          {showSuggestions && ingredientSuggestions.length > 0 && <ul className="ingredient-search-suggestions" id="ingredient-search-suggestions" role="listbox" aria-label="材料の検索候補">
            {ingredientSuggestions.map((suggestion) => <li key={suggestion} role="option" aria-selected="false">
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setIngredient(suggestion); setShowSuggestions(false); }}>
                {suggestion}{normalizeSuggestion(suggestion) !== normalizeSuggestion(ingredient) && <span>（候補）</span>}
              </button>
            </li>)}
          </ul>}
        </div>
      </div>
      <div className="search-form__field">
        <label htmlFor="search-max-time">調理時間（分以内）</label>
        <input
          id="search-max-time"
          type="number"
          min={1}
          max={180}
          value={maxCookTime}
          onChange={(e) => setMaxCookTime(e.target.value)}
          placeholder="例: 30"
        />
      </div>
      <div className="search-form__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={handleReset}
        >
          リセット
        </button>
        <button type="submit" className="button">
          検索
        </button>
      </div>
    </form>
  );
}

function normalizeSuggestion(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/[ァ-ヶ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));
}
