import { getProducts } from "@sushifrito/db";

import { getDb } from "@/lib/db";
import { handleRoute, jsonOk } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  return handleRoute(async () => {
    await getProducts(getDb());

    return jsonOk({
      status: "ok",
      service: "sushifrito-web",
      database: "ok",
      checkedAt: new Date().toISOString()
    });
  });
}
