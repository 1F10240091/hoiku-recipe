import catalog from "../../../backend/app/data/allergens.json";

export const allergenCatalog = catalog;
export type StandardAllergen = (typeof catalog.items)[number];
function normalize(value: string): string {
  return Array.from(value.normalize("NFKC").trim().toLowerCase(), (character) => {
    const code = character.charCodeAt(0);
    return code >= 0x30a1 && code <= 0x30f6 ? String.fromCharCode(code - 0x60) : character;
  }).join("");
}
export function canonicalAllergen(value: string): string {
  return catalog.items.find((item) => [item.name, item.label, ...item.aliases].some((alias) => normalize(alias) === normalize(value)))?.name ?? value.trim();
}
