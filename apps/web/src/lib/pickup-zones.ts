import type { ScheduleZone } from "@sushifrito/shared";

const pickupZoneLabels: Readonly<Partial<Record<ScheduleZone, string>>> = {
  upla_curauma: "UPLA Curauma",
  upla_playa_ancha: "UPLA Playa Ancha",
  upla_salud: "UPLA Salud",
  valpo_centro: "Valparaiso Centro",
  valpo_puerto: "Puerto / Errazuriz",
};

function fallbackZoneLabel(zone: string): string {
  return zone
    .split("_")
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function pickupZoneLabel(zone: ScheduleZone | null): string | null {
  return zone === null
    ? null
    : (pickupZoneLabels[zone] ?? fallbackZoneLabel(zone));
}
