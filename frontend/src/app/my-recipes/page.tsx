"use client";

import { useEffect, useRef, useState } from "react";
import { prepareRecipeImage } from "@/lib/recipe-image";
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
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [preparingImage, setPreparingImage] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);
  const imageVersion = useRef(0);
  const [saveError, setSaveError] = useState("");

  const selectImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const version = ++imageVersion.current;
    const file = event.target.files?.[0];
    setImageData(null);
    setImageError("");
    if (!file) { setPreparingImage(false); return; }
    setPreparingImage(true);
    try {
      const data = await prepareRecipeImage(file);
      if (version === imageVersion.current) setImageData(data);
    } catch (error) {
      if (version === imageVersion.current) setImageError(error instanceof Error ? error.message : "写真を読み込めませんでした。");
    } finally { if (version === imageVersion.current) setPreparingImage(false); }
  };
  const removeImage = () => {
    imageVersion.current += 1;
    setImageData(null); setImageError(""); setPreparingImage(false);
    if (imageInput.current) imageInput.current.value = "";
  };
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
    if (ready) reload().catch((err: unknown) => setActionError(err instanceof Error ? err.message : "読み込みに失敗しました"));
  }, [ready]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving || preparingImage || imageError) return;
    setSaving(true);
    setSaveError("");
    setMessage("");
    try {
      await api.createRecipe({
        image_data: imageData,
        name: name.trim(), meal_type: mealType, cuisine,
        age_min_months: 12, age_max_months: 72,
        cook_time_minutes: Number(time) || undefined,
        ingredients: ingredients.split("\n").map((line) => {
          const parts = line.split(",");
          return { name: (parts[0] || "").trim(), quantity: (parts[1] || "").trim(), unit: (parts[2] || "").trim(), components: (parts[3] || "").split("|").map((item) => item.trim()).filter(Boolean) };
        }).filter((item) => item.name),
        instructions: instructions.trim(), is_public: false,
      });
      setMessage("マイレシピに保存しました。");
      setName(""); setIngredients(""); setInstructions("");
      removeImage();
      await reload();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "保存に失敗しました");
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
      <fieldset disabled={saving} className="recipe-post-fields">
      <div className="form-field">
        <label htmlFor="recipe-photo" className="form-field__label">料理の写真（任意・1枚）</label>
        <p id="recipe-photo-hint" className="note">JPEG・PNG・WebP／4MB以下。写真はレシピと同じ公開範囲で保存されます。</p>
        <input id="recipe-photo" ref={imageInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} aria-describedby="recipe-photo-hint" />
        {preparingImage && <p role="status">写真を準備しています...</p>}
        {imageError && <p className="alert alert--error" role="alert">{imageError}</p>}
        {imageData && <div className="recipe-photo-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="recipe-photo" src={imageData} alt="投稿する料理の写真プレビュー" />
        </div>}
        {(imageData || imageError) && <button type="button" className="button button--secondary button--sm" onClick={removeImage}>写真を外す</button>}
      </div>
      <label className="form-field"><span className="form-field__label">料理名</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} required /></label>
      <div className="form-grid"><label className="form-field"><span className="form-field__label">分類</span><select className="select" value={mealType} onChange={(e) => setMealType(e.target.value)}><option value="main">主菜</option><option value="side">副菜</option><option value="soup">汁物</option><option value="staple">主食</option></select></label><label className="form-field"><span className="form-field__label">料理ジャンル</span><select className="select" value={cuisine} onChange={(e) => setCuisine(e.target.value)}><option>和</option><option>洋</option><option>中</option><option>伊</option><option>仏</option></select></label><label className="form-field"><span className="form-field__label">所要時間（分）</span><input className="input" type="number" min="1" value={time} onChange={(e) => setTime(e.target.value)} /></label></div>
      <label className="form-field"><span className="form-field__label">材料（材料名,分量,単位,原材料 ※任意）</span><textarea className="textarea" rows={6} value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder={"鶏もも肉,200,g\n調味ソース,10,g,小麦|大豆"} required /></label>
      <p className="note">加工品の原材料は商品の表示を確認し、複数ある場合は「|」で区切って記録できます。未入力の原材料は判定できません。</p>
      <label className="form-field"><span className="form-field__label">調理方法</span><textarea className="textarea" rows={7} value={instructions} onChange={(e) => setInstructions(e.target.value)} required /></label>
      {saveError && <div className="alert alert--error" role="alert">{saveError}</div>}
      {message && <div className="alert alert--success" role="status">{message}</div>}<button className="button" disabled={saving || preparingImage || Boolean(imageError)}>{saving ? "保存中..." : "マイレシピに保存"}</button>
      </fieldset>
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
