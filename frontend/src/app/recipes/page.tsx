"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import LikeButton from "@/components/LikeButton";
import {
  api,
  type LikesSummary,
  type Recipe,
  type SuggestedMeal,
} from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";

const MEAL_TYPE_LABELS: Record<string, string> = {
  main: "主菜",
  side: "副菜",
  soup: "汁物",
  staple: "主食",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export default function RecipesPage() {
  const authReady = useRequireAuth();
  const [recipes, setRecipes] = useState<SuggestedMeal[]>([]);
  const [recipeMap, setRecipeMap] = useState<Record<string, Recipe>>({});
  const [likes, setLikes] = useState<LikesSummary>({ liked: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) return;
    Promise.all([api.listMealRecipes(), api.listRecipes(), api.listLikes()])
      .then(([meals, master, likeSummary]) => {
        setRecipes(meals);
        setRecipeMap(Object.fromEntries(master.map((r) => [r.id, r])));
        setLikes(likeSummary);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "献立の読み込みに失敗しました",
        );
      })
      .finally(() => setLoading(false));
  }, [authReady]);

  const isLiked = (mealId: string, recipeId: string) =>
    likes.liked.some(
      (l) => l.meal_id === mealId && l.recipe_id === recipeId,
    );

  const handleToggled = (
    mealId: string,
    recipeId: string,
    liked: boolean,
    count: number,
  ) => {
    setLikes((prev) => {
      const others = prev.liked.filter(
        (l) => !(l.meal_id === mealId && l.recipe_id === recipeId),
      );
      return {
        liked: liked
          ? [...others, { meal_id: mealId, recipe_id: recipeId }]
          : others,
        counts: { ...prev.counts, [recipeId]: count },
      };
    });
  };

  return (
    <main className="main">
      <AppNav />
      <div className="container" style={{ paddingBottom: 80 }}>
        <div className="page-header">
          <p className="page-header__en">MENU LOG</p>
          <h1 className="page-header__title">レシピ・買い物リスト</h1>
          <p className="page-header__subtitle">
            提案された献立の詳細を確認できます。子どもが喜んだ料理には
            ハート（♡）を押すと、レシピ一覧に回数が記録されます。
          </p>
        </div>
        {error && (
          <div className="card" role="alert">
            <p>{error}</p>
          </div>
        )}
        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : recipes.length === 0 ? (
          <div className="card">
            <p className="card__text">まだ提案された献立がありません。</p>
            <Link href="/meal-plan" className="button">
              献立を作成する
            </Link>
          </div>
        ) : (
          recipes.map((meal) => {
            const recipeIds =
              (meal.ingredients.recipe_ids as string[] | undefined) ?? [];
            const dishNames =
              (meal.ingredients.dishes as string[] | undefined) ?? [];
            return (
              <div className="card" key={meal.id}>
                <h2 style={{ marginTop: 0 }}>{formatDate(meal.date)}</h2>
                {recipeIds.length > 0 ? (
                  <div>
                    {recipeIds.map((recipeId, index) => {
                      const recipe = recipeMap[recipeId];
                      const name =
                        recipe?.name ?? dishNames[index] ?? "料理";
                      return (
                        <div className="dish-row" key={`${meal.id}-${recipeId}`}>
                          <div className="dish-row__main">
                            <span className="dish-row__name">{name}</span>
                            {recipe?.meal_type && (
                              <span className="dish-row__meta">
                                {MEAL_TYPE_LABELS[recipe.meal_type] ??
                                  recipe.meal_type}
                              </span>
                            )}
                            {recipe?.cook_time_minutes != null && (
                              <span className="dish-row__meta">
                                {recipe.cook_time_minutes}分
                              </span>
                            )}
                            <Link
                              href={`/recipe-master/${recipeId}`}
                              className="dish-row__meta"
                            >
                              レシピを見る →
                            </Link>
                          </div>
                          <LikeButton
                            mealId={meal.id}
                            recipeId={recipeId}
                            liked={isLiked(meal.id, recipeId)}
                            count={likes.counts[recipeId] ?? 0}
                            onToggled={handleToggled}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      fontFamily: "inherit",
                      margin: 0,
                    }}
                  >
                    {meal.menu_text}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
