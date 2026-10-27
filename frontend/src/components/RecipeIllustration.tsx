import type { Recipe } from "@/lib/api";

const INGREDIENT_COLORS: Array<[RegExp, string]> = [
  [/にんじん|人参|トマト|かぼちゃ|パプリカ|鮭|えび|りんご|みかん/, "#e88a50"],
  [/ほうれん草|小松菜|ブロッコリー|キャベツ|きゅうり|ピーマン|枝豆|ねぎ|青菜/, "#6f9a65"],
  [/卵|たまご|チーズ|豆腐|じゃがいも|大根|鶏肉|鶏むね/, "#f0cd78"],
  [/豚肉|牛肉|ひき肉|まぐろ|かつお|ハム/, "#ca7772"],
  [/ごはん|米|うどん|パスタ|パン|麺/, "#f4e9cb"],
  [/なす|紫キャベツ|ぶどう|さつまいも/, "#927da9"],
];

function hashText(text: string) {
  let value = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

export default function RecipeIllustration({ recipe }: { recipe: Pick<Recipe, "name" | "meal_type" | "cuisine" | "ingredients"> }) {
  const seed = hashText(`${recipe.name}-${recipe.cuisine ?? "和"}`);
  const random = (index: number, channel: number) =>
    hashText(`${seed}-${index}-${channel}`) / 4294967296;
  const ingredientText = recipe.ingredients.map((item) => item.name).join(" ");
  const palette = INGREDIENT_COLORS.filter(([pattern]) => pattern.test(ingredientText)).map(([, color]) => color);
  const colors = palette.length ? palette : ["#e88a50", "#6f9a65", "#f0cd78", "#ca7772"];
  const isSoup = recipe.meal_type === "soup";
  const isStaple = recipe.meal_type === "staple";
  const food = Array.from({ length: 13 }, (_, index) => {
    const x = 95 + random(index, 0) * 210;
    const y = 65 + random(index, 1) * 90;
    const rx = 7 + random(index, 2) * 9;
    const ry = 5 + random(index, 3) * 6;
    const color = colors[index % colors.length];
    const rotation = Math.round(random(index, 4) * 100 - 50);
    return <ellipse key={index} cx={x} cy={y} rx={rx} ry={ry} fill={color} transform={`rotate(${rotation} ${x} ${y})`} opacity={index % 4 === 0 ? 0.78 : 1} />;
  });

  return (
    <svg className="recipe-illustration" viewBox="0 0 400 220" role="img" aria-label={`${recipe.name}の料理イラスト`}>
      <defs>
        <linearGradient id={`bg-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff5eb" />
          <stop offset="100%" stopColor="#f8e9d8" />
        </linearGradient>
        <radialGradient id={`plate-${seed}`} cx="48%" cy="40%">
          <stop offset="0%" stopColor="#fffefb" />
          <stop offset="100%" stopColor="#f5eee5" />
        </radialGradient>
      </defs>
      <rect width="400" height="220" rx="20" fill={`url(#bg-${seed})`} />
      <circle cx="58" cy="45" r="24" fill="#fff" opacity="0.45" />
      <circle cx="347" cy="178" r="34" fill="#fff" opacity="0.35" />
      {isSoup ? (
        <>
          <ellipse cx="200" cy="119" rx="125" ry="68" fill="#e7d8c5" />
          <ellipse cx="200" cy="111" rx="119" ry="63" fill="#fffdf8" />
          <ellipse cx="200" cy="108" rx="101" ry="48" fill="#f4dba7" />
        </>
      ) : (
        <>
          <ellipse cx="204" cy="123" rx="139" ry="77" fill="#e6d7c5" />
          <ellipse cx="200" cy="116" rx="137" ry="76" fill={`url(#plate-${seed})`} />
          <ellipse cx="200" cy="113" rx="112" ry="57" fill={isStaple ? "#f7edcf" : "#fbf5e9"} />
        </>
      )}
      {food}
      <path d="M300 43c10-10 26-7 29 4-13 2-20 5-29 12-3-6-3-11 0-16Z" fill="#789b6c" opacity=".9" />
      <path d="M319 47c-7 4-13 9-19 16" fill="none" stroke="#fff" strokeWidth="2" opacity=".7" />
      <text x="200" y="202" textAnchor="middle" fill="#765f50" fontSize="12" fontWeight="700" letterSpacing="2" opacity=".8">{recipe.cuisine ?? "和"}のおうちごはん</text>
    </svg>
  );
}
