import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { scheduleStyles as styles } from "@/screens/schedule-screen.styles";
import { SummaryItem } from "@/screens/ScheduleText";

export type ScheduleSummaryProps = {
  itemCopy: string;
  scheduleEnabled: boolean;
  total: string;
  windowLabel: string;
};

export function ScheduleSummary({
  itemCopy,
  scheduleEnabled,
  total,
  windowLabel
}: ScheduleSummaryProps): ReactNode {
  return (
    <View style={styles.summary}>
      <Text style={styles.summaryTitle}>
        {scheduleEnabled ? "Retiro programado" : "Lo antes posible"}
      </Text>
      <View style={styles.summaryGrid}>
        <SummaryItem label="Pedido" value={itemCopy} />
        <SummaryItem label="Total" value={total} />
        <SummaryItem label="Ventana" value={windowLabel} />
      </View>
    </View>
  );
}
