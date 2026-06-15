"use client";

import type { ReactElement } from "react";

interface KitchenErrorProps {
  error: Error;
  reset: () => void;
}

export default function KitchenError({
  reset
}: KitchenErrorProps): ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-950">
          Cocina sin conexion
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          No se pudo cargar la cola de pedidos.
        </p>
        <button
          className="mt-5 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          onClick={reset}
          type="button"
        >
          Reintentar
        </button>
      </section>
    </main>
  );
}
