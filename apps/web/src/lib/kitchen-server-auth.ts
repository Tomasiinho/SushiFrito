import "server-only";

import { cookies } from "next/headers";

import {
  kitchenSessionCookieName,
  validateKitchenSessionToken,
} from "@/lib/kitchen-session";

export async function hasKitchenSessionFromCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(kitchenSessionCookieName)?.value ?? null;

  return validateKitchenSessionToken(token);
}
