import { getOrderById } from "@sushifrito/db";
import { getDb } from "@/lib/db";
import { ensureFound, handleRoute, HttpError, jsonOk } from "@/lib/http";
import { verifyOrderAccessToken } from "@/lib/order-access-token";
import { type IdRouteContext, readRouteId } from "@/lib/route-params";

export const runtime = "nodejs";

function readOrderAccessToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ") === true) {
    return authorization.slice("Bearer ".length).trim();
  }

  return request.headers.get("x-sushifrito-order-token");
}

export async function GET(
  request: Request,
  context: IdRouteContext
): Promise<Response> {
  return handleRoute(async () => {
    const token = readOrderAccessToken(request);

    if (token === null) {
      throw new HttpError(
        403,
        "forbidden",
        "No autorizado para este pedido",
      );
    }

    const orderId = await readRouteId(context);
    const order = ensureFound(await getOrderById(getDb(), orderId));

    if (!verifyOrderAccessToken(order, token)) {
      throw new HttpError(
        403,
        "forbidden",
        "No autorizado para este pedido",
      );
    }

    return jsonOk(order);
  });
}
