import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { scheduleStyles as styles } from "@/screens/schedule-screen.styles";

export function SectionHeader({
  helper,
  title
}: {
  helper: string;
  title: string;
}): ReactNode {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.helper}>{helper}</Text>
    </View>
  );
}

export function SummaryItem({
  label,
  value
}: {
  label: string;
  value: string;
}): ReactNode {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}
