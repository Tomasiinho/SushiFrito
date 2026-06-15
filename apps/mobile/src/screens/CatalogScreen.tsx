import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import type { ReactNode } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { catalogQuery } from "@/api/queries";
import { EmptyState } from "@/components/EmptyState";
import { ProductCard } from "@/components/ProductCard";
import { RefreshableScrollView } from "@/components/RefreshableScrollView";
import { Screen } from "@/components/Screen";
import { formatClp } from "@/contracts/shared";
import { fallbackCatalog } from "@/data/fallback-catalog";
import {
  catalogFilters,
  type CatalogFilterId,
  matchesCatalogFilter,
} from "@/screens/catalog-filters";
import { catalogStyles as styles } from "@/screens/catalog-screen.styles";
import { useCartStore } from "@/store/cart-store";
import { colors } from "@/styles/theme";

const fallbackImageUrl =
  fallbackCatalog.find((product) => product.imageUrl)?.imageUrl ??
  "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=80";

export type CatalogScreenProps = {
  onProductAdded?: (productName: string) => void;
};

export function CatalogScreen({
  onProductAdded,
}: CatalogScreenProps): ReactNode {
  const [activeFilter, setActiveFilter] =
    React.useState<CatalogFilterId>("all");
  const {
    data: catalogData,
    isError: isCatalogError,
    isPending: isCatalogPending,
    isRefetching: isCatalogRefetching,
    refetch: refetchCatalog,
  } = useQuery(catalogQuery());
  const addProduct = useCartStore((state) => state.addProduct);
  const products =
    catalogData && catalogData.length > 0 ? catalogData : fallbackCatalog;
  const featuredProduct =
    products.find((product) =>
      product.tags?.some((tag) => tag.toLowerCase().includes("pedido")),
    ) ?? products[0];
  const filteredProducts = products.filter((product) =>
    matchesCatalogFilter(product, activeFilter),
  );
  const activeFilterLabel =
    catalogFilters.find((filter) => filter.id === activeFilter)?.label ??
    "Todo";
  const visibleProducts =
    filteredProducts.length > 0 ? filteredProducts : products;
  const refreshCatalog = React.useCallback(async (): Promise<void> => {
    await refetchCatalog();
  }, [refetchCatalog]);

  return (
    <Screen
      subtitle="Elige rápido, personaliza salsas y agenda retiro."
      title="Menú"
    >
      <RefreshableScrollView
        contentContainerStyle={styles.list}
        onRefresh={refreshCatalog}
        refreshing={isCatalogRefetching}
      >
        {isCatalogPending ? (
          <Text style={styles.notice}>Cargando catálogo...</Text>
        ) : null}
        {isCatalogError ? (
          <Text style={styles.notice}>Mostrando catálogo local.</Text>
        ) : null}
        <ScrollView
          contentContainerStyle={styles.chipRail}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {catalogFilters.map((filter) => {
            const active = filter.id === activeFilter;
            return (
              <Pressable
                accessibilityRole="button"
                key={filter.id}
                onPress={() => {
                  setActiveFilter(filter.id);
                }}
                style={[styles.chip, active ? styles.chipActive : null]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    active ? styles.chipLabelActive : null,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {featuredProduct ? (
          <ImageBackground
            imageStyle={styles.featureImage}
            source={{ uri: featuredProduct.imageUrl ?? fallbackImageUrl }}
            style={styles.feature}
          >
            <LinearGradient
              colors={[colors.overlay, colors.ink]}
              style={styles.featureBody}
            >
              <View>
                <Text style={styles.featureKicker}>
                  Más pedido cerca de UPLA
                </Text>
                <Text style={styles.featureName}>{featuredProduct.name}</Text>
                <Text style={styles.featurePrice}>
                  {formatClp(featuredProduct.price)}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  addProduct({
                    options: {
                      chopsticks: featuredProduct.includesChopsticks ?? true,
                      sauces: ["soya"],
                    },
                    product: featuredProduct,
                  });
                  onProductAdded?.(featuredProduct.name);
                }}
                style={styles.featureButton}
              >
                <Text style={styles.featureButtonText}>Agregar destacado</Text>
              </Pressable>
            </LinearGradient>
          </ImageBackground>
        ) : null}
        {products.length === 0 ? (
          <EmptyState
            message="Vuelve en unos minutos para revisar disponibilidad."
            title="Sin productos disponibles"
          />
        ) : (
          <View>
            <Text style={styles.sectionTitle}>
              {activeFilter === "all" ? "Para pedir ahora" : activeFilterLabel}
            </Text>
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                onAdd={(selectedProduct, options) => {
                  addProduct({ product: selectedProduct, options });
                  onProductAdded?.(selectedProduct.name);
                }}
                product={product}
              />
            ))}
          </View>
        )}
      </RefreshableScrollView>
    </Screen>
  );
}
