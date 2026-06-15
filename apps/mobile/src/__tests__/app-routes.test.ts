import { describe, expect, it } from "vitest";

import { isTabRoute, tabRouteForRoute } from "@/navigation/routes";

describe("mobile routes", () => {
  it("keeps home out of the tab bar", () => {
    expect(isTabRoute("home")).toBe(false);
    expect(tabRouteForRoute("home")).toBeNull();
  });

  it("maps internal flow routes to their parent tab", () => {
    expect(tabRouteForRoute("schedule")).toBe("cart");
    expect(tabRouteForRoute("pickupQr")).toBe("tracking");
  });

  it("accepts primary tabs directly", () => {
    expect(isTabRoute("catalog")).toBe(true);
    expect(tabRouteForRoute("history")).toBe("history");
  });
});
