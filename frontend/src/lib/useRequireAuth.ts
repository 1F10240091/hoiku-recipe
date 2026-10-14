"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isDemoMode } from "./api";

/**
 * ログイン必須ページ用の認証ガード。
 *
 * - デモモード: 常に許可
 * - トークンあり: 許可
 * - トークンなし: /login へリダイレクト
 *
 * 戻り値が true になるまで保護された API を呼ばないこと。
 */
export function useRequireAuth(): boolean {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isDemoMode() || localStorage.getItem("token")) {
      setReady(true);
      return;
    }
    router.replace("/login");
  }, [router]);

  return ready;
}
