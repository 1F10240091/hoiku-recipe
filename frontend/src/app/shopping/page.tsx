"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation } from "@/lib/useMutation";
import MutationStatus from "@/components/MutationStatus";
import AppNav from "@/components/AppNav";
import { api, type ShoppingItem } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";

export default function ShoppingPage() {
  const authReady = useRequireAuth();
  const mutation = useMutation();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [inventory, setInventory] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [checks, setChecks] = useState<ShoppingItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([api.getShoppingList(), api.listInventory()])
      .then(([list, inv]) => {
        setItems(list.items);
        setChecks(list.inventory_checks || []);
        setInventory(inv);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "読み込みに失敗しました"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authReady) load();
  }, [authReady]);

  const handleAdd = async () => {
    const name = newItem.trim();
    if (!name) return;
    await mutation.run("在庫を追加中", async () => {
      const added = await api.addInventory(name, newQuantity.trim() || undefined);
      setNewQuantity("");
      setInventory((items) => [...items, added]); setNewItem("");
      try { const list = await api.getShoppingList(); setItems(list.items); setChecks(list.inventory_checks || []); }
      catch { setError("在庫は追加しましたが、買い物リストを更新できませんでした。再読み込みしてください。"); }
    }, "在庫を追加しました。");
  };
  const handleDelete = async (id: string) => {
    await mutation.run("在庫を削除中", async () => {
      await api.deleteInventory(id);
      setInventory((items) => items.filter((item) => item.id !== id));
      try { const list = await api.getShoppingList(); setItems(list.items); setChecks(list.inventory_checks || []); }
      catch { setError("在庫は削除しましたが、買い物リストを更新できませんでした。再読み込みしてください。"); }
    }, "在庫を削除しました。");
  };

  return (
    <main className="main">
      <AppNav />
      <div className="container" style={{ paddingBottom: 80 }}>
        <div className="page-header">
          <p className="page-header__en">SHOPPING MEMO</p>
          <h1 className="page-header__title">買い物リスト</h1>
          <p className="page-header__subtitle">
            献立で不足している食材と、冷蔵庫の在庫を確認できます。
          </p>
        </div>
        <MutationStatus {...mutation} />
        {error && <div className="alert alert--error">{error}</div>}
        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : items.length === 0 ? (
          <div className="card">
            <p className="card__text">
              まだ不足食材がありません。先に
              こんだて提案で献立を生成してください。
            </p>
            <Link href="/meal-plan" className="button">
              献立を作成する
            </Link>
          </div>
        ) : (
          <div className="card">
            <h2 className="card__title">不足食材</h2>
            <ul className="list">
              {items.map((item) => (
                <li key={`${item.name}-${item.unit ?? ""}`} className="list__item">
                  <div>
                    <p className="list__item-title">{item.name}</p>
                    {item.needed && (
                      <p className="list__item-text">必要量: {item.needed}</p>
                    )}
                    {item.source_recipes && item.source_recipes.length > 0 && (
                      <p className="list__item-text">
                        必要レシピ: {item.source_recipes.join("、")}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <section className="card">
          <h2>在庫量の確認</h2>
          <p>在庫がある食材も必要量に足りるか確認してください。数量の自動差し引きは行っていません。不足分は買い足してください。</p>
          {checks.map(item => <p key={item.name}>{item.name}：必要量 {item.needed || "不明"} ／ 在庫 {inventory.filter(inv => inv.name.normalize("NFKC").trim().toLowerCase() === item.name.normalize("NFKC").trim().toLowerCase()).map(inv => inv.quantity || "数量未登録").join("、")}</p>)}
          {!checks.length && <p>在庫と一致する必要食材はありません。</p>}
        </section>
        <h2 style={{ marginTop: 40 }}>冷蔵庫の在庫</h2>
        <div className="card">
          <div className="input-row" style={{ marginBottom: 8 }}>
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="食材名（例: 玉ねぎ）"
              className="input"
            />
            <input className="input" aria-label="在庫量" placeholder="在庫量（例：2個、200g）" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} maxLength={50} />
            <button
              className="button"
              onClick={handleAdd}
              disabled={!newItem.trim() || Boolean(mutation.pending)}
            >
              追加
            </button>
          </div>
          {inventory.length === 0 ? (
            <p className="card__text">在庫はまだありません。</p>
          ) : (
            <ul className="list">
              {inventory.map((item) => (
                <li key={item.id ?? item.name} className="list__item">
                  <span>{item.name}：{item.quantity || "数量未登録"}</span>
                  <button
                    disabled={Boolean(mutation.pending)}
                    onClick={() => handleDelete(item.id!)}
                    className="button button--danger button--sm"
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
