import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radius, spacing } from "@/styles/theme";

export type CartNoticeProps = {
  message: string;
  onOpenCart: () => void;
};

export function CartNotice({
  message,
  onOpenCart
}: CartNoticeProps): ReactNode {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { bottom: Math.max(insets.bottom + 72, 96) }
      ]}
    >
      <View style={styles.notice}>
        <Text numberOfLines={1} style={styles.message}>
          {message}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onOpenCart}
          style={styles.action}
        >
          <Text style={styles.actionLabel}>Ver carrito</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  actionLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900"
  },
  message: {
    color: colors.surface,
    flex: 1,
    fontSize: 13,
    fontWeight: "800"
  },
  notice: {
    alignItems: "center",
    backgroundColor: colors.text,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md
  },
  wrap: {
    left: spacing.lg,
    position: "absolute",
    right: spacing.lg
  }
});
