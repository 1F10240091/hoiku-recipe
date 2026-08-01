"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, isDemoMode } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.login(email, password);
      localStorage.setItem("token", res.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setDemo(true);
    try {
      const res = await api.login("demo@example.com", "password123");
      localStorage.setItem("token", res.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "デモログインに失敗しました");
      setDemo(false);
    }
  };

  return (
    <main style={{ maxWidth: 400, margin: "80px auto", padding: "0 24px" }}>
      <h1 style={{ textAlign: "center" }}>ログイン</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        <button type="submit" className="button">
          ログイン
        </button>
        {isDemoMode() && (
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={demo}
            style={{
              padding: 12,
              borderRadius: 8,
              border: "1px solid var(--color-primary)",
              background: "var(--color-white)",
              color: "var(--color-primary-dark)",
              fontSize: 15,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {demo ? "ログイン中..." : "デモを試す（バックエンド不要）"}
          </button>
        )}
      </form>
      <p style={{ textAlign: "center", marginTop: 24 }}>
        アカウントをお持ちでない方は <Link href="/register">新規登録</Link>
      </p>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  fontSize: 16,
};
