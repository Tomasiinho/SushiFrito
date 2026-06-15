import { z } from "zod";

export const checkoutFormSchema = z
  .object({
    paymentMethod: z.enum(["junaeb", "debit"]),
    scheduleEnabled: z.boolean(),
    scheduledForDate: z.string().optional(),
    scheduledForBlockId: z.string().optional()
  })
  .superRefine((value, ctx) => {
    if (!value.scheduleEnabled) {
      return;
    }

    if (!value.scheduledForDate) {
      ctx.addIssue({
        code: "custom",
        message: "Elige una fecha",
        path: ["scheduledForDate"]
      });
    }

    if (!value.scheduledForBlockId) {
      ctx.addIssue({
        code: "custom",
        message: "Elige un bloque",
        path: ["scheduledForBlockId"]
      });
    }
  });

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
