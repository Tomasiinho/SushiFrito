"use client";

import Link from "next/link";
import type { PickupZoneDto, ProductDto } from "@sushifrito/shared";
import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";

import { PickupBlockEditor } from "@/components/admin/pickup-block-editor";
import { PickupZoneEditor } from "@/components/admin/pickup-zone-editor";
import { ProductEditor } from "@/components/admin/product-editor";
import { fetchAdminState } from "@/lib/admin-api";

type AdminLoadState =
  | { status: "loading" }
  | { status: "ready"; products: ProductDto[]; zones: PickupZoneDto[] }
  | { status: "error"; message: string };

export function AdminPanel(): ReactElement {
  const [state, setState] = useState<AdminLoadState>({ status: "loading" });

  const load = useCallback(async (): Promise<void> => {
    try {
      const nextState = await fetchAdminState();
      setState({ status: "ready", ...nextState });
    } catch {
      setState({
        message: "No se pudo cargar administracion.",
        status: "error",
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="min-h-screen bg-[#f5f1e8] px-4 py-6 text-[#1d1713]">
      <header className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#b1261f] uppercase">
            Configuracion operativa
          </p>
          <h1 className="mt-1 text-3xl font-black">Panel SushiFrito</h1>
        </div>
        <div className="flex gap-2">
          <Link
            className="rounded-md border border-[#d9271e] px-4 py-2 text-sm font-black text-[#d9271e]"
            href="/kitchen"
          >
            Cocina
          </Link>
        </div>
      </header>

      <section className="mx-auto mt-6 max-w-[1400px]">
        {state.status === "loading" ? (
          <div className="rounded-lg border border-[#ead8c8] bg-white p-8 font-black">
            Cargando configuracion...
          </div>
        ) : null}

        {state.status === "error" ? (
          <div className="rounded-lg border border-[#ead8c8] bg-white p-8 font-black text-[#b1261f]">
            {state.message}
          </div>
        ) : null}

        {state.status === "ready" ? (
          <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
            <ProductEditor onSaved={load} products={state.products} />
            <div className="grid gap-5">
              <PickupZoneEditor onSaved={load} zones={state.zones} />
              <PickupBlockEditor onSaved={load} zones={state.zones} />
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
