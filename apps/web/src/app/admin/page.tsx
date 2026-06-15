import type { ReactElement } from "react";
import { redirect } from "next/navigation";

import { AdminPanel } from "@/components/admin/admin-panel";
import { hasKitchenSessionFromCookies } from "@/lib/kitchen-server-auth";

export default async function AdminPage(): Promise<ReactElement> {
  if (!(await hasKitchenSessionFromCookies())) {
    redirect("/kitchen/login");
  }

  return <AdminPanel />;
}
