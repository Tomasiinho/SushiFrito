import type { ReactNode } from "react";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { colors, radius, spacing } from "@/styles/theme";
import type { PickupQrParams } from "@/types/navigation";
import { createPickupQrMatrix } from "@/utils/pickup-qr";

export type PickupQrScreenProps = {
  params: PickupQrParams;
};

export function PickupQrScreen({ params }: PickupQrScreenProps): ReactNode {
  const qr = useMemo(
    () => createPickupQrMatrix(params),
    [params.orderId, params.pickupCode],
  );
  const rows = Array.from({ length: qr.size }, (_, rowIndex) => rowIndex);

  return (
    <Screen
      subtitle="Muestra este código al retirar en el punto elegido."
      title="QR retiro"
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.kicker}>Código de retiro</Text>
          <Text style={styles.pickupCode}>
            {params.pickupCode ?? "SUSHIFRITO"}
          </Text>
          <Text style={styles.helper}>
            El QR contiene solo el ID del pedido y el código de retiro.
          </Text>
        </View>

        <View style={styles.qrBox}>
          <View style={styles.qrCanvas}>
            <View style={styles.qrGrid}>
              {rows.map((rowIndex) => (
                <View key={`row-${String(rowIndex)}`} style={styles.qrRow}>
                  {rows.map((columnIndex) => {
                    const cellIndex = rowIndex * qr.size + columnIndex;
                    const isDark = qr.cells[cellIndex] ?? false;

                    return (
                      <View
                        key={`${String(rowIndex)}-${String(columnIndex)}`}
                        style={[
                          styles.qrCell,
                          isDark ? styles.qrCellDark : null,
                        ]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
          <Text style={styles.order}>{params.orderId ?? "Pedido activo"}</Text>
        </View>
        <Text style={styles.link}>{qr.payload}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "stretch",
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  headerCard: {
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  pickupCode: {
    color: colors.textInverse,
    fontSize: 30,
    fontWeight: "900",
  },
  helper: {
    color: colors.textInverse,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.82,
  },
  qrBox: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderColor: colors.text,
    borderRadius: radius.md,
    borderWidth: 2,
    justifyContent: "center",
    maxWidth: 320,
    padding: spacing.lg,
    width: "100%",
  },
  qrCanvas: {
    aspectRatio: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    width: "100%",
  },
  qrGrid: {
    flex: 1,
  },
  qrRow: {
    flex: 1,
    flexDirection: "row",
  },
  qrCell: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  qrCellDark: {
    backgroundColor: colors.ink,
  },
  order: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.md,
    textAlign: "center",
  },
  link: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});
