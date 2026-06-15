import type { ReactElement } from "react";
import { redirect } from "next/navigation";

import { KitchenBoard } from "@/components/kitchen/kitchen-board";
import { hasKitchenSessionFromCookies } from "@/lib/kitchen-server-auth";

export default async function KitchenPage(): Promise<ReactElement> {
  if (!(await hasKitchenSessionFromCookies())) {
    redirect("/kitchen/login");
  }

  return <KitchenBoard />;
}
