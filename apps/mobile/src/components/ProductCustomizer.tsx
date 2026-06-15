import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { CustomizationOptionCard } from "@/components/CustomizationOptionCard";
import {
  packingOptions,
  sauceOptions,
  type PackingMode
} from "@/components/product-customization-options";
import { productCustomizerStyles as styles } from "@/components/product-customizer.styles";

export type ProductCustomizerProps = {
  maxSauces: number;
  packingMode: PackingMode;
  quantity: number;
  selectedSauces: string[];
  onPackingModeChange: (mode: PackingMode) => void;
  onQuantityChange: (quantity: number) => void;
  onToggleSauce: (sauce: string) => void;
};

export function ProductCustomizer({
  maxSauces,
  onPackingModeChange,
  onQuantityChange,
  onToggleSauce,
  packingMode,
  quantity,
  selectedSauces
}: ProductCustomizerProps): ReactNode {
  const sauceCount = selectedSauces.length;

  return (
    <View style={styles.wrapper}>
      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Salsas</Text>
          <Text style={styles.counter}>
            {String(sauceCount)}/{String(maxSauces)}
          </Text>
        </View>
        <Text style={styles.helper}>
          Combina sabores sin tapar el crunch del roll.
        </Text>
        <View style={styles.optionGrid}>
          {sauceOptions.map((sauce) => {
            const selected = selectedSauces.includes(sauce.id);
            const disabled = !selected && sauceCount >= maxSauces;

            return (
              <CustomizationOptionCard
                description={sauce.description}
                disabled={disabled}
                key={sauce.id}
                onPress={() => {
                  onToggleSauce(sauce.id);
                }}
                profile={sauce.profile}
                selected={selected}
                title={sauce.label}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Palitos y empaque</Text>
        <View style={styles.optionGrid}>
          {packingOptions.map((option) => {
            const selected = option.id === packingMode;

            return (
              <CustomizationOptionCard
                description={option.description}
                key={option.id}
                onPress={() => {
                  onPackingModeChange(option.id);
                }}
                selected={selected}
                title={option.label}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.quantityRow}>
        <View>
          <Text style={styles.sectionTitle}>Cantidad</Text>
          <Text style={styles.helper}>Ideal para oficina o bloque de clases.</Text>
        </View>
        <View style={styles.quantityStepper}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              onQuantityChange(Math.max(1, quantity - 1));
            }}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </Pressable>
          <Text style={styles.quantityLabel}>{quantity}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              onQuantityChange(quantity + 1);
            }}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
