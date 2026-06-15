import { queryOptions } from "@tanstack/react-query";

import { fetchCatalog, fetchCustomerOrders, fetchOrder } from "@/api/orders";
import type { OrderDto, ProductDto } from "@/types/shared";

type CatalogQueryOptions = ReturnType<
  typeof queryOptions<ProductDto[], Error, ProductDto[], readonly ["catalog"]>
>;
type CustomerOrdersQueryOptions = ReturnType<
  typeof queryOptions<
    OrderDto[],
    Error,
    OrderDto[],
    readonly ["orders", string, string | null]
  >
>;
type OrderQueryOptions = ReturnType<
  typeof queryOptions<
    OrderDto,
    Error,
    OrderDto,
    readonly ["order", string, string]
  >
>;

export const catalogQuery = (): CatalogQueryOptions =>
  queryOptions({
    queryKey: ["catalog"] as const,
    queryFn: fetchCatalog,
    staleTime: 60_000
  });

export const customerOrdersQuery = (
  customerId: string,
  customerToken: string | null,
): CustomerOrdersQueryOptions =>
  queryOptions({
    queryKey: ["orders", customerId, customerToken] as const,
    queryFn: () => fetchCustomerOrders(customerId, customerToken ?? ""),
    enabled: customerId.length > 0 && customerToken !== null
  });

export const orderQuery = (
  orderId: string,
  trackingToken: string,
): OrderQueryOptions =>
  queryOptions({
    queryKey: ["order", orderId, trackingToken] as const,
    queryFn: () => fetchOrder(orderId, trackingToken),
    enabled: orderId.length > 0 && trackingToken.length > 0,
    refetchInterval: 10_000
  });
