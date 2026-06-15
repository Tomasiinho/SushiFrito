import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import type { ReactNode } from "react";
import * as React from "react";
import { Text, View } from "react-native";

import { customerOrdersQuery } from "@/api/queries";
import { EmptyState } from "@/components/EmptyState";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RefreshableScrollView } from "@/components/RefreshableScrollView";
import { Screen } from "@/components/Screen";
import {
  historyDateLabel,
  historyItemsLabel,
  historyPickupLabel,
  historySaucesLabel,
  historyStatusLabel,
  historyTotalLabel,
} from "@/screens/history-format";
import { historyScreenStyles as styles } from "@/screens/history-screen.styles";
import { colors } from "@/styles/theme";
import type { OrderDto } from "@/types/shared";

export type HistoryScreenProps = {
  customerId: string;
  customerToken: string | null;
  onRepeatOrder: (order: OrderDto) => void;
  onStartOrder: () => void;
};

export function HistoryScreen({
  customerId,
  customerToken,
  onRepeatOrder,
  onStartOrder,
}: HistoryScreenProps): ReactNode {
  const {
    data: ordersData,
    isError,
    isPending,
    isRefetching,
    refetch,
  } = useQuery(customerOrdersQuery(customerId, customerToken));
  const ordersList = ordersData ?? [];
  const showEmpty =
    !isPending && !isError && ordersList.length === 0;
  const refreshOrders = React.useCallback(async (): Promise<void> => {
    await refetch();
  }, [refetch]);

  return (
    <Screen
      subtitle="Tus pedidos anteriores para repetir rápido."
      title="Historial"
    >
      <RefreshableScrollView
        contentContainerStyle={styles.list}
        onRefresh={refreshOrders}
        refreshing={isRefetching}
      >
        {isPending ? (
          <Text style={styles.notice}>Cargando...</Text>
        ) : null}
        {isError ? (
          <EmptyState
            actionLabel="Pedir ahora"
            message="Puedes seguir armando pedidos aunque el historial local no responda."
            onAction={onStartOrder}
            title="Historial no disponible"
          />
        ) : null}
        {showEmpty ? (
          <EmptyState
            actionLabel="Armar primer pedido"
            message="Tus pedidos cerrados aparecerán aquí."
            onAction={onStartOrder}
            title="Aún no hay historial"
          />
        ) : null}
        {ordersList.map((order) => (
          <View key={order.id} style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.number}>{order.orderNumber}</Text>
                <Text style={styles.date}>{historyDateLabel(order)}</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>
                  {historyStatusLabel(order.status)}
                </Text>
              </View>
            </View>
            <Text style={styles.total}>{historyTotalLabel(order)}</Text>
            <HistoryInfo
              icon="bag-handle-outline"
              label={historyItemsLabel(order)}
            />
            <HistoryInfo
              icon="location-outline"
              label={historyPickupLabel(order)}
            />
            <HistoryInfo
              icon="color-fill-outline"
              label={historySaucesLabel(order)}
            />
            <PrimaryButton
              label="Pedir de nuevo"
              onPress={() => {
                onRepeatOrder(order);
              }}
              variant="secondary"
            />
          </View>
        ))}
      </RefreshableScrollView>
    </Screen>
  );
}

type HistoryInfoProps = {
  icon: "bag-handle-outline" | "color-fill-outline" | "location-outline";
  label: string;
};

function HistoryInfo({ icon, label }: HistoryInfoProps): ReactNode {
  return (
    <View style={styles.infoRow}>
      <Ionicons color={colors.primaryDark} name={icon} size={17} />
      <Text style={styles.infoText}>{label}</Text>
    </View>
  );
}
