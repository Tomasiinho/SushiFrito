import { StyleSheet } from "react-native";

import { colors, radius, spacing } from "@/styles/theme";

export const scheduleStyles = StyleSheet.create({
  blockStack: {
    gap: spacing.sm
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },
  dateRail: {
    gap: spacing.sm,
    paddingBottom: spacing.xs
  },
  dateTab: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    minWidth: 92,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  dateTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  dateText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center"
  },
  dateTextActive: {
    color: colors.textInverse
  },
  error: {
    color: colors.danger,
    fontWeight: "800"
  },
  helper: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  section: {
    gap: spacing.md
  },
  sectionHeader: {
    gap: spacing.xs
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  summary: {
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    gap: spacing.lg,
    padding: spacing.lg
  },
  summaryGrid: {
    flexDirection: "row",
    gap: spacing.md
  },
  summaryItem: {
    flex: 1,
    gap: spacing.xs
  },
  summaryLabel: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  summaryTitle: {
    color: colors.textInverse,
    fontSize: 21,
    fontWeight: "900"
  },
  summaryValue: {
    color: colors.textInverse,
    fontSize: 15,
    fontWeight: "900"
  }
});
