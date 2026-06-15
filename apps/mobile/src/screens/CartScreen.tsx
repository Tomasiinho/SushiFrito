import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { CartFooter } from "@/components/CartFooter";
import { CartItemRow } from "@/components/CartItemRow";
import { EmptyState } from "@/components/EmptyState";
import { RefreshableScrollView } from "@/components/RefreshableScrollView";
import { Screen } from "@/components/Screen";
import { canStartCheckout } from "@/store/cart-rules";
import { useCartStore } from "@/store/cart-store";
import { colors, radius, spacing } from "@/styles/theme";

export type CartScreenProps = {
  onCheckout: () => void;
  onBrowseMenu: () => void;
};

export function CartScreen({
  onBrowseMenu,
  onCheckout
}: CartScreenProps): ReactNode {
  const { items, totals, updateQuantity, removeItem } = useCartStore();
  const disabled = !canStartCheckout(items);
  const itemCopy =
    totals.itemCount === 1 ? "1 producto" : `${String(totals.itemCount)} productos`;

  return (
    <Screen
      footer={
        <CartFooter
          disabled={disabled}
          onCheckout={onCheckout}
          totals={totals}
        />
      }
      subtitle="Revisa cantidades, salsas y palitos antes de programar."
      title="Carrito"
    >
      <RefreshableScrollView contentContainerStyle={styles.list}>
        {items.length === 0 ? (
          <EmptyState
            actionLabel="Ver menú"
            message="Agrega productos del catálogo para iniciar tu pedido."
            onAction={onBrowseMenu}
            title="Tu carrito está vacío"
          />
        ) : (
          <View style={styles.content}>
            <View style={styles.summary}>
              <View>
                <Text style={styles.summaryLabel}>Retiro</Text>
                <Text style={styles.summaryValue}>UPLA / Valparaíso</Text>
              </View>
              <View>
                <Text style={styles.summaryLabel}>Pedido</Text>
                <Text style={styles.summaryValue}>{itemCopy}</Text>
              </View>
              <View>
                <Text style={styles.summaryLabel}>Pago</Text>
                <Text style={styles.summaryValue}>Pendiente</Text>
              </View>
            </View>
            {items.map((item) => (
              <CartItemRow
                item={item}
                key={item.id}
                onQuantityChange={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </View>
        )}
      </RefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },
  content: {
    gap: spacing.md
  },
  summary: {
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    gap: spacing.md,
    padding: spacing.lg
  },
  summaryLabel: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  summaryValue: {
    color: colors.textInverse,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2
  }
});
