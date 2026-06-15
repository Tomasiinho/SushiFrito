import { registerDeviceToken } from "@sushifrito/db";
import { deviceTokenSchema } from "@sushifrito/shared";

import { getDb } from "@/lib/db";
import { handleRoute, jsonOk, parseJsonBody } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  return handleRoute(async () => {
    const input = await parseJsonBody(request, deviceTokenSchema);
    const device = await registerDeviceToken(getDb(), input);

    return jsonOk({ success: true, device }, { status: 201 });
  });
}
