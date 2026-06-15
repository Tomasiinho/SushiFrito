import { listAdminProducts, upsertAdminProduct } from "@sushifrito/db";
import { adminProductSchema } from "@sushifrito/shared";

import { getDb } from "@/lib/db";
import { handleRoute, jsonOk, parseJsonBody } from "@/lib/http";
import { requireKitchenAccess } from "@/lib/kitchen-auth";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  return handleRoute(async () => {
    requireKitchenAccess(request);

    const products = await listAdminProducts(getDb());

    return jsonOk({ products });
  });
}

export async function POST(request: Request): Promise<Response> {
  return handleRoute(async () => {
    requireKitchenAccess(request);

    const input = await parseJsonBody(request, adminProductSchema);
    const product = await upsertAdminProduct(getDb(), input);

    return jsonOk({ product, success: true });
  });
}
