"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.register(email, password, name);
      localStorage.setItem("token", res.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    }
  };

  return (
    <main style={{ maxWidth: 400, margin: "80px auto", padding: "0 24px" }}>
      <h1 style={{ textAlign: "center" }}>新規登録</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <input
          type="text"
          placeholder="名前（任意）"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
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
          placeholder="パスワード（8文字以上）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          style={inputStyle}
        />
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        <button type="submit" className="button">
          登録する
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: 24 }}>
        すでにアカウントをお持ちの方は <Link href="/login">ログイン</Link>
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
