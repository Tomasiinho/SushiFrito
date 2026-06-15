import type { ReactNode } from "react";
import { Pressable, Text } from "react-native";

import { productCustomizerStyles as styles } from "@/components/product-customizer.styles";

export type CustomizationOptionCardProps = {
  description: string;
  disabled?: boolean;
  profile?: string;
  selected: boolean;
  title: string;
  onPress: () => void;
};

export function CustomizationOptionCard({
  description,
  disabled = false,
  onPress,
  profile,
  selected,
  title
}: CustomizationOptionCardProps): ReactNode {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.optionCard,
        selected ? styles.optionCardSelected : null,
        disabled ? styles.optionCardDisabled : null
      ]}
    >
      {profile ? (
        <Text style={[styles.profile, selected ? styles.profileSelected : null]}>
          {profile}
        </Text>
      ) : null}
      <Text style={[styles.optionLabel, selected ? styles.optionLabelSelected : null]}>
        {title}
      </Text>
      <Text
        style={[
          styles.optionDescription,
          selected ? styles.optionDescriptionSelected : null
        ]}
      >
        {description}
      </Text>
    </Pressable>
  );
}
