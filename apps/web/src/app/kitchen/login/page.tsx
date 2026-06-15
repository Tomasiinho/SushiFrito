import type { ReactElement } from "react";
import { redirect } from "next/navigation";

import { KitchenLoginForm } from "@/components/kitchen/kitchen-login-form";
import { hasKitchenSessionFromCookies } from "@/lib/kitchen-server-auth";

export default async function KitchenLoginPage(): Promise<ReactElement> {
  if (await hasKitchenSessionFromCookies()) {
    redirect("/kitchen");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8] px-4 py-10">
      <KitchenLoginForm />
    </main>
  );
}
