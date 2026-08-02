"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import { api, type SuggestedMeal } from "@/lib/api";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<SuggestedMeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listMealRecipes()
      .then(setRecipes)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="main">
      <AppNav />
      <div className="container" style={{ paddingBottom: 80 }}>
        <div className="page-header">
          <h1 className="page-header__title">レシピ・買い物リスト</h1>
          <p className="page-header__subtitle">
            AI が提案した献立の詳細を確認できます。
          </p>
        </div>
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
          recipes.map((recipe) => (
            <div className="card" key={recipe.id}>
              <h2>{recipe.date}</h2>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  margin: 0,
                }}
              >
                {recipe.menu_text}
              </pre>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
