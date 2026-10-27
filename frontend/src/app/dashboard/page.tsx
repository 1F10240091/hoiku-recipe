"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import { api, type Child, type User } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";

// 生年月日は「年」と「月」のみ取得する（個人情報の最小化）。
// 保存時は既存 API に合わせて日を 01 に固定した YYYY-MM-01 を送る。
const BIRTH_YEARS = Array.from(
  { length: 13 },
  (_, i) => new Date().getFullYear() - i,
);
const BIRTH_MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/** 「YYYY-MM-DD」を「YYYY年M月生まれ」に整形する。 */
function formatBirthYm(value: string): string {
  const [year, month] = value.split("-");
  if (!year || !month) return value;
  return `${Number(year)}年${Number(month)}月生まれ`;
}

export default function DashboardPage() {
  const router = useRouter();
  const authReady = useRequireAuth();
  const [user, setUser] = useState<User | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // お子様追加フォーム
  const [newName, setNewName] = useState("");
  const [newBirthYear, setNewBirthYear] = useState("");
  const [newBirthMonth, setNewBirthMonth] = useState("");

  // プロフィール編集
  const [username, setUsername] = useState("");

  // アレルギー・好み入力
  const [allergyInput, setAllergyInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [prefInput, setPrefInput] = useState("");
  const [prefMode, setPrefMode] = useState("exclude");

  // ご意見ボックス
  const [fbRating, setFbRating] = useState<number | null>(null);
  const [fbComment, setFbComment] = useState("");
  const [fbSubmitted, setFbSubmitted] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);

  const load = () => {
    Promise.all([api.me(), api.listChildren(), api.listRecipeIngredients()])
      .then(([me, list, ings]) => {
        setUser(me);
        setUsername(me.username ?? "");
        setChildren(list);
        setIngredients(ings);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "読み込みに失敗しました"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authReady) load();
  }, [authReady]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleSaveProfile = async () => {
    setError(null);
    try {
      const updated = await api.updateMe({ username });
      setUser(updated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "プロフィールの更新に失敗しました",
      );
    }
  };

  const handleAddChild = async () => {
    if (!newName.trim()) return;
    setError(null);
    try {
      const birthDate =
        newBirthYear && newBirthMonth
          ? `${newBirthYear}-${newBirthMonth.padStart(2, "0")}-01`
          : null;
      await api.createChild({
        name: newName,
        birth_date: birthDate,
        allergies: [],
        preferences: [],
      });
      setNewName("");
      setNewBirthYear("");
      setNewBirthMonth("");
      load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "お子様の追加に失敗しました",
      );
    }
  };

  const handleAddAllergy = async (childId: string) => {
    if (!allergyInput.trim()) return;
    setError(null);
    try {
      await api.addAllergy(childId, allergyInput.trim());
      setAllergyInput("");
      load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "アレルギーの追加に失敗しました",
      );
    }
  };

  const handleAddPreference = async (childId: string) => {
    if (!prefInput.trim()) return;
    setError(null);
    try {
      await api.addPreference(childId, prefInput.trim(), prefMode);
      setPrefInput("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "好みの追加に失敗しました");
    }
  };

  const handleSubmitFeedback = async () => {
    setFbError(null);
    if (fbRating === null && !fbComment.trim()) {
      setFbError("評価またはコメントを入力してください");
      return;
    }
    try {
      await api.submitFeedback(fbRating, fbComment);
      setFbSubmitted(true);
      setFbRating(null);
      setFbComment("");
    } catch (err) {
      setFbError(err instanceof Error ? err.message : "送信に失敗しました");
    }
  };

  if (loading)
    return (
      <main className="main">
        <AppNav />
        <div className="loading">読み込み中...</div>
      </main>
    );

  return (
    <main className="main">
      <AppNav />
      <div className="container" style={{ paddingBottom: 80 }}>
        <div className="page-header">
          <p className="page-header__en">PROFILE</p>
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            <h1 className="page-header__title">プロフィール</h1>
            <button
              onClick={handleLogout}
              className="button button--secondary button--sm"
              style={{ marginLeft: "auto" }}
            >
              ログアウト
            </button>
          </div>
          <p className="page-header__subtitle">
            お子様の情報とアレルギー・好き嫌いを管理できます。
          </p>
        </div>
        {error && <div className="alert alert--error">{error}</div>}
        <div className="card">
          <h2 className="card__title">アカウント</h2>
          <p>
            ユーザーネーム: <strong>{user?.username}</strong>
          </p>
          <label className="form-field">
            <span className="form-field__label">ユーザーネームの変更</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="例: はなこママ"
              maxLength={30}
            />
          </label>
          <button className="button" onClick={handleSaveProfile}>
            プロフィールを保存
          </button>
        </div>

        <h2 style={{ marginTop: 40 }}>お子様管理</h2>
        <div className="card">
          <h3 className="card__title">お子様を追加</h3>
          <div className="input-row">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="名前（例: ゆうた）"
              className="input"
            />
            <select
              value={newBirthYear}
              onChange={(e) => setNewBirthYear(e.target.value)}
              className="input"
              aria-label="生まれ年"
            >
              <option value="">年</option>
              {BIRTH_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}年
                </option>
              ))}
            </select>
            <select
              value={newBirthMonth}
              onChange={(e) => setNewBirthMonth(e.target.value)}
              className="input"
              aria-label="生まれ月"
            >
              <option value="">月</option>
              {BIRTH_MONTHS.map((month) => (
                <option key={month} value={month}>
                  {month}月
                </option>
              ))}
            </select>
            <button
              className="button"
              onClick={handleAddChild}
              disabled={!newName.trim()}
            >
              追加
            </button>
          </div>
        </div>

        {children.length === 0 ? (
          <div className="card">
            <p className="card__text">
              お子様が登録されていません。上のフォームから登録しましょう。
            </p>
          </div>
        ) : (
          children.map((child) => (
            <div className="card" key={child.id}>
              <h2>{child.name}</h2>
              {child.birth_date && (
                <p className="card__text">
                  生年月: {formatBirthYm(child.birth_date)}
                </p>
              )}

              <h3>アレルギー</h3>
              {child.allergies.length > 0 ? (
                <ul className="list">
                  {child.allergies.map((a) => (
                    <li key={a.id} className="list__item">
                      <span>
                        <span className="badge">{a.ingredient}</span>
                      </span>
                      <button
                        onClick={() =>
                          api
                            .deleteAllergy(child.id, a.id)
                            .then(load)
                            .catch((e) => setError(String(e)))
                        }
                        className="button button--danger button--sm"
                      >
                        削除
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="card__text">なし</p>
              )}
              <div className="input-row" style={{ marginTop: 8 }}>
                <select
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  className="select"
                  aria-label="アレルギー食材"
                >
                  <option value="">食材を選択（レシピにある食材）</option>
                  {ingredients.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <button
                  className="button button--secondary"
                  onClick={() => handleAddAllergy(child.id)}
                  disabled={!allergyInput.trim()}
                >
                  追加
                </button>
              </div>

              <h3 style={{ marginTop: 16 }}>好き嫌い</h3>
              {child.preferences.length > 0 ? (
                <ul className="list">
                  {child.preferences.map((p) => (
                    <li key={p.id} className="list__item">
                      <span>
                        <span className="badge badge--muted">
                          {p.ingredient}（
                          {p.mode === "exclude" ? "除外" : "改善優先"}）
                        </span>
                      </span>
                      <button
                        onClick={() =>
                          api
                            .deletePreference(child.id, p.id)
                            .then(load)
                            .catch((e) => setError(String(e)))
                        }
                        className="button button--danger button--sm"
                      >
                        削除
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="card__text">なし</p>
              )}
              <div className="input-row" style={{ marginTop: 8 }}>
                <input
                  value={prefInput}
                  onChange={(e) => setPrefInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleAddPreference(child.id)
                  }
                  placeholder="食材（例: きのこ）"
                  className="input"
                />
                <select
                  value={prefMode}
                  onChange={(e) => setPrefMode(e.target.value)}
                  className="select"
                >
                  <option value="exclude">除外</option>
                  <option value="improve">改善優先</option>
                </select>
                <button
                  className="button button--secondary"
                  onClick={() => handleAddPreference(child.id)}
                  disabled={!prefInput.trim()}
                >
                  追加
                </button>
              </div>
            </div>
          ))
        )}

        <div className="action-links">
          <Link href="/meal-plan" className="button">
            献立を作成する
          </Link>
        </div>

        <h2 style={{ marginTop: 40 }}>ご意見ボックス</h2>
        <div className="card">
          <p className="card__text">
            アプリの使い勝手や改善してほしい点を教えてください。今後の開発に活かします。
          </p>
          {fbSubmitted ? (
            <p>
              ご協力ありがとうございました！
              <button
                className="button button--secondary button--sm"
                style={{ marginLeft: 10 }}
                onClick={() => setFbSubmitted(false)}
              >
                追加で送る
              </button>
            </p>
          ) : (
            <>
              <p className="form-field__label">満足度（1〜5）</p>
              <div className="rating" role="group" aria-label="満足度">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setFbRating(r)}
                    aria-pressed={fbRating === r}
                    className={`rating__button${fbRating === r ? " rating__button--active" : ""}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <label className="form-field">
                <span className="form-field__label">ご意見・ご要望</span>
                <textarea
                  value={fbComment}
                  onChange={(e) => setFbComment(e.target.value)}
                  rows={4}
                  className="textarea"
                />
              </label>
              {fbError && <div className="alert alert--error">{fbError}</div>}
              <button className="button" onClick={handleSubmitFeedback}>
                送信する
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
