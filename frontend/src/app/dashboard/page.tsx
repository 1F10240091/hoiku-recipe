"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
      .catch((err) => setError(err instanceof Error ? err.message : "読み込みに失敗しました"))
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
      setError(err instanceof Error ? err.message : "プロフィールの更新に失敗しました");
    }
  };

  const handleAddChild = async () => {
    if (!newName.trim()) return;
    setError(null);
    try {
      await api.createChild({ name: newName, birth_date: newBirthDate || null, allergies: [], preferences: [] });
      setNewName("");
      setNewBirthDate("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "お子様の追加に失敗しました");
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
      setError(err instanceof Error ? err.message : "アレルギーの追加に失敗しました");
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

  if (loading) return <main style={{ padding: 40 }}>読み込み中...</main>;

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <nav style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/dashboard">お子様・プロフィール</Link>
        <Link href="/menus">献立表</Link>
        <Link href="/meal-plan">AI 献立提案</Link>
        <Link href="/recipes">提案献立</Link>
        <Link href="/shopping">買い物リスト</Link>
        <button onClick={handleLogout} style={{ marginLeft: "auto", cursor: "pointer" }}>
          ログアウト
        </button>
      </nav>

      <h1>プロフィール</h1>
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      <div className="card">
        <p>
          メールアドレス: <strong>{user?.email}</strong>
        </p>
        <label style={{ display: "block", marginBottom: 8 }}>
          表示名
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={inputStyle}
            placeholder="例: 花子ママ"
          />
        </label>
        <button className="button" onClick={handleSaveProfile}>
          プロフィールを保存
        </button>
      </div>

      <h1 style={{ marginTop: 40 }}>お子様管理</h1>
      <div className="card">
        <h2>お子様を追加</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="名前（例: ゆうた）"
            style={inputStyle}
          />
          <input type="date" value={newBirthDate} onChange={(e) => setNewBirthDate(e.target.value)} style={inputStyle} />
          <button className="button" onClick={handleAddChild} disabled={!newName.trim()}>
            追加
          </button>
        </div>
      </div>

      {children.length === 0 ? (
        <div className="card">
          <p>お子様が登録されていません。上のフォームから登録しましょう。</p>
        </div>
      ) : (
        children.map((child) => (
          <div className="card" key={child.id}>
            <h2>{child.name}</h2>
            {child.birth_date && <p>誕生日: {child.birth_date}</p>}

            <h3>アレルギー</h3>
            {child.allergies.length > 0 ? (
              <ul style={{ paddingLeft: 20 }}>
                {child.allergies.map((a) => (
                  <li key={a.id} style={{ marginBottom: 4 }}>
                    {a.ingredient}{" "}
                    <button
                      onClick={() => api.deleteAllergy(child.id, a.id).then(load).catch((e) => setError(String(e)))}
                      style={deleteBtnStyle}
                    >
                      削除
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>なし</p>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddAllergy(child.id)}
                placeholder="アレルギー食材（例: 卵）"
                style={inputStyle}
              />
              <button className="button" onClick={() => handleAddAllergy(child.id)} disabled={!allergyInput.trim()}>
                追加
              </button>
            </div>

            <h3 style={{ marginTop: 16 }}>好き嫌い</h3>
            {child.preferences.length > 0 ? (
              <ul style={{ paddingLeft: 20 }}>
                {child.preferences.map((p) => (
                  <li key={p.id} style={{ marginBottom: 4 }}>
                    {p.ingredient}（{p.mode === "exclude" ? "除外" : "改善優先"}）{" "}
                    <button
                      onClick={() =>
                        api.deletePreference(child.id, p.id).then(load).catch((e) => setError(String(e)))
                      }
                      style={deleteBtnStyle}
                    >
                      削除
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>なし</p>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                value={prefInput}
                onChange={(e) => setPrefInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPreference(child.id)}
                placeholder="食材（例: きのこ）"
                style={inputStyle}
              />
              <select value={prefMode} onChange={(e) => setPrefMode(e.target.value)} style={inputStyle}>
                <option value="exclude">除外</option>
                <option value="improve">改善優先</option>
              </select>
              <button className="button" onClick={() => handleAddPreference(child.id)} disabled={!prefInput.trim()}>
                追加
              </button>
            </div>
          </div>
        ))
      )}

      <Link href="/meal-plan" className="button" style={{ marginTop: 24 }}>
        献立を作成する
      </Link>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  fontSize: 15,
  flex: 1,
  minWidth: 160,
};

const deleteBtnStyle: React.CSSProperties = {
  cursor: "pointer",
  background: "none",
  border: "none",
  color: "#dc2626",
  fontSize: 13,
};
