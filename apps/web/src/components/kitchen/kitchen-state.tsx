import { AlertTriangle, Database, RefreshCw, Utensils } from "lucide-react";
import type { ComponentType, ReactElement } from "react";

import { KitchenApiError } from "@/lib/kitchen-api";

interface KitchenShellProps {
  status: "loading" | "error";
  error?: Error | null;
}

export function KitchenShell({
  error = null,
  status,
}: KitchenShellProps): ReactElement {
  const copy = resolveShellCopy(status, error);
  const Icon = status === "loading" ? RefreshCw : copy.Icon;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8] p-6 text-[#1d1713]">
      <div className="w-full max-w-md rounded-lg border border-[#ddcfc2] bg-[#fffaf1] p-6 text-center shadow-[0_18px_45px_rgb(59_39_24_/_0.12)]">
        <Icon
          className={`mx-auto size-10 text-[#e22b1f] ${
            status === "loading" ? "animate-spin" : ""
          }`}
        />
        <h1 className="mt-4 text-2xl font-black">{copy.title}</h1>
        <p className="mt-2 text-base font-semibold text-[#6d5a50]">
          {copy.message}
        </p>
        {copy.detail ? (
          <p className="mt-4 rounded-md bg-[#f2e7d8] px-4 py-3 text-sm font-bold text-[#5b4538]">
            {copy.detail}
          </p>
        ) : null}
      </div>
    </main>
  );
}

export function EmptyKitchen(): ReactElement {
  return (
    <div className="flex min-h-[64vh] items-center justify-center rounded-lg border-2 border-dashed border-[#d5c6b7] bg-[#fffaf1]">
      <div className="max-w-md px-6 text-center">
        <Utensils className="mx-auto size-12 text-[#e22b1f]" />
        <h2 className="mt-4 text-3xl font-black text-[#1d1713]">
          Sin pedidos en cola
        </h2>
        <p className="mt-2 text-base font-semibold text-[#6d5a50]">
          Cuando entre un pedido desde mobile, aparecera aca con timer,
          prioridad y accion de cocina.
        </p>
      </div>
    </div>
  );
}

interface ShellCopy {
  title: string;
  message: string;
  detail: string | null;
  Icon: ComponentType<{ className?: string }>;
}

function resolveShellCopy(
  status: KitchenShellProps["status"],
  error: Error | null,
): ShellCopy {
  if (status === "loading") {
    return {
      detail: null,
      Icon: AlertTriangle,
      message: "Sincronizando pedidos activos.",
      title: "Cargando cocina",
    };
  }

  if (
    error instanceof KitchenApiError &&
    error.code === "database_not_configured"
  ) {
    return {
      detail: "Agrega DATABASE_URL en .env.local y ejecuta pnpm db:migrate.",
      Icon: Database,
      message: "La web esta arriba, pero Neon todavia no esta configurado.",
      title: "DB no configurada",
    };
  }

  if (error instanceof KitchenApiError && error.status >= 500) {
    return {
      detail: "Revisa Neon, DATABASE_URL y /api/health.",
      Icon: Database,
      message: "No se pudo leer la cola desde la base de datos.",
      title: "DB no disponible",
    };
  }

  return {
    detail: "Recarga la pantalla o revisa la conexion de cocina.",
    Icon: AlertTriangle,
    message: "No se pudo sincronizar la cola de pedidos.",
    title: "Cocina sin conexion",
  };
}
