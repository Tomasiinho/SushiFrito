import { randomUUID } from "node:crypto";

import type { CreateOrderInput } from "@sushifrito/shared";

import type { addons, products } from "../schema";
import { RepositoryError } from "./errors";

type ProductRow = typeof products.$inferSelect;
type AddonRow = typeof addons.$inferSelect;

type AddonDraft = {
  addonId: string;
  addonName: string;
  id: string;
  quantity: number;
  unitPrice: number;
};

export type ItemDraft = {
  addons: readonly AddonDraft[];
  id: string;
  lineAddonTotal: number;
  lineSubtotal: number;
  notes: string | null;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

export function buildItemDrafts(
  input: CreateOrderInput,
  productRows: readonly ProductRow[],
  addonRows: readonly AddonRow[],
): ItemDraft[] {
  const productById = new Map(productRows.map((product) => [product.id, product]));
  const addonById = new Map(addonRows.map((addon) => [addon.id, addon]));

  return input.items.map((item) => {
    const product = productById.get(item.productId);

    if (product === undefined || !product.isAvailable) {
      throw new RepositoryError("Product is not available");
    }

    const itemAddons = item.addons.map((addonInput) => {
      const addon = addonById.get(addonInput.addonId);

      if (addon === undefined || !addon.isAvailable) {
        throw new RepositoryError("Addon is not available");
      }

      return {
        addonId: addon.id,
        addonName: addon.name,
        id: randomUUID(),
        quantity: addonInput.quantity,
        unitPrice: addon.price,
      };
    });

    return {
      addons: itemAddons,
      id: randomUUID(),
      lineAddonTotal: itemAddons.reduce((total, addon) => total + addon.unitPrice * addon.quantity * item.quantity, 0),
      lineSubtotal: product.price * item.quantity,
      notes: item.notes ?? null,
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
    };
  });
}
