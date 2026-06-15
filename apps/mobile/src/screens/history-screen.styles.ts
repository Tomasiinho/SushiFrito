import { StyleSheet } from "react-native";

import { colors, radius, spacing } from "@/styles/theme";

export const historyScreenStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  date: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  infoRow: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoText: {
    color: colors.mutedDark,
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  list: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  notice: {
    color: colors.muted,
    fontSize: 14,
  },
  number: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  statusPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.leafMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusText: {
    color: colors.leaf,
    fontSize: 12,
    fontWeight: "900",
  },
  total: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: "900",
  },
});
