import type { ProductDto } from "@/types/shared";

export const fallbackCatalog: ProductDto[] = [
  {
    id: "018f5c25-0678-7c40-a071-054a5a7f2b20",
    name: "UPLA Furai Roll",
    description:
      "Pollo apanado, queso crema, cebollín y arroz frito crujiente.",
    price: 4500,
    category: "rolls",
    isAvailable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=80",
    tags: ["Más pedido", "Frito"],
    maxSauces: 2,
    includesChopsticks: true,
  },
  {
    id: "018f5c25-0678-7c40-a071-054a5a7f2b19",
    name: "Crunchy Valpo Roll",
    description: "Camarón tempura, palta y queso crema con cobertura crispy.",
    price: 6900,
    category: "rolls",
    isAvailable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=900&q=80",
    tags: ["10 cortes", "Frito", "Valparaíso"],
    maxSauces: 2,
    includesChopsticks: true,
  },
  {
    id: "018f5c25-0678-7c40-a071-054a5a7f2b23",
    name: "Box Oficina 24 piezas",
    description: "2 handrolls fritos, salsas a elección y bebida lata.",
    price: 9900,
    category: "boxes",
    isAvailable: true,
    tags: ["Promo"],
    maxSauces: 3,
    includesChopsticks: true,
  },
  {
    id: "018f5c25-0678-7c40-a071-054a5a7f2b25",
    name: "Humanidades Teriyaki Roll",
    description:
      "Pollo furai, queso crema y cebollín para retiro en Playa Ancha.",
    price: 5200,
    category: "rolls",
    isAvailable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=900&q=80",
    tags: ["UPLA", "Frito"],
    maxSauces: 2,
    includesChopsticks: true,
  },
  {
    id: "018f5c25-0678-7c40-a071-054a5a7f2b26",
    name: "Centro Express Handroll",
    description:
      "Handroll de camarón crispy pensado para pausa corta en el plan.",
    price: 3900,
    category: "handrolls",
    isAvailable: true,
    tags: ["Valparaíso", "Frito"],
    maxSauces: 1,
    includesChopsticks: false,
  },
];
