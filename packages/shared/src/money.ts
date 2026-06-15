const clpFormatter = new Intl.NumberFormat("es-CL", {
  currency: "CLP",
  maximumFractionDigits: 0,
  style: "currency",
});

export function formatClp(amount: number): string {
  return clpFormatter.format(amount);
}
