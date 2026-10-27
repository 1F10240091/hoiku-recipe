"use client";
import { useRef, useState } from "react";

/** Serialize writes and keep immediate, accessible progress visible. */
export function useMutation() {
  const lock = useRef(false);
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const run = async (label: string, action: () => Promise<void>, success = "保存しました。") => {
    if (lock.current) return;
    lock.current = true; setPending(label); setError(""); setMessage("");
    try { await action(); setMessage(success); }
    catch (error) { setError(error instanceof Error ? error.message : "処理に失敗しました。もう一度お試しください。"); }
    finally { lock.current = false; setPending(""); }
  };
  return { pending, error, message, run };
}
