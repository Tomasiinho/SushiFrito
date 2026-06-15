import { getKitchenOrders } from "@sushifrito/db";

import { getDb } from "@/lib/db";
import { handleRoute, jsonOk } from "@/lib/http";
import { requireKitchenAccess } from "@/lib/kitchen-auth";
import { toLegacyActiveOrdersResponse } from "@/lib/legacy";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  return handleRoute(async () => {
    requireKitchenAccess(request);

    const orders = await getKitchenOrders(getDb());

    return jsonOk(toLegacyActiveOrdersResponse(orders));
  });
}
