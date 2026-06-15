import { z } from "zod";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createCustomerAccessToken,
  verifyCustomerAccessToken,
} from "@/lib/customer-access-token";

const mocks = vi.hoisted(() => ({
  ensureGuestCustomerUser: vi.fn(),
}));

vi.mock("@sushifrito/db", () => ({
  ensureGuestCustomerUser: mocks.ensureGuestCustomerUser,
}));

vi.mock("@/lib/db", () => ({
  getDb: () => ({ kind: "db-test-double" }),
}));

const guestRouteResponseSchema = z
  .object({
    customer: z
      .object({
        id: z.uuid(),
        kind: z.literal("guest"),
      })
      .strict(),
    customerToken: z.string().min(16),
    success: z.literal(true),
  })
  .strict();

const readGuestResponse = async (
  response: Response,
): Promise<z.infer<typeof guestRouteResponseSchema>> =>
  guestRouteResponseSchema.parse(await response.json());

describe("/api/guests", () => {
  beforeEach(() => {
    mocks.ensureGuestCustomerUser.mockReset();
  });

  it("does not mint a token for a caller supplied customer id", async () => {
    const { POST } = await import("@/app/api/guests/route");
    const chosenCustomerId = "0847f2ba-6f2b-4e43-b646-5749df31ad2d";
    const response = await POST(
      new Request("http://localhost/api/guests", {
        body: JSON.stringify({ customerId: chosenCustomerId }),
        method: "POST",
      }),
    );
    const body = await readGuestResponse(response);

    expect(response.status).toBe(200);
    expect(body.customer.id).not.toBe(chosenCustomerId);
    expect(
      verifyCustomerAccessToken(body.customer.id, body.customerToken),
    ).toBe(true);
    expect(mocks.ensureGuestCustomerUser).toHaveBeenCalledWith(
      { kind: "db-test-double" },
      body.customer.id,
    );
  });

  it("reissues the same guest only when the existing token is valid", async () => {
    const { POST } = await import("@/app/api/guests/route");
    const customerId = "0847f2ba-6f2b-4e43-b646-5749df31ad2d";
    const response = await POST(
      new Request("http://localhost/api/guests", {
        body: JSON.stringify({
          customerId,
          customerToken: createCustomerAccessToken(customerId),
        }),
        method: "POST",
      }),
    );
    const body = await readGuestResponse(response);

    expect(response.status).toBe(200);
    expect(body.customer.id).toBe(customerId);
    expect(verifyCustomerAccessToken(customerId, body.customerToken)).toBe(true);
  });
});
