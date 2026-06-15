import { z } from "zod";

import { apiFetch } from "@/api/client";
import type { PickupZoneDto } from "@sushifrito/shared";

const pickupBlockSchema = z
  .object({
    end: z.string(),
    id: z.string(),
    isActive: z.boolean(),
    label: z.string(),
    sortOrder: z.number(),
    start: z.string(),
    subtitle: z.string(),
    zone: z.string(),
  })
  .strict();

const pickupZoneSchema = z
  .object({
    blocks: z.array(pickupBlockSchema),
    description: z.string(),
    id: z.string(),
    isActive: z.boolean(),
    name: z.string(),
    sortOrder: z.number(),
  })
  .strict();

const pickupScheduleResponseSchema = z
  .object({
    zones: z.array(pickupZoneSchema),
  })
  .strict();

export const fetchPickupSchedule = (): Promise<PickupZoneDto[]> =>
  apiFetch<unknown>("/api/pickup/schedule").then(
    (response) => pickupScheduleResponseSchema.parse(response).zones,
  );
