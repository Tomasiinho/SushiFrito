import type { ReactNode } from "react";
import { View } from "react-native";

import { ScheduleChoiceCard } from "@/screens/ScheduleChoiceCard";
import { scheduleStyles as styles } from "@/screens/schedule-screen.styles";
import { SectionHeader } from "@/screens/ScheduleText";

export type ScheduleModeSectionProps = {
  scheduleEnabled: boolean;
  onImmediate: () => void;
  onScheduled: () => void;
};

export function ScheduleModeSection({
  onImmediate,
  onScheduled,
  scheduleEnabled
}: ScheduleModeSectionProps): ReactNode {
  return (
    <View style={styles.section}>
      <SectionHeader
        helper="La cocina ordena la cola según este retiro."
        title="Cuándo lo retiras"
      />
      <ScheduleChoiceCard
        active={!scheduleEnabled}
        icon="flash-outline"
        meta="15-25 min"
        onPress={onImmediate}
        subtitle="Entra directo a cocina cuando confirmes."
        title="Lo antes posible"
      />
      <ScheduleChoiceCard
        active={scheduleEnabled}
        icon="calendar-outline"
        meta="15 min antes"
        onPress={onScheduled}
        subtitle="Reservamos el bloque y aparece en cocina antes del retiro."
        title="Programar"
      />
    </View>
  );
}
