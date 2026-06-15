import type { AppRouteName, TabRouteName } from "@/types/navigation";

export const isTabRoute = (route: AppRouteName): route is TabRouteName =>
  route === "catalog" ||
  route === "cart" ||
  route === "tracking" ||
  route === "history";

export const tabRouteForRoute = (
  route: AppRouteName
): TabRouteName | null => {
  if (isTabRoute(route)) {
    return route;
  }

  if (route === "schedule") {
    return "cart";
  }

  if (route === "pickupQr") {
    return "tracking";
  }

  return null;
};
