"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface LikeButtonProps {
  mealId: string;
  recipeId: string;
  liked: boolean;
  count: number;
  onToggled?: (
    mealId: string,
    recipeId: string,
    liked: boolean,
    count: number,
  ) => void;
}

/** 献立の料理ごとに「喜んでた」を記録するボタン。 */
export default function LikeButton({
  mealId,
  recipeId,
  liked,
  count,
  onToggled,
}: LikeButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await api.toggleLike(mealId, recipeId);
      onToggled?.(
        result.meal_id,
        result.recipe_id,
        result.liked,
        result.liked_count,
      );
    } catch (err) {
      console.error("「喜んでた」の記録に失敗しました", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={`like-button${liked ? " like-button--on" : ""}`}
      aria-pressed={liked}
      aria-label={`喜んでた ${count}回`}
      onClick={handleClick}
      disabled={busy}
      title={liked ? "もう一度押すと取り消せます" : "この料理を喜んでたに登録"}
    >
      <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
      <span className="like-button__count" aria-hidden="true">
        {count}
      </span>
    </button>
  );
}
