import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radius, spacing } from "@/styles/theme";

export type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  icon,
  variant = "primary"
}: PrimaryButtonProps): ReactNode {
  const isSecondary = variant === "secondary";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isSecondary ? styles.secondary : styles.primary,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null
      ]}
    >
      {icon}
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        numberOfLines={1}
        style={[styles.label, isSecondary ? styles.secondaryLabel : null]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing.lg
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }]
  },
  disabled: {
    opacity: 0.45
  },
  label: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center"
  },
  secondaryLabel: {
    color: colors.text
  }
});
