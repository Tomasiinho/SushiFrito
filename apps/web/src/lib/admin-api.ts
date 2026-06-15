import {
  adminPickupBlockSchema,
  adminPickupZoneSchema,
  adminProductSchema,
  type PickupZoneDto,
  type ProductDto,
} from "@sushifrito/shared";
import type { z } from "zod";

export type ProductDraft = z.output<typeof adminProductSchema>;
export type PickupZoneDraft = z.output<typeof adminPickupZoneSchema>;
export type PickupBlockDraft = z.output<typeof adminPickupBlockSchema>;

type AdminState = {
  products: ProductDto[];
  zones: PickupZoneDto[];
};

type ProductsResponse = {
  products: ProductDto[];
};

type PickupResponse = {
  zones: PickupZoneDto[];
};

async function fetchJson<ResponseBody>(
  path: string,
  init?: RequestInit,
): Promise<ResponseBody> {
  const headers = new Headers(init?.headers);

  if (init?.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers,
  });

  if (!response.ok) {
    throw new Error("No se pudo guardar la configuracion");
  }

  return (await response.json()) as ResponseBody;
}

export async function fetchAdminState(): Promise<AdminState> {
  const [productsResponse, pickupResponse] = await Promise.all([
    fetchJson<ProductsResponse>("/api/admin/products"),
    fetchJson<PickupResponse>("/api/admin/pickup"),
  ]);

  return {
    products: productsResponse.products,
    zones: pickupResponse.zones,
  };
}

export async function saveProduct(draft: ProductDraft): Promise<void> {
  await fetchJson("/api/admin/products", {
    body: JSON.stringify(adminProductSchema.parse(draft)),
    method: "POST",
  });
}

export async function savePickupZone(draft: PickupZoneDraft): Promise<void> {
  await fetchJson("/api/admin/pickup/zones", {
    body: JSON.stringify(adminPickupZoneSchema.parse(draft)),
    method: "POST",
  });
}

export async function savePickupBlock(draft: PickupBlockDraft): Promise<void> {
  await fetchJson("/api/admin/pickup/blocks", {
    body: JSON.stringify(adminPickupBlockSchema.parse(draft)),
    method: "POST",
  });
}
