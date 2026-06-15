import type { ProductDto } from "@/types/shared";

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  sauces: string[];
  chopsticks: boolean;
  imageUrl?: string | null;
  notes?: string;
};

export type CartProductOptions = {
  sauces: string[];
  chopsticks: boolean;
  quantity?: number;
  notes?: string;
};

export type CartTotals = {
  itemCount: number;
  subtotal: number;
};

export type AddToCartInput = {
  product: ProductDto;
  options: CartProductOptions;
};
