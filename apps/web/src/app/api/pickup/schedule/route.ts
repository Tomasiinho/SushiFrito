import { getPickupSchedule } from "@sushifrito/db";

import { getDb } from "@/lib/db";
import { handleRoute, jsonOk } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  return handleRoute(async () => {
    const zones = await getPickupSchedule(getDb(), false);

    return jsonOk({ zones });
  });
}
