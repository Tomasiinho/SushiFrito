import { StyleSheet } from "react-native";

import { colors, radius, spacing } from "@/styles/theme";

export const productCardStyles = StyleSheet.create({
  addSlot: {
    marginTop: spacing.xs
  },
  body: {
    gap: spacing.sm,
    padding: spacing.md
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 14
  },
  chip: {
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    minHeight: 36,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  chipLabel: {
    color: colors.text,
    fontWeight: "800"
  },
  chipLabelSelected: {
    color: colors.textInverse
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  configureAction: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "900"
  },
  configureCopy: {
    flex: 1,
    gap: 2
  },
  configureHint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  configureRow: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    padding: spacing.md
  },
  configureTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  headingRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  image: {
    height: 136,
    width: "100%"
  },
  imageFrame: {
    backgroundColor: colors.ink
  },
  name: {
    color: colors.text,
    flex: 1,
    fontSize: 19,
    fontWeight: "900"
  },
  optionsPanel: {
    gap: spacing.md,
    paddingTop: spacing.xs
  },
  priceBadge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    bottom: spacing.sm,
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    position: "absolute",
    right: spacing.sm
  },
  sauceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  switchLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800"
  },
  switchRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  tag: {
    backgroundColor: colors.leafMuted,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  tagLabel: {
    color: colors.leaf,
    fontSize: 12,
    fontWeight: "900"
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  }
});
