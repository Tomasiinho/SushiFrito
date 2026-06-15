import { StyleSheet } from "react-native";

import { colors, spacing } from "@/styles/theme";

export const tabBarStyles = StyleSheet.create({
  active: {
    color: colors.primary
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: colors.surfaceElevated,
    borderRadius: 999,
    borderWidth: 2,
    minWidth: 18,
    paddingHorizontal: 4,
    position: "absolute",
    right: -8,
    top: -8
  },
  badgeLabel: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: "900"
  },
  container: {
    backgroundColor: colors.surfaceElevated,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  tab: {
    alignItems: "center",
    borderRadius: 999,
    flex: 1,
    gap: 2,
    justifyContent: "center",
    minHeight: 44,
    paddingVertical: spacing.xs
  },
  tabActive: {
    backgroundColor: colors.surfaceMuted
  }
});
