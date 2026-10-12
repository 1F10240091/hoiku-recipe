"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim()) {
      setError("ユーザーネームを入力してください");
      return;
    }
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordPattern.test(password)) {
      setError(
        "パスワードは8文字以上で、英字と数字をそれぞれ1文字以上含めてください",
      );
      return;
    }
    try {
      const res = await api.register(username.trim(), password);
      localStorage.setItem("token", res.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="auth-card__en">SIGN UP</p>
        <h1 className="auth-card__title">新規登録</h1>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <input
            type="text"
            placeholder="ユーザーネーム（1〜30文字）"
            aria-label="ユーザーネーム"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            maxLength={30}
            className="input"
          />
          <input
            type="password"
            placeholder="パスワード"
            aria-label="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
          <p className="form-field__hint">
            パスワードは8文字以上で、英字と数字をそれぞれ1文字以上含めてください。
          </p>
          {error && <div className="alert alert--error">{error}</div>}
          <button type="submit" className="button button--full">
            登録する
          </button>
        </form>
        <p className="auth-card__footer">
          すでにアカウントをお持ちの方は <Link href="/login">ログイン</Link>
        </p>
      </div>
    </main>
  );
}
