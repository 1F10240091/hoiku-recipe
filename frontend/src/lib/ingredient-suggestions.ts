import { matchesAllergen } from "@/lib/allergens";

function normalize(value: string): string {
  return Array.from(value.normalize("NFKC").trim().toLowerCase(), (character) => {
    const code = character.charCodeAt(0);
    return code >= 0x30a1 && code <= 0x30f6 ? String.fromCharCode(code - 0x60) : character;
  }).join("");
}

export function ingredientSuggestions(candidates: string[], query: string, limit = 6): string[] {
  const needle = normalize(query);
  return Array.from(new Set(candidates.map((name) => name.trim()).filter(Boolean)))
    .filter((name) => normalize(name).includes(needle) || matchesAllergen(query, name))
    .sort((a, b) => Number(normalize(b).startsWith(needle)) - Number(normalize(a).startsWith(needle)) || a.localeCompare(b, "ja"))
    .slice(0, limit);
}
