import { CheckCircle2, ChefHat, Flame, PackageCheck } from "lucide-react";
import type { ComponentType, ReactElement } from "react";

import type { OrderStatus } from "@/types/kitchen";

interface StatusAction {
  label: string;
  nextStatus: OrderStatus;
  Icon: ComponentType<{ className?: string }>;
}

const statusActions: Partial<Record<OrderStatus, StatusAction>> = {
  received: {
    label: "Iniciar preparacion",
    nextStatus: "preparing",
    Icon: ChefHat
  },
  preparing: {
    label: "Pasar a fritura",
    nextStatus: "frying",
    Icon: Flame
  },
  frying: {
    label: "Marcar listo",
    nextStatus: "ready",
    Icon: CheckCircle2
  },
  ready: {
    label: "Entregar pedido",
    nextStatus: "delivered",
    Icon: PackageCheck
  }
};

interface StatusActionButtonProps {
  status: OrderStatus;
  disabled: boolean;
  onChange: (status: OrderStatus) => void;
}

export function StatusActionButton({
  status,
  disabled,
  onChange
}: StatusActionButtonProps): ReactElement | null {
  const action = statusActions[status];
  if (action === undefined) {
    return null;
  }

  const Icon = action.Icon;

  return (
    <button
      className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-[#201711] px-4 text-base font-black text-[#fff7e8] transition hover:bg-[#3a2a20] disabled:cursor-not-allowed disabled:bg-[#b8a79a]"
      disabled={disabled}
      onClick={() => {
        onChange(action.nextStatus);
      }}
      type="button"
    >
      <Icon className="size-4" />
      {disabled ? "Actualizando" : action.label}
    </button>
  );
}
