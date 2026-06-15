import { describe, expect, it } from "vitest";

import {
  normalizeLegacyOrderStatus,
  normalizeLegacyPaymentMethod,
  toLegacyActiveOrdersResponse,
  toLegacyCreateOrderInput,
} from "@/lib/legacy";

describe("legacy pedidos adapter", () => {
  it("normalizes legacy payment methods into the canonical MVP contract", () => {
    expect(normalizeLegacyPaymentMethod("efectivo")).toBe("debit");
    expect(normalizeLegacyPaymentMethod("tarjeta")).toBe("debit");
    expect(normalizeLegacyPaymentMethod("transferencia")).toBe("debit");
    expect(normalizeLegacyPaymentMethod("junaeb")).toBe("junaeb");
  });

  it("normalizes legacy order states into canonical kitchen states", () => {
    expect(normalizeLegacyOrderStatus("recibido")).toBe("received");
    expect(normalizeLegacyOrderStatus("en_cocina")).toBe("frying");
    expect(normalizeLegacyOrderStatus("listo")).toBe("ready");
    expect(normalizeLegacyOrderStatus("entregado")).toBe("delivered");
  });

  it("transforms legacy create payload without leaking old field names", () => {
    const input = toLegacyCreateOrderInput({
      usuario_id: "cliente-1",
      metodo_pago: "efectivo",
      total: 14800,
      es_programado: false,
      bloque_horario: null,
      items: [
        {
          producto_id: "1",
          cantidad: 2,
          notes_especiales: "Sin cebollin",
        },
      ],
    });

    expect(input).toEqual({
      customerName: "Cliente cliente-1",
      customerPhone: "+56000000000",
      notes: null,
      paymentMethod: "debit",
      scheduled: null,
      items: [
        {
          addons: [],
          productId: "018f5c25-0678-7c40-a071-054a5a7f2b19",
          quantity: 2,
          notes: "Sin cebollin",
        },
      ],
    });
  });

  it("returns the old activos response envelope with legacy status and payment names", () => {
    const response = toLegacyActiveOrdersResponse([
      {
        id: "order-1",
        orderNumber: "SF-001",
        status: "frying",
        priority: "yellow",
        paymentMethod: "debit",
        total: 14800,
        minutesWaiting: 9,
        scheduled: false,
        isScheduled: false,
        scheduledBlock: null,
        scheduledFor: null,
        scheduledZone: null,
        customerName: "Cliente 1",
        customerPhone: "+56000000000",
        createdAt: "2026-06-14T03:00:00.000Z",
        minutesElapsed: 9,
        items: [
          {
            id: "item-1",
            productId: "roll-1",
            name: "Avocado Roll",
            unitPrice: 7400,
            quantity: 2,
            notes: "Sin cebollin",
            addons: [],
          },
        ],
      },
    ]);

    expect(response).toEqual({
      success: true,
      pedidos: [
        {
          pedido_id: "order-1",
          numero_pedido: "SF-001",
          estado: "en_cocina",
          metodo_pago: "debito",
          total: 14800,
          es_programado: false,
          bloque_horario: null,
          creado_en: "2026-06-14T03:00:00.000Z",
          minutos_transcurridos: 9,
          items: [
            {
              producto_id: "roll-1",
              nombre_producto: "Avocado Roll",
              cantidad: 2,
              notas_especiales: "Sin cebollin",
            },
          ],
        },
      ],
    });
  });
});
