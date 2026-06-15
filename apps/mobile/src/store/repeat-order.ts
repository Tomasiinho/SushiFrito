import type { CartItem } from "@/types/cart";
import type { OrderDto } from "@/types/shared";
import { createClientId, type IdFactory } from "@/utils/id";

export type RepeatOrderOptions = {
  createId?: IdFactory;
};

export const createCartItemsFromOrder = (
  order: OrderDto,
  options: RepeatOrderOptions = {}
): CartItem[] => {
  const createId = options.createId ?? createClientId;

  return order.items.map((item) => ({
    id: createId(),
    productId: item.productId,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    sauces: [...item.sauces],
    chopsticks: item.chopsticks,
    ...(item.imageUrl ? { imageUrl: item.imageUrl } : {}),
    ...(item.notes ? { notes: item.notes } : {})
  }));
};
