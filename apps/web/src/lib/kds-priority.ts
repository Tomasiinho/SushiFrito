export type KdsPriorityTone = "green" | "yellow" | "red";

export interface KdsPriorityPresentation {
  tone: KdsPriorityTone;
  label: string;
  blink: boolean;
  cardClassName: string;
  badgeClassName: string;
}

export function getKdsPriorityPresentation(
  minutesElapsed: number
): KdsPriorityPresentation {
  const minutes = Number.isFinite(minutesElapsed) ? minutesElapsed : 0;

  if (minutes > 12) {
    return {
      tone: "red",
      label: "Alta demora",
      blink: true,
      cardClassName: "border-[#e22b1f] bg-[#fff1ed] shadow-[#e22b1f]/10",
      badgeClassName: "bg-[#e22b1f] text-white"
    };
  }

  if (minutes >= 7) {
    return {
      tone: "yellow",
      label: "Atencion",
      blink: false,
      cardClassName: "border-[#d9981f] bg-[#fff6dd] shadow-[#d9981f]/10",
      badgeClassName: "bg-[#d9981f] text-[#1d1713]"
    };
  }

  return {
    tone: "green",
    label: "A tiempo",
    blink: false,
    cardClassName: "border-[#2f8f52] bg-[#eef9ee] shadow-[#2f8f52]/10",
    badgeClassName: "bg-[#2f8f52] text-white"
  };
}
