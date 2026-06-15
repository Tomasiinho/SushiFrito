import { describe, expect, it } from "vitest";

import { GET as getLegacyPedidos } from "@/app/api/pedidos/route";
import { GET as getLegacyActivePedidos } from "@/app/api/pedidos/activos/route";
import { PATCH as patchLegacyPedidoStatus } from "@/app/api/pedidos/[id]/estado/route";
import { GET as getOrderDetail } from "@/app/api/orders/[id]/route";

const routeContext = {
  params: Promise.resolve({ id: "00000000-0000-4000-8000-000000000000" }),
};

describe("API auth boundaries", () => {
  it("requires kitchen access for legacy kitchen order reads", async () => {
    const request = new Request("http://localhost/api/pedidos");

    await expect(getLegacyPedidos(request)).resolves.toMatchObject({
      status: 401,
    });
    await expect(getLegacyActivePedidos(request)).resolves.toMatchObject({
      status: 401,
    });
  });

  it("requires kitchen mutation access for legacy status updates", async () => {
    const request = new Request(
      "http://localhost/api/pedidos/00000000-0000-4000-8000-000000000000/estado",
      {
        body: JSON.stringify({ estado: "listo" }),
        method: "PATCH",
      },
    );

    await expect(
      patchLegacyPedidoStatus(request, routeContext),
    ).resolves.toMatchObject({
      status: 401,
    });
  });

  it("requires an order access token before reading order details", async () => {
    const request = new Request(
      "http://localhost/api/orders/00000000-0000-4000-8000-000000000000",
    );

    await expect(getOrderDetail(request, routeContext)).resolves.toMatchObject({
      status: 403,
    });
  });
});
