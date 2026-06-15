import type { ReactNode } from "react";
import { View } from "react-native";

import { ScheduleChoiceCard } from "@/screens/ScheduleChoiceCard";
import { scheduleStyles as styles } from "@/screens/schedule-screen.styles";
import { SectionHeader } from "@/screens/ScheduleText";
import type { PaymentMethod } from "@/types/shared";

export type PaymentMethodSectionProps = {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

const paymentOptions: readonly {
  id: PaymentMethod;
  icon: "card-outline" | "school-outline";
  title: string;
  subtitle: string;
}[] = [
  {
    id: "debit",
    icon: "card-outline",
    title: "Débito",
    subtitle: "Paga rápido y retira sin pasar por caja."
  },
  {
    id: "junaeb",
    icon: "school-outline",
    title: "Junaeb",
    subtitle: "Deja el pedido reservado y confirma al retirar."
  }
];

export function PaymentMethodSection({
  onChange,
  value
}: PaymentMethodSectionProps): ReactNode {
  return (
    <View style={styles.section}>
      <SectionHeader
        helper="Débito queda recomendado para retirar sin fricción."
        title="Cómo pagas"
      />
      <View style={styles.blockStack}>
        {paymentOptions.map((option) => (
          <ScheduleChoiceCard
            active={value === option.id}
            icon={option.icon}
            key={option.id}
            onPress={() => {
              onChange(option.id);
            }}
            subtitle={option.subtitle}
            title={option.title}
          />
        ))}
      </View>
    </View>
  );
}
