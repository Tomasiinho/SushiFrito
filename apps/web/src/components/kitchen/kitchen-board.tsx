"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

import { KitchenHeader } from "@/components/kitchen/kitchen-header";
import { EmptyKitchen, KitchenShell } from "@/components/kitchen/kitchen-state";
import { OrderCard } from "@/components/kitchen/order-card";
import {
  fetchKitchenOrders,
  fetchKitchenSummary,
  setKitchenPause,
  updateKitchenOrderStatus,
  type UpdateKitchenOrderStatusInput,
} from "@/lib/kitchen-api";
import type { OrderStatus } from "@/types/kitchen";

type RealtimeState = "connected" | "syncing" | "polling";
const connectedPollingMs = 30_000;
const fallbackPollingMs = 10_000;

export function KitchenBoard(): ReactElement {
  const queryClient = useQueryClient();
  const [realtimeState, setRealtimeState] = useState<RealtimeState>("syncing");

  const ordersQuery = useQuery({
    queryKey: ["kitchen", "orders"],
    queryFn: fetchKitchenOrders,
    refetchInterval:
      realtimeState === "connected" ? connectedPollingMs : fallbackPollingMs,
  });
  const summaryQuery = useQuery({
    queryKey: ["kitchen", "summary"],
    queryFn: fetchKitchenSummary,
    refetchInterval:
      realtimeState === "connected" ? connectedPollingMs : fallbackPollingMs,
  });

  const statusMutation = useMutation<
    unknown,
    Error,
    UpdateKitchenOrderStatusInput
  >({
    mutationFn: updateKitchenOrderStatus,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["kitchen"] });
    },
  });
  const pauseMutation = useMutation<unknown, Error, boolean>({
    mutationFn: setKitchenPause,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["kitchen"] });
    },
  });

  useEffect(() => {
    const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL;
    if (!realtimeUrl) {
      setRealtimeState("polling");
      return undefined;
    }

    const socket = io(realtimeUrl, { transports: ["websocket", "polling"] });
    const refreshKitchen = (): void => {
      void queryClient.invalidateQueries({ queryKey: ["kitchen"] });
    };

    socket.on("connect", () => {
      setRealtimeState("connected");
    });
    socket.on("disconnect", () => {
      setRealtimeState("syncing");
    });
    socket.on("order.created", refreshKitchen);
    socket.on("order.status_changed", refreshKitchen);
    socket.on("kitchen.summary_changed", refreshKitchen);

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);
  const connectionLabel =
    realtimeState === "connected"
      ? "Conectado"
      : realtimeState === "polling"
        ? "Polling"
        : "Sincronizando";
  const isSyncing = ordersQuery.isFetching || summaryQuery.isFetching;
  const updatingOrderId = statusMutation.isPending
    ? statusMutation.variables.orderId
    : null;

  if (ordersQuery.isLoading || summaryQuery.isLoading) {
    return <KitchenShell status="loading" />;
  }

  if (ordersQuery.isError || summaryQuery.isError) {
    return (
      <KitchenShell
        error={ordersQuery.error ?? summaryQuery.error}
        status="error"
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f1e8] text-[#1d1713]">
      <KitchenHeader
        connectionLabel={connectionLabel}
        isSyncing={isSyncing}
        onTogglePause={() => {
          pauseMutation.mutate(!(summaryQuery.data?.paused ?? false));
        }}
        pausePending={pauseMutation.isPending}
        summary={summaryQuery.data ?? null}
      />

      <section className="mx-auto max-w-[1800px] px-4 py-5">
        {orders.length === 0 ? (
          <EmptyKitchen />
        ) : (
          <div className="kds-grid">
            {orders.map((order) => (
              <OrderCard
                disabled={updatingOrderId === order.id}
                key={order.id}
                onStatusChange={(orderId: string, status: OrderStatus) => {
                  statusMutation.mutate({ orderId, status });
                }}
                order={order}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
