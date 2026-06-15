import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useCallback, useEffect } from "react";
import { ImageBackground, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { orderQuery } from "@/api/queries";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RefreshableScrollView } from "@/components/RefreshableScrollView";
import { formatClp } from "@/contracts/shared";
import { fallbackCatalog } from "@/data/fallback-catalog";
import { homeStyles as styles } from "@/screens/home-screen.styles";
import { spacing } from "@/styles/theme";
import type { OrderDto } from "@/types/shared";

export type HomeScreenProps = {
  itemCount: number;
  subtotal: number;
  activeOrder: OrderDto | null;
  onStartOrder: () => void;
  onContinueCart: () => void;
  onTrackOrder: () => void;
  onOrderChanged?: (order: OrderDto) => void;
};

const heroProduct = fallbackCatalog.find((product) =>
  product.tags?.some((tag) => tag.toLowerCase().includes("pedido"))
);

const heroImageUrl =
  heroProduct?.imageUrl ??
  "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=80";

export function HomeScreen({
  activeOrder,
  itemCount,
  onContinueCart,
  onOrderChanged,
  onStartOrder,
  onTrackOrder,
  subtotal
}: HomeScreenProps): ReactNode {
  const insets = useSafeAreaInsets();
  const activeOrderId = activeOrder?.id ?? "";
  const activeOrderToken = activeOrder?.trackingToken ?? "";
  const {
    data: remoteActiveOrder,
    isRefetching,
    refetch,
  } = useQuery(orderQuery(activeOrderId, activeOrderToken));
  const displayOrder = remoteActiveOrder ?? activeOrder;
  const hasCart = itemCount > 0;
  const activeStatus = displayOrder ? displayOrder.status : "Sin pedido";
  const itemCopy = itemCount === 1 ? "1 producto" : `${String(itemCount)} productos`;
  const refreshHome = useCallback(async (): Promise<void> => {
    if (activeOrderId.length > 0 && activeOrderToken.length > 0) {
      await refetch();
    }
  }, [activeOrderId, activeOrderToken, refetch]);

  useEffect(() => {
    if (remoteActiveOrder) {
      onOrderChanged?.(remoteActiveOrder);
    }
  }, [onOrderChanged, remoteActiveOrder]);

  return (
    <RefreshableScrollView
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: Math.max(insets.bottom + spacing.md, spacing.xl),
          paddingTop: Math.max(insets.top + spacing.md, spacing.xl)
        }
      ]}
      onRefresh={refreshHome}
      refreshing={isRefetching}
      style={styles.container}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>SushiFrito</Text>
          <Text style={styles.location}>Valparaíso / UPLA</Text>
        </View>
        <View style={styles.openBadge}>
          <Text style={styles.openBadgeText}>Retiro hoy</Text>
        </View>
      </View>

      <ImageBackground
        imageStyle={styles.heroImage}
        source={{ uri: heroImageUrl }}
        style={styles.hero}
      >
        <LinearGradient
          colors={["rgba(23,17,15,0.06)", "rgba(23,17,15,0.82)"]}
          style={styles.heroShade}
        >
          <View style={styles.heroCopy}>
            <View style={styles.heroBadgeRow}>
              <Text style={styles.heroKicker}>Más pedido hoy</Text>
              {heroProduct ? (
                <Text style={styles.heroPrice}>{formatClp(heroProduct.price)}</Text>
              ) : null}
            </View>
            <Text style={styles.heroTitle}>
              {heroProduct?.name ?? "Sushi frito para tu pausa"}
            </Text>
            <Text style={styles.heroText}>
              Programa retiro, elige salsas y sigue cocina en vivo.
            </Text>
          </View>
          <View style={styles.promiseRow}>
            <Text style={styles.promise}>15-25 min</Text>
            <Text style={styles.promise}>Salsas al gusto</Text>
            <Text style={styles.promise}>Retiro UPLA</Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.actions}>
        <PrimaryButton label="Pedir ahora" onPress={onStartOrder} />
        {hasCart ? (
          <PrimaryButton
            label={`Continuar carrito · ${formatClp(subtotal)}`}
            onPress={onContinueCart}
            variant="secondary"
          />
        ) : null}
        {displayOrder ? (
          <PrimaryButton
            label={`Seguir ${displayOrder.orderNumber}`}
            onPress={onTrackOrder}
            variant="secondary"
          />
        ) : null}
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Carrito</Text>
          <Text style={styles.summaryValue}>
            {hasCart ? itemCopy : "Listo para partir"}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Pedido activo</Text>
          <Text style={styles.summaryValue}>{activeStatus}</Text>
        </View>
      </View>
    </RefreshableScrollView>
  );
}
