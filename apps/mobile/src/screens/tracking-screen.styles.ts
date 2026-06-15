import { StyleSheet } from "react-native";

import { colors, radius, spacing } from "@/styles/theme";

export const trackingStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  content: {
    padding: spacing.lg
  },
  eta: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    marginTop: spacing.xs
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  helper: {
    color: colors.muted,
    lineHeight: 21
  },
  qrFocus: {
    backgroundColor: colors.leafMuted,
    borderRadius: radius.md,
    padding: spacing.md
  },
  ready: {
    color: colors.success,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 22
  },
  status: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: spacing.xs
  },
  statusHero: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.lg
  }
});
