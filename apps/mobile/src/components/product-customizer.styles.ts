import { StyleSheet } from "react-native";

import { colors, radius, spacing } from "@/styles/theme";

export const productCustomizerStyles = StyleSheet.create({
  counter: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "900"
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  helper: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md
  },
  optionCardDisabled: {
    opacity: 0.45
  },
  optionCardSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  optionDescription: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  },
  optionDescriptionSelected: {
    color: colors.textInverse
  },
  optionGrid: {
    gap: spacing.sm
  },
  optionLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  optionLabelSelected: {
    color: colors.textInverse
  },
  profile: {
    color: colors.accentDark,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  profileSelected: {
    color: colors.accent
  },
  quantityButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    height: 38,
    justifyContent: "center",
    width: 42
  },
  quantityButtonText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900"
  },
  quantityLabel: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    minWidth: 36,
    textAlign: "center"
  },
  quantityRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  quantityStepper: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  section: {
    gap: spacing.sm
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  wrapper: {
    gap: spacing.lg,
    paddingTop: spacing.xs
  }
});
