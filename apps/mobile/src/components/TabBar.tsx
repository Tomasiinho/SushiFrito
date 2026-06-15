import { Ionicons } from "@react-native-vector-icons/ionicons";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { tabBarStyles as styles } from "@/components/tab-bar.styles";
import { colors, spacing } from "@/styles/theme";
import type { TabRouteName } from "@/types/navigation";

type TabIconName =
  | "bag-handle"
  | "bag-handle-outline"
  | "receipt"
  | "receipt-outline"
  | "restaurant"
  | "restaurant-outline"
  | "time"
  | "time-outline";

const tabs: readonly {
  icon: { active: TabIconName; idle: TabIconName };
  label: string;
  route: TabRouteName;
}[] = [
  {
    icon: { active: "restaurant", idle: "restaurant-outline" },
    route: "catalog",
    label: "Menú"
  },
  {
    icon: { active: "bag-handle", idle: "bag-handle-outline" },
    route: "cart",
    label: "Carrito"
  },
  {
    icon: { active: "time", idle: "time-outline" },
    route: "tracking",
    label: "Estado"
  },
  {
    icon: { active: "receipt", idle: "receipt-outline" },
    route: "history",
    label: "Historial"
  }
];

export type TabBarProps = {
  activeRoute: TabRouteName;
  onChange: (route: TabRouteName) => void;
  cartItemCount?: number;
};

export function TabBar({
  activeRoute,
  cartItemCount = 0,
  onChange
}: TabBarProps): ReactNode {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, spacing.md);
  const cartBadge = Math.min(cartItemCount, 99);

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      {tabs.map((tab) => {
        const active = tab.route === activeRoute;
        return (
          <Pressable
            accessibilityRole="button"
            key={tab.route}
            onPress={() => {
              onChange(tab.route);
            }}
            style={[styles.tab, active ? styles.tabActive : null]}
          >
            <View>
              <Ionicons
                color={active ? colors.primary : colors.muted}
                name={active ? tab.icon.active : tab.icon.idle}
                size={22}
              />
              {tab.route === "cart" && cartBadge > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeLabel}>{String(cartBadge)}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, active ? styles.active : null]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
