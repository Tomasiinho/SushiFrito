import { upsertPickupBlock } from "@sushifrito/db";
import { adminPickupBlockSchema } from "@sushifrito/shared";

import { getDb } from "@/lib/db";
import { handleRoute, jsonOk, parseJsonBody } from "@/lib/http";
import { requireKitchenAccess } from "@/lib/kitchen-auth";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  return handleRoute(async () => {
    requireKitchenAccess(request);

    const input = await parseJsonBody(request, adminPickupBlockSchema);
    const block = await upsertPickupBlock(getDb(), input);

    return jsonOk({ block, success: true });
  });
}
