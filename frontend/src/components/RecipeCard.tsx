"use client";

import { useState } from "react";
import Link from "next/link";
import type { Recipe } from "@/lib/api";
import { api } from "@/lib/api";
import RecipePhoto from "@/components/RecipePhoto";

const MEAL_TYPE_LABELS: Record<string, string> = {
  main: "主菜",
  side: "副菜",
  soup: "汁物",
  staple: "主食",
};

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [favorite, setFavorite] = useState(Boolean(recipe.is_favorite));
  const [busy, setBusy] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");
  const ingredientNames = recipe.ingredients
    .slice(0, 4)
    .map((i) => i.name)
    .join("、");
  const toggleFavorite = async () => {
    setBusy(true);
    setFavoriteError("");
    try {
      const updated = await api.toggleFavorite(recipe.id);
      setFavorite(Boolean(updated.is_favorite));
    } catch {
      setFavoriteError("お気に入りの更新に失敗しました。再度お試しください。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="recipe-card">
      <div className="recipe-card__visual"><RecipePhoto recipe={recipe} /></div>
      <div className="recipe-card__header">
        <span className="recipe-card__badge">
          {MEAL_TYPE_LABELS[recipe.meal_type] ?? recipe.meal_type}
        </span>
        <button className={"favorite-toggle" + (favorite ? " favorite-toggle--active" : "")} type="button" onClick={toggleFavorite} disabled={busy} aria-label={favorite ? "お気に入りを解除" : "お気に入りに追加"} aria-pressed={favorite}>{favorite ? "♥" : "♡"}</button>
        {recipe.cook_time_minutes != null && (
          <span className="recipe-card__time">
            {recipe.cook_time_minutes}分
          </span>
        )}
        {(recipe.liked_count ?? 0) > 0 && (
          <span className="recipe-card__time">
            ♥ 喜ばれた {recipe.liked_count} 回
          </span>
        )}
      </div>
      <h3>{recipe.name}</h3>
      {favoriteError && <p className="recipe-card__error" role="status">{favoriteError}</p>}
      {recipe.cuisine && <p className="recipe-card__cuisine">{recipe.cuisine}料理</p>}
      {ingredientNames && (
        <ul className="recipe-card__ingredients">
          <li>{ingredientNames}</li>
        </ul>
      )}
      <Link href={`/recipe-master/${recipe.id}`} className="recipe-card__link">
        レシピを見る →
      </Link>
    </article>
  );
}
