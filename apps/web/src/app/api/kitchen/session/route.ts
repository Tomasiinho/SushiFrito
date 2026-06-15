import { handleRoute, jsonOk } from "@/lib/http";
import { requireKitchenAccess } from "@/lib/kitchen-auth";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  return handleRoute(() => {
    requireKitchenAccess(request);

    return Promise.resolve(jsonOk({ authenticated: true }));
  });
}
