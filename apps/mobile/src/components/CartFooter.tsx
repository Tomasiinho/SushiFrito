import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { formatClp } from "@/contracts/shared";
import { colors, spacing } from "@/styles/theme";
import type { CartTotals } from "@/types/cart";

export type CartFooterProps = {
  totals: CartTotals;
  disabled: boolean;
  onCheckout: () => void;
};

export function CartFooter({
  totals,
  disabled,
  onCheckout
}: CartFooterProps): ReactNode {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.label}>Total</Text>
        <Text style={styles.total}>{formatClp(totals.subtotal)}</Text>
      </View>
      <View style={styles.buttonSlot}>
        <PrimaryButton
          disabled={disabled}
          label="Programar / pagar"
          onPress={onCheckout}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    padding: spacing.lg
  },
  buttonSlot: {
    alignSelf: "stretch",
    flex: 1,
    justifyContent: "center",
    minWidth: 0
  },
  label: {
    color: colors.muted,
    fontSize: 13
  },
  total: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900"
  }
});
