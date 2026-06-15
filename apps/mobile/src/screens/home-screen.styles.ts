import { StyleSheet } from "react-native";

import { colors, radius, spacing } from "@/styles/theme";

export const homeStyles = StyleSheet.create({
  actions: {
    gap: spacing.md
  },
  brand: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900"
  },
  container: {
    backgroundColor: colors.background,
    flex: 1
  },
  content: {
    gap: spacing.xl,
    paddingHorizontal: spacing.lg
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  hero: {
    borderRadius: radius.lg,
    minHeight: 334,
    overflow: "hidden"
  },
  heroBadgeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  heroImage: {
    borderRadius: radius.lg
  },
  heroShade: {
    flex: 1,
    gap: spacing.lg,
    justifyContent: "space-between",
    padding: spacing.lg
  },
  heroCopy: {
    gap: spacing.sm,
    justifyContent: "flex-end",
    marginTop: "auto"
  },
  heroKicker: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "900"
  },
  heroPrice: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  heroText: {
    color: colors.textInverse,
    fontSize: 16,
    lineHeight: 22
  },
  heroTitle: {
    color: colors.textInverse,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 37
  },
  location: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: "800"
  },
  openBadge: {
    backgroundColor: colors.leafMuted,
    borderColor: colors.leaf,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  openBadgeText: {
    color: colors.leaf,
    fontSize: 12,
    fontWeight: "900"
  },
  promise: {
    backgroundColor: "rgba(255,250,242,0.16)",
    borderColor: "rgba(255,250,242,0.32)",
    borderRadius: 999,
    borderWidth: 1,
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  promiseRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  summary: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    shadowColor: colors.shadow,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 18
  },
  summaryItem: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  summaryValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  }
});
