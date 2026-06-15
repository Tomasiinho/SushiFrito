import { StyleSheet } from "react-native";

import { colors, radius, spacing } from "@/styles/theme";

export const cartItemRowStyles = StyleSheet.create({
  actions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  body: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0
  },
  chip: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    color: colors.mutedDark,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  image: {
    height: "100%",
    width: "100%"
  },
  item: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md
  },
  name: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 20
  },
  price: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: "900"
  },
  quantity: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
    minWidth: 24,
    textAlign: "center"
  },
  remove: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "900"
  },
  stepper: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    flexDirection: "row"
  },
  stepperButton: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    width: 34
  },
  stepperLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  thumbnail: {
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    height: 88,
    overflow: "hidden",
    width: 86
  }
});
