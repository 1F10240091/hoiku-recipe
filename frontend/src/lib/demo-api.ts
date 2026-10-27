// デモモード用モック API
// バックエンドなしで動作させるための実装。localStorage にデータを保持する。
// api.ts と同じインターフェースを提供する。

import {
  DEMO_CHILDREN,
  DEMO_NURSERY_MENUS,
  DEMO_RECIPES,
  type DemoChild,
  type DemoRecipe,
} from "./demo-data";
import type {
  Child,
  GenerateResponse,
  LikeToggleResponse,
  LikesSummary,
  NurseryMenu,
  Recipe,
  RecipeSearchResponse,
  ShoppingItem,
  ShoppingList,
  SuggestedMeal,
  TokenResponse,
  User,
} from "./api";

const DEMO_TOKEN = "demo-token";
const DEMO_USER: User = {
  id: "demo-user",
  username: "デモユーザー",
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// 表記ゆれを考慮したアレルゲン判定（バックエンドと同様のロジック）
const SYNONYMS: Record<string, string[]> = {
  さけ: ["さけ", "鮭", "サーモン", "しゃけ"],
  卵: ["卵", "たまご", "玉子", "エッグ"],
  牛乳: ["牛乳", "乳", "バター", "チーズ", "ヨーグルト"],
  小麦: ["小麦", "うどん", "パン", "麺"],
  大豆: ["大豆", "豆腐", "みそ", "味噌", "しょうゆ", "醤油"],
};

function containsAllergen(recipe: DemoRecipe, allergens: string[]): boolean {
  const text = recipe.ingredients.map((i) => [i.name, ...((i as Recipe["ingredients"][number]).components ?? [])].join(" ")).join(" ");
  return allergens.some((a) => {
    const aliases = SYNONYMS[a] ?? [a];
    return aliases.some((alias) => text.includes(alias));
  });
}

// デモ用にアレルゲン判定したレシピリストを返す
function safeRecipes(allergens: string[]): DemoRecipe[] {
  return DEMO_RECIPES.filter((r) => !containsAllergen(r, allergens));
}

type DemoLike = { meal_id: string; recipe_id: string };

function loadLikes(): DemoLike[] {
  return load<DemoLike[]>("demo_likes", []);
}

function likeCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const like of loadLikes()) {
    counts[like.recipe_id] = (counts[like.recipe_id] ?? 0) + 1;
  }
  return counts;
}

type SavedRecipe = Recipe & { image_data?: string | null };
function allRecipes(): SavedRecipe[] {
  return [...DEMO_RECIPES, ...load<SavedRecipe[]>("demo_my_recipes", [])];
}

function withLikedCounts(recipes: Recipe[]): Recipe[] {
  const counts = likeCounts();
  return recipes.map((r) => ({ ...r, liked_count: counts[r.id] ?? 0 }));
}

export const demoApi = {
  async register(
    username: string,
    _password: string,
  ): Promise<TokenResponse> {
    localStorage.setItem("token", DEMO_TOKEN);
    if (username.trim()) DEMO_USER.username = username.trim();
    return delay({ access_token: DEMO_TOKEN, token_type: "bearer" });
  },

  async login(_username: string, _password: string): Promise<TokenResponse> {
    localStorage.setItem("token", DEMO_TOKEN);
    return delay({ access_token: DEMO_TOKEN, token_type: "bearer" });
  },

  async me(): Promise<User> {
    return delay(DEMO_USER);
  },

  async updateMe(payload: {
    username?: string;
    password?: string;
  }): Promise<User> {
    if (payload.username != null && payload.username.trim())
      DEMO_USER.username = payload.username.trim();
    return delay({ ...DEMO_USER });
  },

  async listChildren(): Promise<Child[]> {
    return delay(load<DemoChild[]>("demo_children", DEMO_CHILDREN));
  },

  async createChild(payload: Omit<Child, "id">): Promise<Child> {
    const list = load<DemoChild[]>("demo_children", DEMO_CHILDREN);
    const child: DemoChild = {
      ...payload,
      id: uid("c"),
      birth_date: payload.birth_date ?? null,
    };
    list.push(child);
    save("demo_children", list);
    return delay(child);
  },

  async updateChild(
    childId: string,
    payload: { name?: string; birth_date?: string | null },
  ): Promise<Child> {
    const list = load<DemoChild[]>("demo_children", DEMO_CHILDREN);
    const child = list.find((c) => c.id === childId);
    if (child) {
      if (payload.name != null) child.name = payload.name;
      if (payload.birth_date !== undefined)
        child.birth_date = payload.birth_date;
      save("demo_children", list);
    }
    return delay(child ?? list[0]);
  },

  async deleteChild(childId: string): Promise<void> {
    const list = load<DemoChild[]>("demo_children", DEMO_CHILDREN);
    save(
      "demo_children",
      list.filter((c) => c.id !== childId),
    );
    return delay(undefined);
  },

  async addAllergy(childId: string, ingredient: string): Promise<Child> {
    const list = load<DemoChild[]>("demo_children", DEMO_CHILDREN);
    const child = list.find((c) => c.id === childId);
    if (child) {
      child.allergies.push({ id: uid("a"), ingredient });
      save("demo_children", list);
    }
    return delay(child ?? list[0]);
  },

  async deleteAllergy(childId: string, allergyId: string): Promise<Child> {
    const list = load<DemoChild[]>("demo_children", DEMO_CHILDREN);
    const child = list.find((c) => c.id === childId);
    if (child) {
      child.allergies = child.allergies.filter((a) => a.id !== allergyId);
      save("demo_children", list);
    }
    return delay(child ?? list[0]);
  },

  async addPreference(
    childId: string,
    ingredient: string,
    mode: string,
  ): Promise<Child> {
    const list = load<DemoChild[]>("demo_children", DEMO_CHILDREN);
    const child = list.find((c) => c.id === childId);
    if (child) {
      child.preferences.push({ id: uid("p"), ingredient, mode });
      save("demo_children", list);
    }
    return delay(child ?? list[0]);
  },

  async deletePreference(
    childId: string,
    preferenceId: string,
  ): Promise<Child> {
    const list = load<DemoChild[]>("demo_children", DEMO_CHILDREN);
    const child = list.find((c) => c.id === childId);
    if (child) {
      child.preferences = child.preferences.filter(
        (p) => p.id !== preferenceId,
      );
      save("demo_children", list);
    }
    return delay(child ?? list[0]);
  },

  async listMenus(): Promise<NurseryMenu[]> {
    return delay(load<NurseryMenu[]>("demo_menus", DEMO_NURSERY_MENUS));
  },

  async uploadMenu(file: File): Promise<NurseryMenu> {
    const list = load<NurseryMenu[]>("demo_menus", DEMO_NURSERY_MENUS);
    const text = `${file.name} を読み取りました（デモ）。\n例: ごはん・みそ汁・鶏の唐揚げ`;
    const menu: NurseryMenu = {
      id: uid("m"),
      date: new Date().toISOString().slice(0, 10),
      menu_text: text,
      ingredients: { dishes: ["ごはん", "みそ汁", "鶏の唐揚げ"] },
    };
    list.unshift(menu);
    save("demo_menus", list);
    return delay(menu);
  },

  async createRecipe(payload: Record<string, unknown>): Promise<Recipe> {
    const recipes = load<SavedRecipe[]>("demo_my_recipes", []);
    if (allRecipes().some((recipe) => recipe.name === payload.name)) throw new Error("同じ名前のレシピが既に存在します");
    const recipe = { ...payload, id: uid("recipe"), is_official: false,
      has_image: Boolean(payload.image_data) } as unknown as SavedRecipe;
    save("demo_my_recipes", [...recipes, recipe]);
    return delay(recipe);
  },
  async listMyRecipes(): Promise<Recipe[]> {
    return delay(load<SavedRecipe[]>("demo_my_recipes", []));
  },
  async listFavoriteRecipes(): Promise<Recipe[]> {
    const ids = load<string[]>("demo_favorites", []);
    return delay(allRecipes().filter((recipe) => ids.includes(recipe.id)));
  },
  async toggleFavorite(id: string): Promise<Recipe> {
    const recipe = allRecipes().find((item) => item.id === id);
    if (!recipe) throw new Error("レシピが見つかりません");
    const ids = load<string[]>("demo_favorites", []);
    const favorite = !ids.includes(id);
    save("demo_favorites", favorite ? [...ids, id] : ids.filter((value) => value !== id));
    return delay({ ...recipe, is_favorite: favorite });
  },
  async updateRecipe(id: string, payload: Record<string, unknown>): Promise<Recipe> {
    const recipes = load<SavedRecipe[]>("demo_my_recipes", []);
    const index = recipes.findIndex((recipe) => recipe.id === id);
    if (index < 0) throw new Error("レシピが見つかりません");
    recipes[index] = { ...recipes[index], ...payload };
    save("demo_my_recipes", recipes);
    return delay(recipes[index]);
  },
  async deleteRecipe(id: string): Promise<void> {
    save("demo_my_recipes", load<SavedRecipe[]>("demo_my_recipes", []).filter((recipe) => recipe.id !== id));
  },
  async getRecipeImage(id: string): Promise<Blob> {
    const image = allRecipes().find((recipe) => recipe.id === id)?.image_data;
    if (!image) throw new Error("画像が見つかりません");
    const [header, encoded] = image.split(",");
    const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
    return new Blob([bytes], { type: header.slice(5).split(";")[0] });
  },

  async listRecipes(): Promise<Recipe[]> {
    return delay(withLikedCounts(allRecipes()));
  },

  async listRecipeIngredients(): Promise<string[]> {
    const names = new Set<string>();
    for (const recipe of DEMO_RECIPES) {
      for (const item of recipe.ingredients) {
        const name = item.name.trim();
        if (name) names.add(name);
      }
    }
    return delay([...names].sort());
  },

  async searchRecipes(params: {
    keyword?: string;
    meal_type?: string;
    ingredient?: string;
    max_cook_time?: number;
    sort?: "name" | "liked";
    page?: number;
    per_page?: number;
  }): Promise<RecipeSearchResponse> {
    let list: Recipe[] = withLikedCounts(allRecipes());
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(kw) ||
          r.instructions.toLowerCase().includes(kw),
      );
    }
    if (params.meal_type) {
      list = list.filter((r) => r.meal_type === params.meal_type);
    }
    if (params.ingredient) {
      const ing = params.ingredient.toLowerCase();
      list = list.filter((r) =>
        r.ingredients.some((i) => i.name.toLowerCase().includes(ing)),
      );
    }
    if (params.max_cook_time) {
      list = list.filter(
        (r) =>
          r.cook_time_minutes == null ||
          r.cook_time_minutes <= params.max_cook_time!,
      );
    }
    if (params.sort === "liked") {
      list = [...list].sort(
        (a, b) =>
          (b.liked_count ?? 0) - (a.liked_count ?? 0) ||
          a.name.localeCompare(b.name, "ja"),
      );
    } else {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ja"));
    }
    const per_page = params.per_page ?? 20;
    const page = params.page ?? 1;
    const total = list.length;
    const start = (page - 1) * per_page;
    return delay({
      recipes: list.slice(start, start + per_page),
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
    });
  },

  async getRecipe(recipeId: string): Promise<Recipe> {
    const recipe = allRecipes().find((r) => r.id === recipeId);
    if (!recipe) throw new Error("レシピが見つかりません");
    return delay(withLikedCounts([recipe])[0]);
  },

  async listMealRecipes(): Promise<SuggestedMeal[]> {
    return delay(load<SuggestedMeal[]>("demo_meals", []));
  },

  async listLikes(): Promise<LikesSummary> {
    return delay({ liked: loadLikes(), counts: likeCounts() });
  },

  async toggleLike(
    mealId: string,
    recipeId: string,
  ): Promise<LikeToggleResponse> {
    const likes = loadLikes();
    const index = likes.findIndex(
      (l) => l.meal_id === mealId && l.recipe_id === recipeId,
    );
    let liked: boolean;
    if (index >= 0) {
      likes.splice(index, 1);
      liked = false;
    } else {
      likes.push({ meal_id: mealId, recipe_id: recipeId });
      liked = true;
    }
    save("demo_likes", likes);
    return delay({
      meal_id: mealId,
      recipe_id: recipeId,
      liked,
      liked_count: likeCounts()[recipeId] ?? 0,
    });
  },

  async generateRecipe(
    childId: string,
    menuDate: string,
    days = 7,
  ): Promise<GenerateResponse> {
    const list = load<DemoChild[]>("demo_children", DEMO_CHILDREN);
    const child = list.find((c) => c.id === childId);
    const name = child?.name ?? "ゆうた";
    const allergens = [
      ...(child?.allergies.map((a) => a.ingredient) ?? []),
      ...(child?.preferences
        .filter((p) => p.mode === "exclude")
        .map((p) => p.ingredient) ?? []),
    ];

    // 保育園の昼食と重複しない主菜を選ぶ。在庫の食材を使う料理を優先する。
    const inventory = load<ShoppingItem[]>("demo_inventory", []);
    const inventoryNames = inventory.map((i) => i.name.trim()).filter(Boolean);
    const inventoryScore = (r: DemoRecipe) =>
      r.ingredients.filter((ing) =>
        inventoryNames.some(
          (name) => ing.name.includes(name) || name.includes(ing.name),
        ),
      ).length;

    const mainRecipes = safeRecipes(allergens)
      .filter((r) => r.meal_type === "main")
      .sort((a, b) => inventoryScore(b) - inventoryScore(a));
    const soup = safeRecipes(allergens).find((r) => r.meal_type === "soup");
    const side = safeRecipes(allergens).find((r) => r.meal_type === "side");
    const staple = safeRecipes(allergens).find((r) => r.meal_type === "staple");

    const meals: SuggestedMeal[] = [];
    const start = new Date(menuDate);
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const main = mainRecipes[i % mainRecipes.length];
      const dishes = [main, soup, side, staple].filter(Boolean);
      const menu_text = `${name} さんの夕食（${dateStr}）\n${dishes.map((r) => r!.name).join("・")}`;
      meals.push({
        id: uid("meal"),
        date: dateStr,
        menu_text,
        ingredients: {
          dishes: dishes.map((r) => r!.name),
          engine: "demo",
          recipe_ids: dishes.map((r) => r!.id),
        },
      });
    }
    save("demo_meals", meals);
    return delay({ meals });
  },

  async getShoppingList(): Promise<ShoppingList> {
    const meals = load<SuggestedMeal[]>("demo_meals", []);
    const inventory = load<ShoppingItem[]>("demo_inventory", []);
    const usedIds = meals.flatMap(
      (m) => (m.ingredients.recipe_ids as string[]) ?? [],
    );
    const usedRecipes = DEMO_RECIPES.filter((r) => usedIds.includes(r.id));
    const invNames = new Set(inventory.map((i) => i.name));
    const items: ShoppingItem[] = [];
    const seen = new Set<string>();
    for (const r of usedRecipes) {
      for (const ing of r.ingredients) {
        if (invNames.has(ing.name)) continue;
        if (seen.has(ing.name)) continue;
        seen.add(ing.name);
        items.push({
          id: uid("si"),
          name: ing.name,
          quantity: ing.quantity ?? "",
          unit: ing.unit ?? "",
          needed: "",
          source_recipes: [r.name],
        });
      }
    }
    return delay({ items, generated_at: new Date().toISOString() });
  },

  async listInventory(): Promise<ShoppingItem[]> {
    return delay(load<ShoppingItem[]>("demo_inventory", []));
  },

  async addInventory(name: string, quantity?: string): Promise<ShoppingItem> {
    const list = load<ShoppingItem[]>("demo_inventory", []);
    const item: ShoppingItem = {
      id: uid("inv"),
      name,
      quantity: quantity ?? null,
    };
    list.push(item);
    save("demo_inventory", list);
    return delay(item);
  },

  async deleteInventory(id: string): Promise<void> {
    const list = load<ShoppingItem[]>("demo_inventory", []);
    save(
      "demo_inventory",
      list.filter((i) => i.id !== id),
    );
    return delay(undefined);
  },

  async submitFeedback(rating: number | null, comment: string) {
    const list = load<{ id: string; rating: number | null; comment: string }[]>(
      "demo_feedback",
      [],
    );
    list.push({ id: uid("fb"), rating, comment });
    save("demo_feedback", list);
    return delay({ id: "fb-demo", rating, comment });
  },
};
