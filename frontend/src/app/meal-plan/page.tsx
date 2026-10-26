"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import LikeButton from "@/components/LikeButton";
import {
  api,
  type Child,
  type GenerateResponse,
  type LikesSummary,
  type ShoppingItem,
} from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

export default function MealPlanPage() {
  const authReady = useRequireAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [days, setDays] = useState(7);
  const [mealPlan, setMealPlan] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inventory, setInventory] = useState<ShoppingItem[]>([]);
  const [newInventoryItem, setNewInventoryItem] = useState("");
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [likes, setLikes] = useState<LikesSummary>({ liked: [], counts: {} });

  useEffect(() => {
    if (!authReady) return;
    api.listChildren().then((list) => {
      setChildren(list);
      if (list.length > 0) setSelectedChild(list[0].id);
    });
    api.listInventory().then((inv) => {
      setInventory(inv);
      setLoadingInventory(false);
    });
    api.listLikes().then(setLikes).catch(() => undefined);
  }, [authReady]);

  const handleGenerate = async () => {
    setError(null);
    try {
      const result = await api.generateRecipe(selectedChild, date, days);
      setMealPlan(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "献立の生成に失敗しました");
    }
  };

  const handleAddInventory = async () => {
    const name = newInventoryItem.trim();
    if (!name) return;
    setError(null);
    try {
      await api.addInventory(name);
      setNewInventoryItem("");
      const inv = await api.listInventory();
      setInventory(inv);
    } catch (err) {
      setError(err instanceof Error ? err.message : "在庫の追加に失敗しました");
    }
  };

  const handleDeleteInventory = async (id: string) => {
    try {
      await api.deleteInventory(id);
      const inv = await api.listInventory();
      setInventory(inv);
    } catch (err) {
      setError(err instanceof Error ? err.message : "在庫の削除に失敗しました");
    }
  };

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

  // 1週間分の献立を一塊のテキストとして整形
  const formatWeeklyPlan = (meals: GenerateResponse["meals"]) => {
    if (!meals.length) return "";
    return meals
      .map((meal) => {
        const dayLabel = new Date(meal.date).toLocaleDateString("ja-JP", {
          month: "short",
          day: "numeric",
          weekday: "short",
        });
        return `${dayLabel}：${meal.menu_text.replace(`${meal.menu_text.split("\n")[0]}\n`, "")}`;
      })
      .join("\n\n");
  };

  return (
    <main className="main">
      <AppNav />
      <div className="container" style={{ paddingBottom: 80 }}>
        <div className="page-header">
          <p className="page-header__en">MENU PLAN</p>
          <h1 className="page-header__title">こんだて提案</h1>
          <p className="page-header__subtitle">
            お子さんの情報と在庫をもとに、夕食の候補をまとめて出します。
          </p>
        </div>

        {/* 在庫の事前確認・編集 */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 className="card__title" style={{ margin: 0 }}>冷蔵庫の在庫（提案前に確認・追加）</h2>
            <span className="note" style={{ fontSize: 14 }}>
              在庫がある食材を使うレシピを優先して提案します
            </span>
          </div>
          {loadingInventory ? (
            <div className="loading">読み込み中...</div>
          ) : (
            <>
              <div className="input-row" style={{ marginBottom: 8 }}>
                <input
                  value={newInventoryItem}
                  onChange={(e) => setNewInventoryItem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddInventory()}
                  placeholder="食材名（例: 玉ねぎ、豚肉、卵）"
                  className="input"
                />
                <button
                  className="button"
                  onClick={handleAddInventory}
                  disabled={!newInventoryItem.trim()}
                >
                  追加
                </button>
              </div>
              {inventory.length === 0 ? (
                <p className="card__text">在庫はまだありません。よく使う食材を追加しておくと提案が無駄なくなります。</p>
              ) : (
                <ul className="list">
                  {inventory.map((item) => (
                    <li key={item.id ?? item.name} className="list__item" style={{ justifyContent: "space-between" }}>
                      <span>{item.name}</span>
                      <button
                        onClick={() => handleDeleteInventory(item.id!)}
                        className="button button--danger button--sm"
                        style={{ padding: "4px 10px", fontSize: 13 }}
                      >
                        削除
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* 献立生成フォーム */}
        <div className="card" style={{ marginBottom: 16 }}>
          <label className="form-field">
            <span className="form-field__label">お子様</span>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="select"
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span className="form-field__label">開始日</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
            />
          </label>
          <label className="form-field">
            <span className="form-field__label">日数</span>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="select"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>
                  {n} 日分
                </option>
              ))}
            </select>
          </label>
          {error && <div className="alert alert--error">{error}</div>}
          <button
            className="button"
            onClick={handleGenerate}
            disabled={!selectedChild}
            style={{ width: "100%", padding: 14, fontSize: 18, marginTop: 8 }}
          >
            献立を生成する
          </button>
        </div>

        {/* 提案結果：1週間分を一塊で表示 */}
        {mealPlan && mealPlan.meals.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              <h2 style={{ margin: 0 }}>
                提案された献立（{mealPlan.meals.length} 日分）
              </h2>
              {mealPlan.meals[0].ingredients.engine === "mimo_freeform" ? (
                <span className="badge">AI（MiMo）が考案</span>
              ) : (
                <span className="badge badge--muted">
                  ルールベース（登録レシピから選定）
                </span>
              )}
            </div>
            <div className="card" style={{ padding: 24, whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.8, fontSize: 18 }}>
              {formatWeeklyPlan(mealPlan.meals)}
            </div>
            <div className="card" style={{ marginTop: 16 }}>
              <h3 className="card__title" style={{ marginTop: 0 }}>
                喜んでた料理を記録
              </h3>
              <p className="note" style={{ marginTop: 0, fontSize: 13 }}>
                子どもが喜んだ料理のハート（♡）を押すと、レシピ一覧に回数が記録されます。
              </p>
              {mealPlan.meals.map((meal) => {
                const recipeIds =
                  (meal.ingredients.recipe_ids as string[] | undefined) ?? [];
                const dishNames =
                  (meal.ingredients.dishes as string[] | undefined) ?? [];
                if (recipeIds.length === 0) return null;
                return (
                  <div key={meal.id} style={{ marginTop: 12 }}>
                    <p className="dish-row__meta" style={{ margin: "0 0 4px", fontWeight: 700 }}>
                      {formatDate(meal.date)}
                    </p>
                    {recipeIds.map((recipeId, index) => (
                      <div className="dish-row" key={`${meal.id}-${recipeId}`}>
                        <span className="dish-row__name">
                          {dishNames[index] ?? "料理"}
                        </span>
                        <LikeButton
                          mealId={meal.id}
                          recipeId={recipeId}
                          liked={isLiked(meal.id, recipeId)}
                          count={likes.counts[recipeId] ?? 0}
                          onToggled={handleToggled}
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <p className="note" style={{ marginTop: 12, fontSize: 14 }}>
              上記は AI・ルールベースによる自動提案です。実際の前日の献立や家族の予定に合わせて、自由に書き換えてお使いください。
            </p>
            <div className="action-links" style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/recipes" className="button">
                レシピ・買い物リストを見る
              </Link>
              <Link href="/shopping" className="button button--secondary">
                買い物メモを確認・編集
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}