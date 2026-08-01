"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import { api, type Child, type GenerateResponse } from "@/lib/api";

export default function MealPlanPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [days, setDays] = useState(7);
  const [mealPlan, setMealPlan] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listChildren().then((list) => {
      setChildren(list);
      if (list.length > 0) setSelectedChild(list[0].id);
    });
  }, []);

  const handleGenerate = async () => {
    setError(null);
    try {
      const result = await api.generateRecipe(selectedChild, date, days);
      setMealPlan(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "献立の生成に失敗しました");
    }
  };

  return (
    <main id="main-content">
      <AppNav />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <h1>AI 献立提案</h1>
      <div className="card">
        <label style={{ display: "block", marginBottom: 8 }}>
          お子様
          <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            style={selectStyle}
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "block", marginBottom: 8 }}>
          開始日
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={selectStyle}
          />
        </label>
        <label style={{ display: "block", marginBottom: 16 }}>
          日数
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={selectStyle}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n} 日分
              </option>
            ))}
          </select>
        </label>
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        <button className="button" onClick={handleGenerate} disabled={!selectedChild}>
          献立を生成する
        </button>
      </div>

      {mealPlan && mealPlan.meals.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2>提案された献立（{mealPlan.meals.length} 日分）</h2>
          {mealPlan.meals.map((meal) => (
            <div className="card" key={meal.id}>
              <h3>{meal.date}</h3>
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{meal.menu_text}</pre>
            </div>
          ))}
          <Link href="/recipes" className="button">
            レシピ・買い物リストを見る
          </Link>
        </div>
      )}
      </div>
    </main>
  );
}

const selectStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: 12,
  marginTop: 4,
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  fontSize: 16,
};
