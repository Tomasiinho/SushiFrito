import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { Image, Pressable, Text, View } from "react-native";

import { cartItemRowStyles as styles } from "@/components/cart-item-row.styles";
import { formatClp } from "@/contracts/shared";
import { colors } from "@/styles/theme";
import type { CartItem } from "@/types/cart";

export type CartItemRowProps = {
  item: CartItem;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
};

export function CartItemRow({
  item,
  onQuantityChange,
  onRemove
}: CartItemRowProps): ReactNode {
  return (
    <View style={styles.item}>
      <View style={styles.thumbnail}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            style={styles.image}
          />
        )}
      </View>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text numberOfLines={2} style={styles.name}>
            {item.name}
          </Text>
          <Text style={styles.price}>{formatClp(item.unitPrice * item.quantity)}</Text>
        </View>
        <View style={styles.chips}>
          {item.sauces.map((sauce) => (
            <Text key={sauce} style={styles.chip}>
              {sauce}
            </Text>
          ))}
          <Text style={styles.chip}>{item.chopsticks ? "palitos" : "sin palitos"}</Text>
          {item.notes ? <Text style={styles.chip}>{item.notes}</Text> : null}
        </View>
        <View style={styles.actions}>
          <View style={styles.stepper}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onQuantityChange(item.id, item.quantity - 1);
              }}
              style={styles.stepperButton}
            >
              <Text style={styles.stepperLabel}>-</Text>
            </Pressable>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onQuantityChange(item.id, item.quantity + 1);
              }}
              style={styles.stepperButton}
            >
              <Text style={styles.stepperLabel}>+</Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              onRemove(item.id);
            }}
          >
            <Text style={styles.remove}>Quitar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
