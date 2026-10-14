"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppNav from "@/components/AppNav";
import SearchBar from "@/components/SearchBar";
import RecipeList from "@/components/RecipeList";
import { api, type RecipeSearchResponse } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";

const CATEGORIES = [
  { value: "main", label: "主菜" },
  { value: "side", label: "副菜" },
  { value: "soup", label: "汁物" },
  { value: "staple", label: "主食" },
];

function RecipeSearchInner() {
  const searchParams = useSearchParams();
  const authReady = useRequireAuth();
  const [result, setResult] = useState<RecipeSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = {
      keyword: searchParams.get("keyword") ?? undefined,
      meal_type: searchParams.get("meal_type") ?? undefined,
      ingredient: searchParams.get("ingredient") ?? undefined,
      max_cook_time: searchParams.get("max_cook_time")
        ? Number(searchParams.get("max_cook_time"))
        : undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      per_page: 12,
    };

    api
      .searchRecipes(params)
      .then((res) => {
        if (!cancelled) setResult(res);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "検索に失敗しました");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, searchParams]);

  const mealType = searchParams.get("meal_type") ?? "";
  const filtered = Boolean(
    searchParams.get("keyword") ||
      searchParams.get("meal_type") ||
      searchParams.get("ingredient") ||
      searchParams.get("max_cook_time"),
  );

  return (
    <main className="main">
      <AppNav />
      <div className="container" style={{ paddingBottom: 80 }}>
        <section className="home-hero" aria-labelledby="home-title">
          <p className="home-hero__en">RECIPE SEARCH</p>
          <h1 className="home-hero__title" id="home-title">
            きょうの ごはん、さがそう。
          </h1>
          <p className="home-hero__lead">
            保育園で人気のレシピを、カテゴリ・材料・調理時間から探せます。
            きょうの献立づくりに、ぴったりの一品をどうぞ。
          </p>
          <ul className="home-cats" aria-label="カテゴリから探す">
            <li>
              <Link
                href="/recipe-search"
                className={`home-cat home-cat--all${mealType ? "" : " home-cat--active"}`}
                aria-current={mealType ? undefined : "true"}
              >
                すべて
              </Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.value}>
                <Link
                  href={`/recipe-search?meal_type=${c.value}`}
                  className={`home-cat home-cat--${c.value}${mealType === c.value ? " home-cat--active" : ""}`}
                  aria-current={mealType === c.value ? "true" : undefined}
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="home-quick">
            <Link href="/menus" className="home-quick__item">
              献立表をみる →
            </Link>
            <Link href="/meal-plan" className="home-quick__item">
              こんだて提案をつくる →
            </Link>
          </div>
        </section>
        <SearchBar
          initial={{
            keyword: searchParams.get("keyword") ?? undefined,
            meal_type: searchParams.get("meal_type") ?? undefined,
            ingredient: searchParams.get("ingredient") ?? undefined,
            max_cook_time: searchParams.get("max_cook_time")
              ? Number(searchParams.get("max_cook_time"))
              : undefined,
          }}
        />
        {error && (
          <div className="card" role="alert">
            <p>{error}</p>
          </div>
        )}
        {loading && (
          <div className="card">
            <p>読み込み中...</p>
          </div>
        )}
        {result && !loading && (
          <>
            <h2 className="home-section-title">
              {filtered ? "検索結果" : "おすすめのレシピ"}
            </h2>
            <RecipeList result={result} />
          </>
        )}
      </div>
    </main>
  );
}

export default function RecipeSearchPage() {
  return (
    <Suspense fallback={null}>
      <RecipeSearchInner />
    </Suspense>
  );
}
