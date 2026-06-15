export type ScheduleDateOption = { label: string; value: string };

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  weekday: "short"
});

export const localIsoDate = (date: Date): string => {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export function buildScheduleDateOptions(): ScheduleDateOption[] {
  return [0, 1, 2].map((offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);

    return {
      label: offset === 0 ? "Hoy" : dateFormatter.format(date),
      value: localIsoDate(date)
    };
  });
}
