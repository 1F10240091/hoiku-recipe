"use client";

import { useEffect, useState } from "react";
import { api, type Recipe } from "@/lib/api";
import RecipeIllustration from "./RecipeIllustration";

export default function RecipePhoto({ recipe }: { recipe: Recipe }) {
  const [photo, setPhoto] = useState<{ id: string; url: string } | null>(null);
  useEffect(() => {
    if (!recipe.has_image) return;
    let active = true;
    let url: string | undefined;
    api.getRecipeImage(recipe.id).then((blob) => {
      if (!active) return;
      url = URL.createObjectURL(blob);
      setPhoto({ id: recipe.id, url });
    }).catch(() => undefined);
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [recipe.id, recipe.has_image]);
  if (!recipe.has_image || photo?.id !== recipe.id) return <RecipeIllustration recipe={recipe} />;
  // Authenticated blob URLs cannot be fetched by the Next.js image optimizer.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="recipe-photo" src={photo.url} alt={`${recipe.name}の写真`} />;
}
