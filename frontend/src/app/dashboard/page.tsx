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
  const [displayName, setDisplayName] = useState("");

  // アレルギー・好み入力
  const [allergyInput, setAllergyInput] = useState("");
  const [prefInput, setPrefInput] = useState("");
  const [prefMode, setPrefMode] = useState("exclude");

  const load = () => {
    Promise.all([api.me(), api.listChildren()])
      .then(([me, list]) => {
        setUser(me);
        setDisplayName(me.display_name ?? "");
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
      const updated = await api.updateMe({ display_name: displayName });
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
            メールアドレス: <strong>{user?.email}</strong>
          </p>
          <label className="form-field">
            <span className="form-field__label">表示名</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input"
              placeholder="例: 花子ママ"
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
      </div>
    </main>
  );
}
