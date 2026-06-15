import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import type { ReactNode } from "react";
import { Image, Pressable, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ProductCustomizer } from "@/components/ProductCustomizer";
import {
  packingOptionById,
  type PackingMode,
} from "@/components/product-customization-options";
import { productCardStyles as styles } from "@/components/product-card.styles";
import { formatClp } from "@/contracts/shared";
import { colors } from "@/styles/theme";
import type { CartProductOptions } from "@/types/cart";
import type { ProductDto } from "@/types/shared";

export type ProductCardProps = {
  product: ProductDto;
  onAdd: (product: ProductDto, options: CartProductOptions) => void;
};

const categoryLabels: Record<string, string> = {
  boxes: "Combo",
  handroll: "Handroll",
  handrolls: "Handroll",
  promo: "Combo",
  roll: "Roll frito",
  rolls: "Roll",
  sides: "Extra",
  veggie: "Veggie",
};

const productTags = (product: ProductDto): string[] => {
  const category = categoryLabels[product.category] ?? product.category;
  return Array.from(new Set([category, ...(product.tags ?? [])])).slice(0, 3);
};

export function ProductCard({ product, onAdd }: ProductCardProps): ReactNode {
  const [selectedSauces, setSelectedSauces] = React.useState<string[]>([
    "soya",
  ]);
  const [packingMode, setPackingMode] = React.useState<PackingMode>(
    product.includesChopsticks === false ? "no-chopsticks" : "standard",
  );
  const [quantity, setQuantity] = React.useState(1);
  const [isCustomizing, setIsCustomizing] = React.useState(false);
  const maxSauces = product.maxSauces ?? 2;
  const packingOption = packingOptionById(packingMode);
  const selectedSauceCopy =
    selectedSauces.length > 0 ? selectedSauces.join(" + ") : "sin salsa";
  const addLabel =
    quantity > 1 ? `Agregar ${String(quantity)}` : "Agregar rápido";

  const toggleSauce = (sauce: string): void => {
    setSelectedSauces((current) => {
      if (current.includes(sauce)) {
        return current.filter((item) => item !== sauce);
      }

      if (current.length >= maxSauces) {
        return current;
      }

      return [...current, sauce];
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageFrame}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} />
        ) : (
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            style={styles.image}
          />
        )}
        <Text style={styles.priceBadge}>{formatClp(product.price)}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.headingRow}>
          <Text style={styles.name}>{product.name}</Text>
        </View>
        <Text style={styles.description}>{product.description}</Text>
        <View style={styles.tagRow}>
          {productTags(product).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagLabel}>{tag}</Text>
            </View>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setIsCustomizing((current) => !current);
          }}
          style={styles.configureRow}
        >
          <View style={styles.configureCopy}>
            <Text style={styles.configureTitle}>
              Elige hasta {String(maxSauces)} salsas
            </Text>
            <Text style={styles.configureHint}>
              {selectedSauceCopy} · {packingOption.label.toLowerCase()}
            </Text>
          </View>
          <Text style={styles.configureAction}>
            {isCustomizing ? "Cerrar" : "Personalizar"}
          </Text>
        </Pressable>
        {isCustomizing ? (
          <ProductCustomizer
            maxSauces={maxSauces}
            onPackingModeChange={setPackingMode}
            onQuantityChange={setQuantity}
            onToggleSauce={toggleSauce}
            packingMode={packingMode}
            quantity={quantity}
            selectedSauces={selectedSauces}
          />
        ) : null}
        <View style={styles.addSlot}>
          <PrimaryButton
            disabled={!product.isAvailable}
            label={product.isAvailable ? addLabel : "Agotado"}
            onPress={() => {
              onAdd(product, {
                chopsticks: packingOption.chopsticks,
                quantity,
                sauces: selectedSauces,
                ...(packingOption.notes ? { notes: packingOption.notes } : {}),
              });
            }}
          />
        </View>
      </View>
    </View>
  );
}
