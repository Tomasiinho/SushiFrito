import { setKitchenPaused } from "@sushifrito/db";
import { kitchenPauseSchema } from "@sushifrito/shared";

import { getDb } from "@/lib/db";
import { handleRoute, jsonOk, parseJsonBody } from "@/lib/http";
import { requireKitchenMutationAccess } from "@/lib/kitchen-auth";
import { emitRealtimeEvent } from "@/lib/realtime";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  return handleRoute(async () => {
    requireKitchenMutationAccess(request);

    const input = await parseJsonBody(request, kitchenPauseSchema);
    const summary = await setKitchenPaused(getDb(), input.paused);

    await emitRealtimeEvent({
      event: "kitchen.summary_changed",
      payload: summary,
    });

    return jsonOk(summary);
  });
}
