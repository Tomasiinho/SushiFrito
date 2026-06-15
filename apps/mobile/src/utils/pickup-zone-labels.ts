import type { ScheduleZone } from "@/types/shared";

const pickupZoneLabels: Readonly<Partial<Record<ScheduleZone, string>>> = {
  upla_curauma: "UPLA Curauma",
  upla_playa_ancha: "UPLA Playa Ancha",
  upla_salud: "UPLA Salud",
  valpo_centro: "Valparaíso Centro",
  valpo_puerto: "Puerto / Errazuriz",
};

const fallbackZoneLabel = (zone: string): string =>
  zone
    .split("_")
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");

export const pickupZoneLabel = (
  zone: ScheduleZone | undefined,
): string | null =>
  zone ? (pickupZoneLabels[zone] ?? fallbackZoneLabel(zone)) : null;
