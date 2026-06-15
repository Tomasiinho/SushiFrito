import { scheduleBlocks } from "@/contracts/shared";
import type { PickupZoneDto } from "@sushifrito/shared";

export type ScheduleBlockOption = {
  id: string;
  zone: string;
  label: string;
  subtitle: string;
  start: string;
  end: string;
};

export const fallbackScheduleBlockOptions = (): ScheduleBlockOption[] =>
  Object.values(scheduleBlocks)
    .flat()
    .map((block) => ({
      end: block.end,
      id: block.id,
      label: block.label,
      start: block.start,
      subtitle: block.subtitle,
      zone: block.zone,
    }));

export const pickupZonesToScheduleOptions = (
  zones: PickupZoneDto[],
): ScheduleBlockOption[] =>
  zones.flatMap((zone) =>
    zone.blocks.map((block) => ({
      end: block.end,
      id: block.id,
      label: block.label,
      start: block.start,
      subtitle: `${zone.name} · ${block.subtitle}`,
      zone: zone.id,
    })),
  );
