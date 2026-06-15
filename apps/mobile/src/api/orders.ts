import { createOrderSchema } from "@/contracts/shared";
import { apiFetch } from "@/api/client";
import type {
  CreateOrderPayload,
  OrderDto,
  OrderStatus,
  ProductDto,
} from "@/types/shared";
import type {
  OrderDto as ApiOrderDto,
  ProductDto as ApiProductDto,
} from "@sushifrito/shared";

export type CreateOrderResponse = {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  order?: OrderDto;
  pickupCode?: string;
  trackingToken?: string;
};

export type RegisterPushTokenPayload = {
  customerId: string | null;
  deviceId: string;
  platform: "ios" | "android" | "web";
  token: string;
};

type ProductsResponse = {
  products: ApiProductDto[];
};

type OrdersHistoryResponse = {
  orders: ApiOrderDto[];
};

type CreateOrderApiResponse = {
  order: ApiOrderDto;
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  trackingToken: string | null;
};

export const fetchCatalog = (): Promise<ProductDto[]> =>
  apiFetch<ProductsResponse>("/api/products").then((response) =>
    response.products.map(toMobileProduct),
  );

export const createOrder = (
  payload: CreateOrderPayload,
  customerToken?: string,
): Promise<CreateOrderResponse> =>
  apiFetch<CreateOrderApiResponse>("/api/orders", {
    method: "POST",
    ...(customerToken
      ? {
          headers: {
            "X-SushiFrito-Customer-Token": customerToken,
          },
        }
      : {}),
    body: createOrderSchema.parse(payload),
  }).then((response) => {
    const mobileOrder = toMobileOrder(
      response.order,
      response.trackingToken ?? undefined,
    );

    return {
      order: mobileOrder,
      orderId: response.orderId,
      orderNumber: response.orderNumber,
      ...(mobileOrder.pickupCode ? { pickupCode: mobileOrder.pickupCode } : {}),
      ...(mobileOrder.trackingToken
        ? { trackingToken: mobileOrder.trackingToken }
        : {}),
      status: response.status,
    };
  });

export const fetchCustomerOrders = (
  customerId: string,
  customerToken: string,
): Promise<OrderDto[]> =>
  apiFetch<OrdersHistoryResponse>(
    `/api/orders/history?customerId=${encodeURIComponent(customerId)}`,
    {
      headers: {
        "X-SushiFrito-Customer-Token": customerToken,
      },
    },
  ).then((response) => response.orders.map((order) => toMobileOrder(order)));

export const fetchOrder = (
  orderId: string,
  trackingToken: string,
): Promise<OrderDto> =>
  apiFetch<ApiOrderDto>(`/api/orders/${encodeURIComponent(orderId)}`, {
    headers: {
      "X-SushiFrito-Order-Token": trackingToken,
    },
  }).then((order) => toMobileOrder(order, trackingToken));

export const registerPushToken = (
  payload: RegisterPushTokenPayload,
): Promise<{ ok: true }> =>
  apiFetch<{ success: true }>("/api/devices/push-token", {
    method: "POST",
    body: payload,
  }).then(() => ({ ok: true }));

function toMobileProduct(product: ApiProductDto): ProductDto {
  const tags = productTags(product);

  return {
    category: product.category,
    description: product.description,
    id: product.id,
    imageUrl: product.imageUrl,
    includesChopsticks: true,
    isAvailable: product.isAvailable,
    maxSauces: product.category === "boxes" ? 3 : 2,
    name: product.name,
    price: product.price,
    tags,
  };
}

function productTags(product: ApiProductDto): string[] {
  const text =
    `${product.name} ${product.description} ${product.category}`.toLowerCase();
  const tags = new Set<string>();

  if (
    text.includes("upla") ||
    text.includes("facultad") ||
    text.includes("curauma") ||
    text.includes("salud")
  ) {
    tags.add("UPLA");
  }

  if (
    text.includes("valpo") ||
    text.includes("valparaiso") ||
    text.includes("valparaíso") ||
    text.includes("centro") ||
    text.includes("puerto")
  ) {
    tags.add("Valparaíso");
  }

  if (
    text.includes("frito") ||
    text.includes("furai") ||
    text.includes("crunch") ||
    text.includes("crispy") ||
    text.includes("tempura") ||
    text.includes("panko")
  ) {
    tags.add("Frito");
  }

  if (
    product.category === "boxes" ||
    text.includes("box") ||
    text.includes("combo")
  ) {
    tags.add("Combo");
  }

  if (product.category === "veggie" || text.includes("veggie")) {
    tags.add("Veggie");
  }

  if (
    product.slug === "upla-furai-roll" ||
    product.slug === "crunchy-valpo-roll" ||
    product.slug === "box-estudiante"
  ) {
    tags.add("Más pedido");
  }

  return Array.from(tags);
}

export function toMobileOrder(
  order: ApiOrderDto,
  trackingToken?: string,
): OrderDto {
  return {
    createdAt: order.createdAt,
    customerId: order.customerId ?? "guest-customer",
    id: order.id,
    items: order.items.map((item) => ({
      chopsticks: item.addons.some((addon) =>
        addon.name.toLowerCase().includes("palitos"),
      ),
      id: item.id,
      name: item.name,
      productId: item.productId,
      quantity: item.quantity,
      sauces: item.addons
        .filter((addon) => !addon.name.toLowerCase().includes("palitos"))
        .map((addon) => addon.name),
      unitPrice: item.unitPrice,
      ...(item.notes ? { notes: item.notes } : {}),
    })),
    orderNumber: order.orderNumber,
    pickupCode: order.orderNumber,
    ...(order.scheduledFor
      ? { scheduledForDate: order.scheduledFor.slice(0, 10) }
      : {}),
    ...(order.scheduledBlockStart && order.scheduledBlockEnd
      ? {
          scheduledForBlockId: `${order.scheduledBlockStart}-${order.scheduledBlockEnd}`,
        }
      : {}),
    ...(order.scheduledZone ? { scheduledZone: order.scheduledZone } : {}),
    status: order.status,
    total: order.total,
    ...(trackingToken ? { trackingToken } : {}),
  };
}
