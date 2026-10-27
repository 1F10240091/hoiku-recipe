import catalog from "../../../backend/app/data/allergens.json";

import rules from "../../../backend/app/data/allergen-ingredients.json";

export const allergenCatalog = catalog;
export type StandardAllergen = (typeof catalog.items)[number];
function normalize(value: string): string {
  return Array.from(value.normalize("NFKC").trim().toLowerCase(), (character) => {
    const code = character.charCodeAt(0);
    return code >= 0x30a1 && code <= 0x30f6 ? String.fromCharCode(code - 0x60) : character;
  }).join("");
}
const aliasToName = new Map(catalog.items.flatMap((item) => [item.name, item.label, ...item.aliases].map((alias) => [normalize(alias), item.name] as const)));
export function canonicalAllergen(value: string): string {
  return aliasToName.get(normalize(value)) ?? value.trim();
}


const relatedFoods: Record<string, string[]> = rules.related_ingredients;
const matchTerms = new Map(catalog.items.map((item) => [item.name,
  Array.from(new Set([item.name, item.label, ...item.aliases, ...(relatedFoods[item.name] ?? [])].map(normalize))),
]));

/** A conservative keyword match, never a guarantee of product composition. */
export function matchesAllergen(ingredient: string, target: string): boolean {
  if (!ingredient.trim()) return false;
  const terms = matchTerms.get(canonicalAllergen(ingredient)) ?? [normalize(ingredient)];
  const text = normalize(target);
  return terms.some((term) => text.includes(term));
}

export function relatedAllergens(ingredient: string): string[] {
  const text = normalize(ingredient);
  return Array.from(matchTerms).filter(([, terms]) => terms.some((term) => text.includes(term))).map(([name]) => name);
}
