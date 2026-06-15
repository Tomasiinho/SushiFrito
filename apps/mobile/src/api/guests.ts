import { z } from "zod";

import { apiFetch } from "@/api/client";

const guestResponseSchema = z
  .object({
    customer: z.object({
      id: z.uuid(),
      kind: z.literal("guest"),
    }),
    customerToken: z.string().min(16),
    success: z.literal(true),
  })
  .strict();

export type GuestCustomerSession = {
  customerId: string;
  customerToken: string | null;
};

export const ensureGuestCustomer = (
  session: GuestCustomerSession | null,
): Promise<GuestCustomerSession> =>
  apiFetch<unknown>("/api/guests", {
    body:
      session?.customerToken === null || session === null
        ? {}
        : {
            customerId: session.customerId,
            customerToken: session.customerToken,
          },
    method: "POST",
  }).then((response) => {
    const parsed = guestResponseSchema.parse(response);

    return {
      customerId: parsed.customer.id,
      customerToken: parsed.customerToken,
    };
  });
