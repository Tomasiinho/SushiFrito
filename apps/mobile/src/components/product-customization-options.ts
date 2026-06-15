export type SauceOption = {
  id: string;
  label: string;
  profile: string;
  description: string;
};

export type PackingMode = "no-chopsticks" | "share" | "standard";

export type PackingOption = {
  id: PackingMode;
  label: string;
  description: string;
  chopsticks: boolean;
  notes?: string;
};

export const sauceOptions: readonly SauceOption[] = [
  {
    id: "soya",
    label: "Soya",
    profile: "Clásica",
    description: "Salada, limpia y rápida para cualquier roll."
  },
  {
    id: "acevichada",
    label: "Acevichada",
    profile: "Cítrica",
    description: "Cremosa y fresca, buena con pollo o camarón."
  },
  {
    id: "spicy",
    label: "Spicy",
    profile: "Picante",
    description: "Más carácter sin tapar el crunch."
  },
  {
    id: "teriyaki",
    label: "Teriyaki",
    profile: "Dulce",
    description: "Glaseada, intensa y más contundente."
  }
];

export const packingOptions: readonly PackingOption[] = [
  {
    id: "standard",
    label: "Con palitos",
    description: "Incluye palitos y servilleta.",
    chopsticks: true
  },
  {
    id: "no-chopsticks",
    label: "Sin palitos",
    description: "Menos desechable para retiro rápido.",
    chopsticks: false
  },
  {
    id: "share",
    label: "Para compartir",
    description: "Palitos y empaque marcado para abrir en mesa.",
    chopsticks: true,
    notes: "Empaque para compartir"
  }
];

export const packingOptionById = (
  mode: PackingMode
): PackingOption => {
  const option = packingOptions.find((candidate) => candidate.id === mode);

  if (option) {
    return option;
  }

  const fallback = packingOptions.find((candidate) => candidate.id === "standard");

  if (!fallback) {
    throw new Error("Missing standard packing option");
  }

  return fallback;
};
