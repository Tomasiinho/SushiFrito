import { StyleSheet } from "react-native";

import { colors, radius, spacing } from "@/styles/theme";

export const catalogStyles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  chipLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "900"
  },
  chipLabelActive: {
    color: colors.textInverse
  },
  chipRail: {
    gap: spacing.sm,
    paddingBottom: spacing.md
  },
  feature: {
    height: 148,
    justifyContent: "flex-end",
    marginBottom: spacing.lg,
    overflow: "hidden"
  },
  featureBody: {
    flex: 1,
    justifyContent: "space-between",
    padding: spacing.md
  },
  featureButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  featureButtonText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  featureImage: {
    borderRadius: radius.md
  },
  featureKicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  featureName: {
    color: colors.textInverse,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2
  },
  featurePrice: {
    color: colors.textInverse,
    fontSize: 15,
    fontWeight: "900",
    marginTop: spacing.xs
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },
  notice: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    color: colors.mutedDark,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: spacing.md,
    padding: spacing.md
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: spacing.md
  }
});
