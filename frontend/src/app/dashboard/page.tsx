"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import { api, type Child, type User } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // お子様追加フォーム
  const [newName, setNewName] = useState("");
  const [newBirthDate, setNewBirthDate] = useState("");

  // プロフィール編集
  const [username, setUsername] = useState("");

  // アレルギー・好み入力
  const [allergyInput, setAllergyInput] = useState("");
  const [prefInput, setPrefInput] = useState("");
  const [prefMode, setPrefMode] = useState("exclude");

  // ご意見ボックス
  const [fbRating, setFbRating] = useState<number | null>(null);
  const [fbComment, setFbComment] = useState("");
  const [fbSubmitted, setFbSubmitted] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);

  const load = () => {
    Promise.all([api.me(), api.listChildren()])
      .then(([me, list]) => {
        setUser(me);
        setUsername(me.username ?? "");
        setChildren(list);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "読み込みに失敗しました"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

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
      await api.createChild({
        name: newName,
        birth_date: newBirthDate || null,
        allergies: [],
        preferences: [],
      });
      setNewName("");
      setNewBirthDate("");
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
            <input
              type="date"
              value={newBirthDate}
              onChange={(e) => setNewBirthDate(e.target.value)}
              className="input"
            />
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
                <p className="card__text">誕生日: {child.birth_date}</p>
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
                <input
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleAddAllergy(child.id)
                  }
                  placeholder="アレルギー食材（例: 卵）"
                  className="input"
                />
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
