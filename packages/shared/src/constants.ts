export const orderStatusValues = [
  "received",
  "preparing",
  "frying",
  "ready",
  "delivered",
  "cancelled",
] as const;

export const paymentMethodValues = ["junaeb", "debit"] as const;

export const paymentStatusValues = ["pending", "paid", "failed"] as const;

export const kdsPriorityValues = ["green", "yellow", "red"] as const;

export const devicePlatformValues = ["ios", "android", "web"] as const;

export const scheduleZoneValues = [
  "upla_playa_ancha",
  "upla_curauma",
  "upla_salud",
  "valpo_centro",
  "valpo_puerto",
] as const;

export const scheduleBlocks = {
  upla_playa_ancha: [
    {
      id: "upla-humanidades-lunch",
      zone: "upla_playa_ancha",
      label: "Humanidades Playa Ancha",
      subtitle: "Acceso Facultad de Humanidades",
      start: "12:00",
      end: "13:10",
    },
    {
      id: "upla-educacion-afternoon",
      zone: "upla_playa_ancha",
      label: "Educacion UPLA",
      subtitle: "Punto rapido para bloque de tarde",
      start: "13:15",
      end: "14:25",
    },
    {
      id: "upla-ciencias-evening",
      zone: "upla_playa_ancha",
      label: "Ciencias Naturales",
      subtitle: "Retiro salida de clases",
      start: "18:00",
      end: "19:15",
    },
  ],
  upla_curauma: [
    {
      id: "upla-curauma-lunch",
      zone: "upla_curauma",
      label: "Campus Curauma",
      subtitle: "Encuentro sector biblioteca",
      start: "12:15",
      end: "13:25",
    },
    {
      id: "upla-curauma-evening",
      zone: "upla_curauma",
      label: "Curauma salida",
      subtitle: "Retiro antes del bus de vuelta",
      start: "17:45",
      end: "18:45",
    },
  ],
  upla_salud: [
    {
      id: "upla-salud-lunch",
      zone: "upla_salud",
      label: "Facultad de Salud",
      subtitle: "Punto compacto para practica y turnos",
      start: "12:30",
      end: "13:40",
    },
    {
      id: "upla-salud-afternoon",
      zone: "upla_salud",
      label: "Salud tarde",
      subtitle: "Retiro entre laboratorios",
      start: "14:00",
      end: "15:00",
    },
  ],
  valpo_centro: [
    {
      id: "valpo-victoria-lunch",
      zone: "valpo_centro",
      label: "Plaza Victoria",
      subtitle: "Centro, oficinas y tramites",
      start: "12:30",
      end: "13:45",
    },
    {
      id: "valpo-anibal-afternoon",
      zone: "valpo_centro",
      label: "Anibal Pinto",
      subtitle: "Retiro para pausa corta",
      start: "13:45",
      end: "15:00",
    },
    {
      id: "valpo-centro-evening",
      zone: "valpo_centro",
      label: "Centro noche",
      subtitle: "Salida de oficina o vespertino",
      start: "19:00",
      end: "20:15",
    },
  ],
  valpo_puerto: [
    {
      id: "valpo-puerto-lunch",
      zone: "valpo_puerto",
      label: "Puerto / Errazuriz",
      subtitle: "Punto para trabajadores del borde costero",
      start: "12:45",
      end: "14:00",
    },
    {
      id: "valpo-puerto-evening",
      zone: "valpo_puerto",
      label: "Puerto tarde",
      subtitle: "Retiro antes de volver al cerro",
      start: "18:30",
      end: "19:45",
    },
  ],
} as const;
