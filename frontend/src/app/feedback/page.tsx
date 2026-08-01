"use client";

import { useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import { api } from "@/lib/api";

const RATINGS = [1, 2, 3, 4, 5];

export default function FeedbackPage() {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (rating === null && !comment.trim()) {
      setError("評価またはコメントを入力してください");
      return;
    }
    try {
      await api.submitFeedback(rating, comment);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました");
    }
  };

  return (
    <main id="main-content">
      <AppNav />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <h1>フィードバック</h1>
        <p style={{ color: "var(--color-muted)" }}>
          アプリの使い勝手や改善してほしい点を教えてください。今後の開発に活かします。
        </p>
        {submitted ? (
          <div className="card">
            <p>ご協力ありがとうございました！</p>
            <Link href="/dashboard" className="button">
              ダッシュボードへ戻る
            </Link>
          </div>
        ) : (
          <div className="card">
            <p style={{ marginBottom: 8 }}>満足度（1〜5）</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {RATINGS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRating(r)}
                  aria-pressed={rating === r}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: rating === r ? "var(--color-primary)" : "var(--color-white)",
                    color: rating === r ? "var(--color-white)" : "var(--color-text)",
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
            <label style={{ display: "block", marginBottom: 8 }}>
              ご意見・ご要望
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  marginTop: 4,
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid var(--color-border)",
                  fontSize: 15,
                  fontFamily: "inherit",
                }}
              />
            </label>
            {error && <p style={{ color: "#dc2626" }}>{error}</p>}
            <button className="button" onClick={handleSubmit}>
              送信する
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
