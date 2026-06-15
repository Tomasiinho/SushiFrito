import { NextResponse } from "next/server";
import { z } from "zod";

import { handleRoute, HttpError, parseJsonBody } from "@/lib/http";
import {
  createKitchenSessionToken,
  kitchenSessionCookieName,
  kitchenSessionMaxAgeSeconds,
  readKitchenPassword,
  timingSafeTextEqual,
} from "@/lib/kitchen-session";

export const runtime = "nodejs";

const loginSchema = z
  .object({
    password: z.string().min(1).max(200),
  })
  .strict();

export async function POST(request: Request): Promise<Response> {
  return handleRoute(async () => {
    const input = await parseJsonBody(request, loginSchema);

    if (!timingSafeTextEqual(input.password, readKitchenPassword())) {
      throw new HttpError(401, "unauthorized", "Password invalido");
    }

    const response = NextResponse.json(
      {
        success: true,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );

    response.cookies.set(
      kitchenSessionCookieName,
      createKitchenSessionToken(),
      {
        httpOnly: true,
        maxAge: kitchenSessionMaxAgeSeconds(),
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    );

    return response;
  });
}
