"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import { api, type ShoppingItem } from "@/lib/api";

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [inventory, setInventory] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([api.getShoppingList(), api.listInventory()])
      .then(([list, inv]) => {
        setItems(list.items);
        setInventory(inv);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "読み込みに失敗しました"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async () => {
    const name = newItem.trim();
    if (!name) return;
    setError(null);
    try {
      await api.addInventory(name);
      setNewItem("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "追加に失敗しました");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteInventory(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  return (
    <main>
      <AppNav />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <h1>買い物リスト</h1>
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      {loading ? (
        <p>読み込み中...</p>
      ) : items.length === 0 ? (
        <div className="card">
          <p>まだ不足食材がありません。先に AI 献立提案で献立を生成してください。</p>
          <Link href="/meal-plan" className="button">
            献立を作成する
          </Link>
        </div>
      ) : (
        <div className="card">
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {items.map((item) => (
              <li
                key={item.name}
                style={{
                  padding: "12px 0",
                  borderBottom: "1px solid var(--color-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div>
                  <strong>{item.name}</strong>
                  {item.needed && <span style={{ marginLeft: 8, color: "#666" }}>{item.needed}</span>}
                  {item.source_recipes && item.source_recipes.length > 0 && (
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>
                      必要: {item.source_recipes.join("、")}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 style={{ marginTop: 40 }}>冷蔵庫の在庫</h2>
      <div className="card">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="食材名（例: 玉ねぎ）"
            style={inputStyle}
          />
          <button className="button" onClick={handleAdd} disabled={!newItem.trim()}>
            追加
          </button>
        </div>
        {inventory.length === 0 ? (
          <p>在庫はまだありません。</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {inventory.map((item) => (
              <li
                key={item.id ?? item.name}
                style={{
                  padding: "8px 0",
                  borderBottom: "1px solid var(--color-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{item.name}</span>
                <button
                  onClick={() => handleDelete(item.id!)}
                  style={{ cursor: "pointer", background: "none", border: "none", color: "#dc2626" }}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: 12,
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  fontSize: 16,
};
