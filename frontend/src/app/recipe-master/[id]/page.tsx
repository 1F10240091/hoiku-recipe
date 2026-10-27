"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import { api, type Recipe } from "@/lib/api";
import RecipePhoto from "@/components/RecipePhoto";

const MEAL_TYPE_LABELS: Record<string, string> = {
  main: "主菜",
  side: "副菜",
  soup: "汁物",
  staple: "主食",
};

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getRecipe(id)
      .then(setRecipe)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "レシピの取得に失敗しました"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <main className="main">
      <AppNav />
      <div className="container" style={{ paddingBottom: 80 }}>
        <div className="page-header">
          <p className="page-header__en">RECIPE</p>
          <p style={{ marginBottom: 16 }}>
            <Link
              href="/recipe-search"
              style={{ color: "var(--color-pink-deep)", fontWeight: "bold" }}
            >
              ← レシピ検索に戻る
            </Link>
          </p>
        </div>

        {loading && (
          <div className="card">
            <p>読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="card" role="alert">
            <p>{error}</p>
          </div>
        )}

        {recipe && !loading && (
          <article className="card">
            <div className="recipe-detail__visual"><RecipePhoto recipe={recipe} /></div>
            <header style={{ marginBottom: 16 }}>
              <span className="recipe-card__badge">
                {MEAL_TYPE_LABELS[recipe.meal_type] ?? recipe.meal_type}
              </span>
              {recipe.cook_time_minutes != null && (
                <span className="recipe-card__time" style={{ marginLeft: 8 }}>
                  {recipe.cook_time_minutes}分
                </span>
              )}
              <h1 style={{ marginTop: 8 }}>{recipe.name}</h1>
            </header>

            <section aria-label="対象と出典" style={{ marginBottom: 24 }}>
              <p><strong>対象年齢の目安：</strong>{recipe.age_min_months != null && recipe.age_max_months != null ? `${recipe.age_min_months}〜${recipe.age_max_months}か月` : "年齢に応じて調整"}</p>
              {recipe.servings_note && <p><strong>分量：</strong>{recipe.servings_note}</p>}
              {recipe.child_notes && <p><strong>子ども向けのポイント：</strong>{recipe.child_notes}</p>}
              {recipe.source_url && <p><strong>出典：</strong><a href={recipe.source_url} target="_blank" rel="noreferrer">{recipe.source_name ?? "参照元を開く"} ↗</a></p>}
            </section>

            <h2>材料</h2>
            <ul className="recipe-detail__ingredients">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>
                  {ing.name}
                  {ing.quantity ? ` ${ing.quantity}` : ""}
                  {ing.unit ? ing.unit : ""}
                  {Boolean(ing.components?.length) && <small>（原材料：{ing.components?.join("、")}）</small>}
                </li>
              ))}
            </ul>

            {recipe.instructions && (
              <>
                <h2>作り方</h2>
                <div className="recipe-detail__instructions">
                  <ol>
                    {recipe.instructions
                      .split(/\n+/)
                      .filter((s) => s.trim())
                      .map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                  </ol>
                </div>
              </>
            )}
          </article>
        )}
      </div>
    </main>
  );
}
