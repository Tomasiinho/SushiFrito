import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing } from "@/styles/theme";

export function LoadingScreen(): ReactNode {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, spacing.xl),
          paddingTop: Math.max(insets.top, spacing.xl)
        }
      ]}
    >
      <View style={styles.brandBlock}>
        <Text style={styles.brand}>SushiFrito</Text>
        <Text style={styles.tagline}>Preparando tu pedido rápido en Valpo.</Text>
      </View>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.status}>Cargando cocina, catálogo y carrito...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center"
  },
  brandBlock: {
    gap: spacing.sm
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.xl,
    justifyContent: "center",
    paddingHorizontal: spacing.xl
  },
  status: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center"
  },
  tagline: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center"
  }
});
