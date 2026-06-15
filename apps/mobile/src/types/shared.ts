import type {
  CreateOrderInput,
  OrderStatus,
  PaymentMethod,
  ScheduleZone,
} from "@sushifrito/shared";

export type { OrderStatus, PaymentMethod, ScheduleZone };

export type ProductCategory = string;

export type ProductDto = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  isAvailable: boolean;
  imageUrl?: string | null;
  tags?: string[];
  maxSauces?: number;
  includesChopsticks?: boolean;
};

export type OrderItemDto = {
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

export type OrderDto = {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: OrderItemDto[];
  pickupCode?: string;
  pickupQrUrl?: string | null;
  readyAt?: string;
  scheduledForDate?: string;
  scheduledForBlockId?: string;
  scheduledZone?: ScheduleZone;
  trackingToken?: string;
};

export type KitchenOrderDto = OrderDto & {
  minutesSinceReceived: number;
  priority: "green" | "yellow" | "red";
  visibleAt: string;
};

export type CreateOrderPayload = CreateOrderInput;
