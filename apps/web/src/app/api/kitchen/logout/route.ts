import { NextResponse } from "next/server";

import { handleRoute } from "@/lib/http";
import { kitchenSessionCookieName } from "@/lib/kitchen-session";

export const runtime = "nodejs";

export async function POST(): Promise<Response> {
  return handleRoute(() => {
    const response = NextResponse.json(
      { success: true },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );

    response.cookies.set(kitchenSessionCookieName, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return Promise.resolve(response);
  });
}
