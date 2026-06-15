import type { ReactElement } from "react";

import {
  CalendarClock,
  CreditCard,
  ReceiptText,
  UserRound,
} from "lucide-react";

import { StatusActionButton } from "@/components/kitchen/status-action";
import { getKdsPriorityPresentation } from "@/lib/kds-priority";
import { pickupZoneLabel } from "@/lib/pickup-zones";
import type { KitchenOrderDto, OrderStatus } from "@/types/kitchen";

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const statusLabel: Record<OrderStatus, string> = {
  cancelled: "Cancelado",
  delivered: "Entregado",
  frying: "En fritura",
  preparing: "Preparando",
  ready: "Listo retiro",
  received: "Recibido",
};

const paymentLabel: Record<KitchenOrderDto["paymentMethod"], string> = {
  debit: "Debito",
  junaeb: "Junaeb",
};

interface OrderCardProps {
  order: KitchenOrderDto;
  disabled: boolean;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}

export function OrderCard({
  order,
  disabled,
  onStatusChange,
}: OrderCardProps): ReactElement {
  const priority = getKdsPriorityPresentation(order.minutesElapsed);
  const roundedMinutes = Math.max(0, Math.round(order.minutesElapsed));
  const hasSchedule = order.scheduledBlock !== null;
  const zone = pickupZoneLabel(order.scheduledZone);
  const scheduleLabel = hasSchedule
    ? [order.scheduledBlock ?? "Programado", zone].filter(Boolean).join(" · ")
    : (zone ?? "Ahora");

  return (
    <article
      className={`relative flex min-h-80 flex-col rounded-lg border-2 p-4 shadow-xl ${priority.cardClassName} ${
        priority.blink ? "kds-blink" : ""
      }`}
    >
      <div
        className={`absolute top-4 right-4 rounded-lg px-4 py-2 text-3xl leading-none font-black ${priority.badgeClassName}`}
      >
        {roundedMinutes}
        <span className="ml-1 text-sm font-black">min</span>
      </div>

      <div className="pr-28">
        <p className="text-sm font-black text-[#6d5a50]">{order.orderNumber}</p>
        <h2 className="mt-1 text-3xl leading-none font-black text-[#1d1713]">
          Pedido #{order.id.slice(0, 5).toUpperCase()}
        </h2>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-black text-[#4d3a30]">
        <InfoChip Icon={ReceiptText} label={statusLabel[order.status]} />
        <InfoChip Icon={CreditCard} label={paymentLabel[order.paymentMethod]} />
        <InfoChip Icon={UserRound} label={order.customerName} />
        <InfoChip Icon={CalendarClock} label={scheduleLabel} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-y border-[#1d1713]/10 py-3">
        <span className="text-base font-black text-[#6d5a50]">
          {priority.label}
        </span>
        <span className="text-2xl font-black text-[#1d1713]">
          {currencyFormatter.format(order.total)}
        </span>
      </div>

      <ul className="mt-4 space-y-3 pr-1">
        {order.items.map((item) => (
          <li
            className="rounded-lg border border-[#1d1713]/10 bg-white/75 p-3"
            key={item.id}
          >
            <div className="flex justify-between gap-3 text-lg font-black text-[#1d1713]">
              <span>{item.name}</span>
              <span>x{item.quantity}</span>
            </div>
            {item.addons.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {item.addons.map((addon) => (
                  <span
                    className="rounded-md bg-[#f0deca] px-2 py-1 text-xs font-black text-[#5b4538]"
                    key={addon.id}
                  >
                    {addon.name}
                    {addon.quantity > 1 ? ` x${String(addon.quantity)}` : ""}
                  </span>
                ))}
              </div>
            ) : null}
            {item.notes !== null && item.notes.trim().length > 0 ? (
              <p className="mt-2 rounded-md bg-[#ffe0d9] px-2 py-1 text-sm font-black text-[#b32217]">
                Ojo: {item.notes}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <StatusActionButton
          disabled={disabled}
          onChange={(status) => {
            onStatusChange(order.id, status);
          }}
          status={order.status}
        />
      </div>
    </article>
  );
}

interface InfoChipProps {
  Icon: typeof CalendarClock;
  label: string;
}

function InfoChip({ Icon, label }: InfoChipProps): ReactElement {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md bg-white/65 px-2 py-2">
      <Icon className="size-4 shrink-0 text-[#e22b1f]" />
      <span className="truncate">{label}</span>
    </div>
  );
}
