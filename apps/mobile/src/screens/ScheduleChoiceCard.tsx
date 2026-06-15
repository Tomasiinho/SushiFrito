import { Ionicons } from "@react-native-vector-icons/ionicons";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/styles/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type ScheduleChoiceCardProps = {
  active: boolean;
  icon: IconName;
  title: string;
  subtitle: string;
  meta?: string;
  onPress: () => void;
};

export function ScheduleChoiceCard({
  active,
  icon,
  meta,
  onPress,
  subtitle,
  title
}: ScheduleChoiceCardProps): ReactNode {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.card, active ? styles.cardActive : null]}
    >
      <View style={[styles.icon, active ? styles.iconActive : null]}>
        <Ionicons
          color={active ? colors.textInverse : colors.primaryDark}
          name={icon}
          size={20}
        />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, active ? styles.titleActive : null]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, active ? styles.subtitleActive : null]}>
          {subtitle}
        </Text>
      </View>
      {meta ? (
        <Text style={[styles.meta, active ? styles.metaActive : null]}>
          {meta}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md
  },
  cardActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0
  },
  icon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  iconActive: {
    backgroundColor: colors.primary
  },
  meta: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900"
  },
  metaActive: {
    color: colors.accent
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  subtitleActive: {
    color: colors.textInverse
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  titleActive: {
    color: colors.textInverse
  }
});
