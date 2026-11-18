"use client";

import { useState } from "react";
import Link from "next/link";
import { DEMO_RECIPES } from "@/lib/demo-data";
import AllergyScope from "@/components/AllergyScope";

export default function SamplePage() {
  const [index, setIndex] = useState(0);
  const recipes = DEMO_RECIPES.filter(r => r.meal_type === "main");
  const recipe = recipes[index % recipes.length];
  return <main className="main"><div className="container">
    <h1>登録せずにサンプル体験</h1>
    <p>架空のデータで夕食候補・材料・作り方を確認できます。入力や保存、実際のアレルギー判定は行いません。</p>
    <div className="card"><h2>園のお昼ごはん（例）</h2><p>ごはん・鮭の塩焼き・みそ汁</p></div>
    {recipe && <section className="card"><h2>夕食の候補：{recipe.name}</h2>
      <p>調理時間：{recipe.cook_time_minutes}分</p>
      <h3>材料</h3><ul>{recipe.ingredients.map((item, i) => <li key={i}>{item.name} {item.quantity}{item.unit}</li>)}</ul>
      <h3>作り方</h3><p style={{ whiteSpace: "pre-wrap" }}>{recipe.instructions}</p>
      <button className="button" onClick={() => setIndex(i => i + 1)}>別の候補を見る</button>
    </section>}
    <AllergyScope />
    <Link className="button" href="/register">登録して自分の献立を作る</Link> <Link href="/">トップに戻る</Link>
  </div></main>;
}
