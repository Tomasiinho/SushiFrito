import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ScheduleChoiceCard } from "@/screens/ScheduleChoiceCard";
import type { ScheduleBlockOption } from "@/screens/schedule-block-options";
import type { ScheduleDateOption } from "@/screens/schedule-date-options";
import { scheduleStyles as styles } from "@/screens/schedule-screen.styles";

export type ScheduleBlocksProps = {
  blocks: ScheduleBlockOption[];
  onBlockChange: (blockId: string) => void;
  onDateChange: (date: string) => void;
  scheduleDates: ScheduleDateOption[];
  selectedBlockId: string | undefined;
  selectedDate: string | undefined;
};

export function ScheduleBlocks({
  blocks,
  onBlockChange,
  onDateChange,
  scheduleDates,
  selectedBlockId,
  selectedDate,
}: ScheduleBlocksProps): ReactNode {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bloque de retiro</Text>
        <Text style={styles.helper}>
          Elige el momento en que realmente puedes pasar.
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.dateRail}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {scheduleDates.map((date) => {
          const active = selectedDate === date.value;

          return (
            <Pressable
              accessibilityRole="button"
              key={date.value}
              onPress={() => {
                onDateChange(date.value);
              }}
              style={[styles.dateTab, active ? styles.dateTabActive : null]}
            >
              <Text
                style={[styles.dateText, active ? styles.dateTextActive : null]}
              >
                {date.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.blockStack}>
        {blocks.length === 0 ? (
          <Text style={styles.helper}>
            No hay horarios activos para programar retiro.
          </Text>
        ) : null}
        {blocks.map((block) => (
          <ScheduleChoiceCard
            active={selectedBlockId === block.id}
            icon="time-outline"
            key={block.id}
            meta={`${block.start}-${block.end}`}
            onPress={() => {
              onBlockChange(block.id);
            }}
            subtitle={block.subtitle}
            title={block.label}
          />
        ))}
      </View>
      <Text style={styles.helper}>
        Los pedidos programados aparecen en cocina 15 minutos antes.
      </Text>
    </View>
  );
}
