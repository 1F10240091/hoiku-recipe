// バックエンド API クライアント
const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "")}/api/v1`
  : "/api/v1";
// 長時間かかるファイル解析は Next.js の rewrite proxy を経由させない。
const UPLOAD_API_BASE = `${(process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "")}/api/v1`;

const AUTH_PATHS = ["/login", "/register"];

/** エラーレスポンスから表示用のメッセージを取り出す。 */
function extractErrorMessage(body: string, status: number): string {
  if (!body) return `リクエストに失敗しました（${status}）`;
  try {
    const data = JSON.parse(body) as { detail?: unknown };
    const { detail } = data;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const messages = detail
        .map((d) =>
          d && typeof d === "object" && "msg" in d
            ? String((d as { msg: unknown }).msg)
            : "",
        )
        .filter(Boolean);
      if (messages.length > 0) return messages.join(" / ");
    }
  } catch {
    // JSON でない場合は本文をそのまま使う
  }
  return `リクエストに失敗しました（${status}）。時間をおいて再度お試しください。`;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  baseUrl = API_BASE,
  responseType: "json" | "blob" = "json",
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const token = localStorage.getItem("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.text();

    // 認証切れ・未ログインはトークンを破棄してログイン画面へ誘導する
    if (res.status === 401) {
      localStorage.removeItem("token");
      if (typeof window !== "undefined") {
        const onAuthPage = AUTH_PATHS.some((p) =>
          window.location.pathname.startsWith(p),
        );
        if (!onAuthPage) {
          window.location.replace(new URL("/login", window.location.origin).href);
        }
      }
    }

    throw new Error(extractErrorMessage(body, res.status));
  }
  if (res.status === 204) return undefined as T;
  if (responseType === "blob") return res.blob() as Promise<T>;
  return res.json() as Promise<T>;
}

export interface User {
  id: string;
  username: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Child {
  id: string;
  name: string;
  birth_date: string | null;
  allergies: { id: string; ingredient: string }[];
  preferences: { id: string; ingredient: string; mode: string }[];
}

export interface ChildCreatePayload {
  name: string;
  birth_date: string | null;
  allergies: { ingredient: string }[];
  preferences: { ingredient: string; mode: string }[];
}

export interface NurseryMenu {
  id: string;
  date: string;
  menu_text: string;
  ingredients: Record<string, unknown>;
}

export interface SuggestedMeal {
  id: string;
  date: string;
  menu_text: string;
  ingredients: Record<string, unknown>;
}

export interface GenerateResponse {
  meals: SuggestedMeal[];
}

export interface ShoppingItem {
  id?: string;
  name: string;
  quantity?: string | null;
  unit?: string;
  needed?: string;
  source_recipes?: string[];
}

export interface ShoppingList {
  items: ShoppingItem[];
  generated_at: string;
}

export interface Recipe {
  has_image?: boolean;
  id: string;
  name: string;
  meal_type: string;
  ingredients: { name: string; quantity?: string; unit?: string; components?: string[] }[];
  instructions: string;
  cook_time_minutes?: number | null;
  /** 「喜んでた」が押された回数（ログインユーザー分） */
  liked_count?: number;
  cuisine?: string;
  age_min_months?: number;
  age_max_months?: number;
  source_name?: string | null;
  source_url?: string | null;
  servings_note?: string | null;
  child_notes?: string | null;
  is_official?: boolean;
  is_public?: boolean;
  is_favorite?: boolean;
}

export interface RecipeSearchParams {
  keyword?: string;
  meal_type?: string;
  ingredient?: string;
  max_cook_time?: number;
  sort?: "name" | "liked";
  page?: number;
  per_page?: number;
}

export interface LikesSummary {
  /** 押されている献立×料理の組 */
  liked: { meal_id: string; recipe_id: string }[];
  /** レシピID → 喜ばれた回数 */
  counts: Record<string, number>;
}

export interface LikeToggleResponse {
  meal_id: string;
  recipe_id: string;
  liked: boolean;
  liked_count: number;
}

export interface RecipeSearchResponse {
  recipes: Recipe[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

const realApi = {
  register(username: string, password: string) {
    return request<TokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },
  login(username: string, password: string) {
    return request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },
  me() {
    return request<User>("/auth/me");
  },
  updateMe(payload: { username?: string; password?: string }) {
    return request<User>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  listChildren() {
    return request<Child[]>("/children");
  },
  createChild(payload: ChildCreatePayload) {
    return request<Child>("/children", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateChild(
    childId: string,
    payload: { name?: string; birth_date?: string | null },
  ) {
    return request<Child>(`/children/${childId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteChild(childId: string) {
    return request<void>(`/children/${childId}`, { method: "DELETE" });
  },
  addAllergy(childId: string, ingredient: string) {
    return request<Child>(`/children/${childId}/allergies`, {
      method: "POST",
      body: JSON.stringify({ ingredient }),
    });
  },
  deleteAllergy(childId: string, allergyId: string) {
    return request<Child>(`/children/${childId}/allergies/${allergyId}`, {
      method: "DELETE",
    });
  },
  addPreference(childId: string, ingredient: string, mode: string) {
    return request<Child>(`/children/${childId}/preferences`, {
      method: "POST",
      body: JSON.stringify({ ingredient, mode }),
    });
  },
  deletePreference(childId: string, preferenceId: string) {
    return request<Child>(`/children/${childId}/preferences/${preferenceId}`, {
      method: "DELETE",
    });
  },
  listMenus() {
    return request<NurseryMenu[]>("/menus");
  },
  uploadMenu(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<NurseryMenu>("/menus/upload", {
      method: "POST",
      body: formData,
    }, UPLOAD_API_BASE);
  },
  updateMenu(menuId: string, payload: { date: string; menu_text: string }) {
    return request<NurseryMenu>(`/menus/${menuId}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  deleteMenu(menuId: string) {
    return request<void>(`/menus/${menuId}`, { method: "DELETE" });
  },
  listRecipes() {
    return request<Recipe[]>("/recipe-master");
  },
  listRecipeIngredients(recipeOnly = false) {
    return request<string[]>(`/recipe-master/ingredients${recipeOnly ? "?recipe_only=true" : ""}`);
  },
  searchRecipes(params: RecipeSearchParams = {}) {
    const sp = new URLSearchParams();
    if (params.keyword) sp.set("keyword", params.keyword);
    if (params.meal_type) sp.set("meal_type", params.meal_type);
    if (params.ingredient) sp.set("ingredient", params.ingredient);
    if (params.max_cook_time)
      sp.set("max_cook_time", String(params.max_cook_time));
    if (params.sort) sp.set("sort", params.sort);
    if (params.page) sp.set("page", String(params.page));
    if (params.per_page) sp.set("per_page", String(params.per_page));
    const qs = sp.toString();
    return request<RecipeSearchResponse>(
      `/recipe-master/search${qs ? `?${qs}` : ""}`,
    );
  },
  getRecipe(recipeId: string) {
    return request<Recipe>(`/recipe-master/${recipeId}`);
  },
  getRecipeImage(recipeId: string) {
    return request<Blob>(`/recipe-master/${recipeId}/image`, {}, API_BASE, "blob");
  },
  createRecipe(payload: Record<string, unknown>) {
    return request<Recipe>("/recipe-master", { method: "POST", body: JSON.stringify(payload) });
  },
  listFavoriteRecipes() {
    return request<Recipe[]>("/recipe-master/favorites");
  },
  listMyRecipes() {
    return request<Recipe[]>("/recipe-master/mine");
  },
  toggleFavorite(recipeId: string) {
    return request<Recipe>("/recipe-master/" + recipeId + "/favorite", { method: "POST" });
  },
  updateRecipe(recipeId: string, payload: Record<string, unknown>) {
    return request<Recipe>("/recipe-master/" + recipeId, { method: "PUT", body: JSON.stringify(payload) });
  },
  deleteRecipe(recipeId: string) {
    return request<void>("/recipe-master/" + recipeId, { method: "DELETE" });
  },
  listMealRecipes() {
    return request<SuggestedMeal[]>("/recipes");
  },
  generateRecipe(childId: string, menuDate: string, days = 7) {
    return request<GenerateResponse>("/recipes/generate", {
      method: "POST",
      body: JSON.stringify({ child_id: childId, menu_date: menuDate, days }),
    });
  },
  listLikes() {
    return request<LikesSummary>("/likes");
  },
  toggleLike(mealId: string, recipeId: string) {
    return request<LikeToggleResponse>("/likes/toggle", {
      method: "POST",
      body: JSON.stringify({ meal_id: mealId, recipe_id: recipeId }),
    });
  },
  getShoppingList() {
    return request<ShoppingList>("/shopping/list");
  },
  listInventory() {
    return request<ShoppingItem[]>("/shopping/inventory");
  },
  addInventory(name: string, quantity?: string) {
    return request<ShoppingItem>("/shopping/inventory", {
      method: "POST",
      body: JSON.stringify({ name, quantity }),
    });
  },
  deleteInventory(id: string) {
    return request<void>(`/shopping/inventory/${id}`, { method: "DELETE" });
  },
  submitFeedback(rating: number | null, comment: string) {
    return request<{ id: string; rating: number | null; comment: string }>(
      "/feedback",
      {
        method: "POST",
        body: JSON.stringify({ rating, comment }),
      },
    );
  },
};

import { demoApi } from "./demo-api";

// デモモード判定（NEXT_PUBLIC_DEMO_MODE=true でバックエンドなしのデモとして動作）
export const isDemoMode = () => process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const api = (isDemoMode() ? demoApi : realApi) as typeof realApi;
