"use client";
import { useEffect, useRef, useState } from "react";
import { api, type Child } from "@/lib/api";
import { useMutation } from "@/lib/useMutation";
import MutationStatus from "./MutationStatus";

export default function ChildCreateDialog({ onCreated, onDismiss }: {
  onCreated: (child: Child) => void; onDismiss: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const mutation = useMutation();
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  useEffect(() => { dialog.current?.showModal(); }, []);
  const dismiss = () => { if (!mutation.pending) dialog.current?.close(); };
  return <dialog ref={dialog} className="child-create-dialog" aria-labelledby="child-create-title"
    onClose={onDismiss} onCancel={(event) => { if (mutation.pending) event.preventDefault(); }}>
    <div className="child-card-heading"><h2 id="child-create-title">お子様を追加</h2>
      <button type="button" className="button button--secondary button--sm" disabled={Boolean(mutation.pending)} aria-label="追加画面を閉じる" onClick={dismiss}>閉じる</button>
    </div>
    <p className="note">追加したお子様のカードでアレルギー・好き嫌いを設定できます。</p>
    <MutationStatus {...mutation} />
    <form onSubmit={(event) => { event.preventDefault(); if (!name.trim()) return; void mutation.run("お子様を追加中", async () => {
      const child = await api.createChild({ name: name.trim(), birth_date: birth ? `${birth}-01` : null, allergies: [], preferences: [] });
      onCreated(child); dialog.current?.close();
    }, "お子様を追加しました。"); }}>
      <fieldset className="recipe-post-fields" disabled={Boolean(mutation.pending)}>
        <label className="form-field"><span>名前</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="例：はなこ" maxLength={100} required /></label>
        <label className="form-field"><span>生年月（任意）</span><input className="input" type="month" value={birth} onChange={(e) => setBirth(e.target.value)} /></label>
        <div className="child-card-actions"><button className="button" disabled={!name.trim()}>{mutation.pending ? "追加中…" : "追加する"}</button>
          <button type="button" className="button button--secondary" onClick={dismiss}>キャンセル</button></div>
      </fieldset>
    </form>
  </dialog>;
}
