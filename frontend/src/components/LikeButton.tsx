"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface LikeButtonProps {
  mealId: string;
  recipeId: string;
  recipeName: string;
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
  recipeName,
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
      aria-label={liked
        ? `${recipeName}の「喜んだ」記録を取り消す`
        : `${recipeName}を「喜んだ料理」として記録する`}
      onClick={handleClick}
      disabled={busy}
      title={liked ? "もう一度押すと記録を取り消せます" : "子どもが喜んだ料理として記録します"}
    >
      <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
      <span className="like-button__label">喜んだ</span>
      <span className="like-button__count" aria-hidden="true">
        {count}回
      </span>
    </button>
  );
}
