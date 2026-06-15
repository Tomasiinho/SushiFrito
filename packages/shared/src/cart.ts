import { nanoid } from "nanoid";

import type { CartAddonDto, CartItemDto } from "./types";

type ReadonlyCartAddonDto = Readonly<CartAddonDto>;
type ReadonlyCartItemDto = Readonly<Omit<CartItemDto, "addons">> & {
  readonly addons: readonly ReadonlyCartAddonDto[];
};

export function cloneOrderItemsForCart(items: readonly ReadonlyCartItemDto[]): CartItemDto[] {
  return items.map((item) => ({
    ...item,
    id: nanoid(),
    addons: item.addons.map((addon) => ({
      ...addon,
      id: nanoid(),
    })),
  }));
}
