import type { ProductDto } from "@/types/shared";

export type CatalogFilterId =
  | "all"
  | "combos"
  | "favorites"
  | "fried"
  | "handrolls"
  | "sides"
  | "upla"
  | "valpo"
  | "veggie";

export const catalogFilters: readonly {
  id: CatalogFilterId;
  label: string;
}[] = [
  { id: "all", label: "Todo" },
  { id: "favorites", label: "Favoritos" },
  { id: "fried", label: "Fritos" },
  { id: "handrolls", label: "Handrolls" },
  { id: "combos", label: "Combos" },
  { id: "upla", label: "UPLA" },
  { id: "valpo", label: "Centro" },
  { id: "veggie", label: "Veggie" },
  { id: "sides", label: "Para sumar" },
];

const hasText = (product: ProductDto, text: string): boolean =>
  `${product.name} ${product.description} ${product.category} ${(product.tags ?? []).join(" ")}`
    .toLowerCase()
    .includes(text);

const hasCategory = (
  product: ProductDto,
  categories: readonly string[],
): boolean => categories.includes(product.category.toLowerCase());

export const matchesCatalogFilter = (
  product: ProductDto,
  filter: CatalogFilterId,
): boolean => {
  switch (filter) {
    case "all":
      return true;
    case "favorites":
      return (
        product.tags?.some((tag) => tag.toLowerCase().includes("pedido")) ??
        false
      );
    case "fried":
      return (
        hasText(product, "frito") ||
        hasText(product, "furai") ||
        hasText(product, "crunch") ||
        hasText(product, "crispy") ||
        hasText(product, "tempura") ||
        hasText(product, "panko")
      );
    case "handrolls":
      return (
        hasCategory(product, ["handroll", "handrolls"]) ||
        hasText(product, "handroll")
      );
    case "combos":
      return (
        hasCategory(product, ["box", "boxes", "combo", "promo"]) ||
        hasText(product, "combo")
      );
    case "upla":
      return (
        hasText(product, "upla") ||
        hasText(product, "facultad") ||
        hasText(product, "playa ancha") ||
        hasText(product, "curauma") ||
        hasText(product, "salud")
      );
    case "valpo":
      return (
        hasText(product, "valpo") ||
        hasText(product, "valparaiso") ||
        hasText(product, "valparaíso") ||
        hasText(product, "centro") ||
        hasText(product, "victoria") ||
        hasText(product, "anibal") ||
        hasText(product, "aníbal") ||
        hasText(product, "puerto")
      );
    case "veggie":
      return (
        hasCategory(product, ["veggie", "vegetarian"]) ||
        hasText(product, "veggie")
      );
    case "sides":
      return (
        hasCategory(product, ["side", "sides", "drink", "drinks"]) ||
        hasText(product, "gyoza") ||
        hasText(product, "bebida") ||
        hasText(product, "jengibre")
      );
  }
};
