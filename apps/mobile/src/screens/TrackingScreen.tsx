import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";

import { orderQuery } from "@/api/queries";
import { EmptyState } from "@/components/EmptyState";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RefreshableScrollView } from "@/components/RefreshableScrollView";
import { Screen } from "@/components/Screen";
import { TrackingSteps } from "@/components/TrackingSteps";
import { READY_NOTIFICATION_BODY } from "@/notifications/push";
import { connectOrderTrackingSocket } from "@/realtime/tracking-socket";
import { trackingStyles as styles } from "@/screens/tracking-screen.styles";
import { trackingStatusCopy } from "@/screens/tracking-status-copy";
import type { PickupQrParams } from "@/types/navigation";
import type { OrderDto } from "@/types/shared";

export type TrackingScreenProps = {
  activeOrder: OrderDto | null;
  onOrderChanged?: (order: OrderDto) => void;
  onPickupQr: (params: PickupQrParams) => void;
  onStartOrder: () => void;
};

export function TrackingScreen({
  activeOrder,
  onOrderChanged,
  onPickupQr,
  onStartOrder
}: TrackingScreenProps): ReactNode {
  const [liveOrder, setLiveOrder] = useState<OrderDto | null>(activeOrder);
  const orderId = liveOrder?.id ?? "";
  const trackingToken = liveOrder?.trackingToken ?? "";
  const {
    data: remoteOrder,
    isRefetching,
    refetch,
  } = useQuery(orderQuery(orderId, trackingToken));
  const refreshOrder = useCallback(async (): Promise<void> => {
    if (orderId.length > 0 && trackingToken.length > 0) {
      await refetch();
    }
  }, [orderId, refetch, trackingToken]);

  useEffect(() => {
    setLiveOrder(activeOrder);
  }, [activeOrder]);

  useEffect(() => {
    if (remoteOrder) {
      setLiveOrder(remoteOrder);
      onOrderChanged?.(remoteOrder);
    }
  }, [onOrderChanged, remoteOrder]);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    const socket = connectOrderTrackingSocket({
      onOrderSignal: () => {
        void refetch();
      },
      orderId,
      onOrderUpdate: (order) => {
        setLiveOrder(order);
        onOrderChanged?.(order);
      }
    });

    return () => {
      socket?.disconnect();
    };
  }, [onOrderChanged, orderId, refetch]);

  if (!liveOrder) {
    return (
      <Screen title="Seguimiento">
        <RefreshableScrollView contentContainerStyle={styles.content}>
          <EmptyState
            actionLabel="Pedir ahora"
            message="Cuando confirmes un pedido podrás seguirlo en tiempo real."
            onAction={onStartOrder}
            title="Sin pedido activo"
          />
        </RefreshableScrollView>
      </Screen>
    );
  }

  const copy = trackingStatusCopy[liveOrder.status];
  const canShowQr =
    liveOrder.status === "ready" || liveOrder.status === "delivered";

  return (
    <Screen subtitle={`Pedido ${liveOrder.orderNumber}`} title="Seguimiento">
      <RefreshableScrollView
        contentContainerStyle={styles.content}
        onRefresh={refreshOrder}
        refreshing={isRefetching}
      >
        <View style={styles.card}>
          <View style={styles.statusHero}>
            <Text style={styles.eyebrow}>Pedido {liveOrder.orderNumber}</Text>
            <Text style={styles.eta}>{copy.eta}</Text>
            <Text style={styles.status}>{copy.title}</Text>
            <Text style={styles.helper}>{copy.caption}</Text>
          </View>
          <TrackingSteps status={liveOrder.status} />
          {canShowQr ? (
            <View style={styles.qrFocus}>
              <Text style={styles.ready}>{READY_NOTIFICATION_BODY}</Text>
            </View>
          ) : (
            <Text style={styles.helper}>
              Te avisaremos cuando esté listo para retiro.
            </Text>
          )}
          <PrimaryButton
            disabled={!canShowQr}
            label="Mostrar QR de retiro"
            onPress={() => {
              onPickupQr({
                orderId: liveOrder.id,
                ...(liveOrder.pickupCode
                  ? { pickupCode: liveOrder.pickupCode }
                  : {})
              });
            }}
          />
        </View>
      </RefreshableScrollView>
    </Screen>
  );
}
