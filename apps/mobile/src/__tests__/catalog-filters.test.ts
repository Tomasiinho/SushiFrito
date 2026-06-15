import { describe, expect, it } from "vitest";

import { matchesCatalogFilter } from "@/screens/catalog-filters";
import type { ProductDto } from "@/types/shared";

const baseProduct: ProductDto = {
  category: "rolls",
  description: "Base",
  id: "product-1",
  isAvailable: true,
  name: "Base Roll",
  price: 5000,
};

describe("catalog filters", () => {
  it("matches the categories that Neon returns", () => {
    expect(
      matchesCatalogFilter(
        { ...baseProduct, category: "boxes", name: "Plaza Victoria Box" },
        "combos",
      ),
    ).toBe(true);
    expect(
      matchesCatalogFilter(
        { ...baseProduct, category: "handrolls", name: "Centro Handroll" },
        "handrolls",
      ),
    ).toBe(true);
    expect(
      matchesCatalogFilter(
        { ...baseProduct, category: "sides", name: "Gyozas Valpo" },
        "sides",
      ),
    ).toBe(true);
  });

  it("matches operational location tags", () => {
    expect(
      matchesCatalogFilter(
        {
          ...baseProduct,
          description: "Retiro en Facultad de Humanidades",
          tags: ["UPLA"],
        },
        "upla",
      ),
    ).toBe(true);
    expect(
      matchesCatalogFilter(
        {
          ...baseProduct,
          description: "Pausa corta en Plaza Victoria",
          tags: ["Valparaíso"],
        },
        "valpo",
      ),
    ).toBe(true);
  });
});
