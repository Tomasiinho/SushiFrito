import { describe, expect, it } from "vitest";

import {
  buildScheduledDateTime,
  canTransitionOrderStatus,
  cloneOrderItemsForCart,
  createOrderSchema,
  kdsPriorityForMinutes,
} from "./index";

describe("createOrderSchema", () => {
  const validOrder = {
    customerName: "Nico",
    customerPhone: "+56912345678",
    paymentMethod: "junaeb",
    items: [
      {
        productId: "018f5c25-0678-7c40-a071-054a5a7f2b19",
        quantity: 2,
        addons: [],
      },
    ],
  } as const;

  it("rechaza carrito vacio", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      items: [],
    });

    expect(result.success).toBe(false);
  });

  it("rechaza metodo de pago invalido", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      paymentMethod: "cash",
    });

    expect(result.success).toBe(false);
  });

  it("acepta zonas de retiro editables y rechaza slugs invalidos", () => {
    expect(
      createOrderSchema.safeParse({
        ...validOrder,
        scheduled: {
          blockEnd: "13:10",
          blockStart: "12:00",
          date: "2026-06-15",
          zone: "upla_playa_ancha",
        },
      }).success,
    ).toBe(true);
    expect(
      createOrderSchema.safeParse({
        ...validOrder,
        scheduled: {
          blockEnd: "13:45",
          blockStart: "12:30",
          date: "2026-06-15",
          zone: "zona nueva",
        },
      }).success,
    ).toBe(false);
  });
});

describe("kdsPriorityForMinutes", () => {
  it("calcula verde antes de 7 minutos, amarillo entre 7 y 12, rojo sobre 12", () => {
    expect(kdsPriorityForMinutes(6)).toBe("green");
    expect(kdsPriorityForMinutes(7)).toBe("yellow");
    expect(kdsPriorityForMinutes(12)).toBe("yellow");
    expect(kdsPriorityForMinutes(13)).toBe("red");
  });
});

describe("canTransitionOrderStatus", () => {
  it("rechaza delivered -> frying", () => {
    expect(canTransitionOrderStatus("delivered", "frying")).toBe(false);
  });
});

describe("cloneOrderItemsForCart", () => {
  it("crea deep copy con ids nuevos para repetir pedido", () => {
    const original = [
      {
        id: "item-1",
        productId: "product-1",
        name: "SushiFrito Camaron",
        unitPrice: 4990,
        quantity: 1,
        notes: "Sin cebollin",
        addons: [
          {
            id: "addon-line-1",
            addonId: "addon-1",
            name: "Salsa acevichada",
            unitPrice: 500,
            quantity: 1,
          },
        ],
      },
    ] as const;

    const cloned = cloneOrderItemsForCart(original);

    expect(cloned).toHaveLength(1);
    expect(cloned[0]?.id).not.toBe(original[0].id);
    expect(cloned[0]?.addons[0]?.id).not.toBe(original[0].addons[0].id);
    expect(cloned[0]?.addons[0]?.name).toBe("Salsa acevichada");
    expect(cloned[0]?.addons).not.toBe(original[0].addons);
  });
});

describe("buildScheduledDateTime", () => {
  it("produce una fecha valida desde fecha y bloque", () => {
    const scheduledFor = buildScheduledDateTime("2026-06-15", "12:30");

    expect(scheduledFor).toBeInstanceOf(Date);
    expect(Number.isNaN(scheduledFor.getTime())).toBe(false);
  });
});
