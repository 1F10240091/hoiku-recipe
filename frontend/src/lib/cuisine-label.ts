/** 現行・旧データの料理ジャンルを画面用の3分類に揃える。 */
export function cuisineLabel(cuisine?: string | null): string {
  switch (cuisine) {
    case "和":
    case "和食":
    case "沖縄":
      return "和食";
    case "洋":
    case "洋食":
    case "伊":
    case "仏":
      return "洋食";
    case "中":
    case "中華":
      return "中華";
    default:
      return cuisine ? `${cuisine}料理` : "和食";
  }
}
