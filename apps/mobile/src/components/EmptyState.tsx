import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing } from "@/styles/theme";

export type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  actionLabel,
  message,
  onAction,
  title
}: EmptyStateProps): ReactNode {
  return (
    <View style={styles.container}>
      <View style={styles.mark}>
        <Text style={styles.markText}>SF</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <PrimaryButton label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    margin: spacing.lg,
    padding: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16
  },
  action: {
    marginTop: spacing.lg
  },
  mark: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    height: 42,
    justifyContent: "center",
    marginBottom: spacing.md,
    width: 42
  },
  markText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "900"
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  message: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    marginTop: spacing.sm
  }
});
