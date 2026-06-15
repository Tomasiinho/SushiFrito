import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/styles/theme";
import type { OrderStatus } from "@/types/shared";

const steps: readonly { status: OrderStatus; label: string }[] = [
  { status: "received", label: "Recibido" },
  { status: "preparing", label: "Preparando" },
  { status: "frying", label: "Friendo" },
  { status: "ready", label: "Retiro" },
  { status: "delivered", label: "Entregado" }
];

export type TrackingStepsProps = {
  status: OrderStatus;
};

export function TrackingSteps({ status }: TrackingStepsProps): ReactNode {
  const activeIndex = steps.findIndex((step) => step.status === status);
  const safeIndex = status === "cancelled" ? -1 : Math.max(activeIndex, 0);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {steps.map((step, index) => {
        const active = index <= safeIndex;
        return (
          <View key={step.status} style={styles.step}>
            <View style={[styles.dot, active ? styles.dotActive : null]} />
            <Text style={[styles.label, active ? styles.labelActive : null]}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingVertical: spacing.lg
  },
  step: {
    alignItems: "center",
    minWidth: 92
  },
  dot: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 18,
    width: 18
  },
  dotActive: {
    backgroundColor: colors.success,
    borderColor: colors.success
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.sm
  },
  labelActive: {
    color: colors.text
  }
});
