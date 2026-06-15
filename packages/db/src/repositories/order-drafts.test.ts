import { describe, expect, it } from "vitest";

import type { CreateOrderInput } from "@sushifrito/shared";

import type { addons, products } from "../schema";
import { RepositoryError } from "./errors";
import { buildItemDrafts } from "./order-drafts";

type ProductRow = typeof products.$inferSelect;
type AddonRow = typeof addons.$inferSelect;

const now = new Date("2026-06-14T12:00:00.000Z");
const productId = "018f5c25-0678-7c40-a071-054a5a7f2b19";
const addonId = "028f5c25-0678-7c40-a071-054a5a7f2b19";

const baseInput: CreateOrderInput = {
  customerEmail: null,
  customerId: null,
  customerName: "Cliente SushiFrito",
  customerPhone: "+56912345678",
  items: [
    {
      addons: [{ addonId, quantity: 2 }],
      notes: "Sin cebollin",
      productId,
      quantity: 3,
    },
  ],
  notes: null,
  paymentMethod: "debit",
  scheduled: null,
};

const product: ProductRow = {
  category: "roll",
  createdAt: now,
  description: "Roll frito",
  id: productId,
  imageUrl: null,
  isAvailable: true,
  name: "Crunchy Valpo Roll",
  price: 5000,
  slug: "crunchy-valpo-roll",
  sortOrder: 1,
  updatedAt: now,
};

const addon: AddonRow = {
  createdAt: now,
  id: addonId,
  isAvailable: true,
  name: "Salsa acevichada",
  price: 500,
  sortOrder: 1,
  updatedAt: now,
};

describe("buildItemDrafts", () => {
  it("calcula subtotales y addons multiplicando por cantidad de items", () => {
    const [draft] = buildItemDrafts(baseInput, [product], [addon]);

    expect(draft?.lineSubtotal).toBe(15000);
    expect(draft?.lineAddonTotal).toBe(3000);
    expect(draft?.addons[0]?.addonName).toBe("Salsa acevichada");
  });

  it("rechaza productos o addons no disponibles", () => {
    expect(() =>
      buildItemDrafts(baseInput, [{ ...product, isAvailable: false }], [addon]),
    ).toThrow(RepositoryError);

    expect(() =>
      buildItemDrafts(baseInput, [product], [{ ...addon, isAvailable: false }]),
    ).toThrow(RepositoryError);
  });
});
