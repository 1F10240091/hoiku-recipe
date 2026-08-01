"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    <main className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <h1>レシピ・買い物リスト</h1>
      {loading ? (
        <p>読み込み中...</p>
      ) : recipes.length === 0 ? (
        <div className="card">
          <p>まだ提案された献立がありません。</p>
          <Link href="/meal-plan" className="button">
            献立を作成する
          </Link>
        </div>
      ) : (
        recipes.map((recipe) => (
          <div className="card" key={recipe.id}>
            <h2>{recipe.date}</h2>
            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{recipe.menu_text}</pre>
          </div>
        ))
      )}
    </main>
  );
}
