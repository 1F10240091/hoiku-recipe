import Link from "next/link";
import type { Recipe } from "@/lib/api";

const MEAL_TYPE_LABELS: Record<string, string> = {
  main: "主菜",
  side: "副菜",
  soup: "汁物",
  staple: "主食",
};

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const ingredientNames = recipe.ingredients
    .slice(0, 4)
    .map((i) => i.name)
    .join("、");
  const visual = recipe.meal_type === "soup" ? "🥣" : recipe.meal_type === "side" ? "🥗" : recipe.meal_type === "staple" ? "🍚" : "🍳";

  return (
    <article className="recipe-card">
      <div className="recipe-card__visual" aria-hidden="true">{visual}</div>
      <div className="recipe-card__header">
        <span className="recipe-card__badge">
          {MEAL_TYPE_LABELS[recipe.meal_type] ?? recipe.meal_type}
        </span>
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
