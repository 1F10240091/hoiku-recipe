"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import RecipeCard from "@/components/RecipeCard";
import { api, type Recipe } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";

export default function MyRecipesPage() {
  const ready = useRequireAuth();
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState("main");
  const [cuisine, setCuisine] = useState("和");
  const [time, setTime] = useState("20");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [mine, setMine] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [actionError, setActionError] = useState("");

  const reload = async () => {
    setActionError("");
    const [own, saved] = await Promise.all([api.listMyRecipes(), api.listFavoriteRecipes()]);
    setMine(own);
    setFavorites(saved);
  };

  useEffect(() => {
    if (ready) reload().catch(() => undefined);
  }, [ready]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.createRecipe({
        name: name.trim(), meal_type: mealType, cuisine,
        age_min_months: 12, age_max_months: 72,
        cook_time_minutes: Number(time) || undefined,
        ingredients: ingredients.split("\n").map((line) => {
          const parts = line.split(",");
          return { name: (parts[0] || "").trim(), quantity: (parts[1] || "").trim(), unit: (parts[2] || "").trim() };
        }).filter((item) => item.name),
        instructions: instructions.trim(), is_public: false,
      });
      setMessage("マイレシピに保存しました。");
      setName(""); setIngredients(""); setInstructions("");
      await reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存に失敗しました");
    } finally { setSaving(false); }
  };

  const togglePublic = async (recipe: Recipe) => {
    setActionError("");
    try {
      const updated = await api.updateRecipe(recipe.id, { is_public: !recipe.is_public });
      setMine((items) => items.map((item) => item.id === updated.id ? updated : item));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "公開設定を更新できませんでした。");
    }
  };

  const removeRecipe = async (recipe: Recipe) => {
    if (!window.confirm("「" + recipe.name + "」を削除しますか？")) return;
    setActionError("");
    try {
      await api.deleteRecipe(recipe.id);
      setMine((items) => items.filter((item) => item.id !== recipe.id));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "レシピを削除できませんでした。");
    }
  };

  if (!ready) return null;
  return <main className="main"><AppNav /><div className="container" style={{ paddingBottom: 80 }}>
    <div className="page-header"><p className="page-header__en">MY RECIPES</p><h1 className="page-header__title">マイレシピを追加</h1><p className="page-header__subtitle">家庭の料理を登録すると、献立提案の候補に加えられます。</p></div>
    <form className="card" onSubmit={submit}>
      <label className="form-field"><span className="form-field__label">料理名</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} required /></label>
      <div className="form-grid"><label className="form-field"><span className="form-field__label">分類</span><select className="select" value={mealType} onChange={(e) => setMealType(e.target.value)}><option value="main">主菜</option><option value="side">副菜</option><option value="soup">汁物</option><option value="staple">主食</option></select></label><label className="form-field"><span className="form-field__label">料理ジャンル</span><select className="select" value={cuisine} onChange={(e) => setCuisine(e.target.value)}><option>和</option><option>洋</option><option>中</option><option>伊</option><option>仏</option></select></label><label className="form-field"><span className="form-field__label">所要時間（分）</span><input className="input" type="number" min="1" value={time} onChange={(e) => setTime(e.target.value)} /></label></div>
      <label className="form-field"><span className="form-field__label">材料（材料名,分量,単位）</span><textarea className="textarea" rows={6} value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="鶏もも肉,200,g" required /></label>
      <label className="form-field"><span className="form-field__label">調理方法</span><textarea className="textarea" rows={7} value={instructions} onChange={(e) => setInstructions(e.target.value)} required /></label>
      {message && <div className="alert alert--success">{message}</div>}<button className="button" disabled={saving}>{saving ? "保存中..." : "マイレシピに保存"}</button>
    </form>
    <section className="recipe-library-section">
      <h2 className="home-section-title">自分が投稿したレシピ（{mine.length}）</h2>
      {actionError && <div className="alert alert--error" role="alert">{actionError}</div>}
      {mine.length === 0 ? <div className="card"><p>まだ登録したレシピはありません。</p></div> : <div className="recipe-grid">{mine.map((recipe) => <div key={recipe.id}><RecipeCard recipe={recipe} /><div className="recipe-owner-actions"><button className="button button--secondary button--sm" onClick={() => togglePublic(recipe)}>{recipe.is_public ? "公開中・非公開にする" : "非公開・公開する"}</button><button className="button button--danger button--sm" onClick={() => removeRecipe(recipe)}>削除</button></div></div>)}</div>}
    </section>
    <section className="recipe-library-section">
      <h2 className="home-section-title">お気に入り（{favorites.length}）</h2>
      {favorites.length === 0 ? <div className="card"><p>レシピの♡を押すとここに保存されます。</p></div> : <div className="recipe-grid">{favorites.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div>}
    </section>
  </div></main>;
}
