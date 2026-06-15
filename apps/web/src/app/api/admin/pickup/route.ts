import { getPickupSchedule } from "@sushifrito/db";

import { getDb } from "@/lib/db";
import { handleRoute, jsonOk } from "@/lib/http";
import { requireKitchenAccess } from "@/lib/kitchen-auth";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  return handleRoute(async () => {
    requireKitchenAccess(request);

    const zones = await getPickupSchedule(getDb(), true);

    return jsonOk({ zones });
  });
}
