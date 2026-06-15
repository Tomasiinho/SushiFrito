import { getProducts } from "@sushifrito/db";

import { getDb } from "@/lib/db";
import { handleRoute, jsonOk } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  return handleRoute(async () => {
    const products = await getProducts(getDb());

    return jsonOk({ products });
  });
}
