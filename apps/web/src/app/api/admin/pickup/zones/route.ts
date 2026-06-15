import { upsertPickupZone } from "@sushifrito/db";
import { adminPickupZoneSchema } from "@sushifrito/shared";

import { getDb } from "@/lib/db";
import { handleRoute, jsonOk, parseJsonBody } from "@/lib/http";
import { requireKitchenAccess } from "@/lib/kitchen-auth";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  return handleRoute(async () => {
    requireKitchenAccess(request);

    const input = await parseJsonBody(request, adminPickupZoneSchema);
    const zone = await upsertPickupZone(getDb(), input);

    return jsonOk({ success: true, zone });
  });
}
