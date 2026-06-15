import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text } from "react-native";

import { createOrder } from "@/api/orders";
import { fetchPickupSchedule } from "@/api/pickup";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RefreshableScrollView } from "@/components/RefreshableScrollView";
import { Screen } from "@/components/Screen";
import { formatClp } from "@/contracts/shared";
import {
  checkoutFormSchema,
  type CheckoutFormValues,
} from "@/schemas/checkout";
import { PaymentMethodSection } from "@/screens/PaymentMethodSection";
import { ScheduleBlocks } from "@/screens/ScheduleBlocks";
import { ScheduleModeSection } from "@/screens/ScheduleModeSection";
import { ScheduleSummary } from "@/screens/ScheduleSummary";
import {
  fallbackScheduleBlockOptions,
  pickupZonesToScheduleOptions,
} from "@/screens/schedule-block-options";
import {
  buildScheduleDateOptions,
  localIsoDate,
} from "@/screens/schedule-date-options";
import {
  buildScheduleSelection,
  firstScheduleBlockId,
  responseToOrder,
  scheduleBlockById,
} from "@/screens/schedule-order";
import { scheduleStyles as styles } from "@/screens/schedule-screen.styles";
import { canStartCheckout } from "@/store/cart-rules";
import { useCartStore } from "@/store/cart-store";
import type { OrderDto } from "@/types/shared";
import { buildCreateOrderPayload } from "@/utils/order-payload";

export type ScheduleScreenProps = {
  customerId: string;
  customerToken: string | null;
  onOrderCreated: (order: OrderDto) => void;
};

export function ScheduleScreen({
  customerId,
  customerToken,
  onOrderCreated,
}: ScheduleScreenProps): ReactNode {
  const { clearCart, items, totals } = useCartStore();
  const scheduleDates = useMemo(() => buildScheduleDateOptions(), []);
  const fallbackBlocks = useMemo(() => fallbackScheduleBlockOptions(), []);
  const scheduleQuery = useQuery({
    queryKey: ["pickup-schedule"],
    queryFn: fetchPickupSchedule,
  });
  const {
    data: scheduleData,
    isRefetching: isScheduleRefetching,
    refetch: refetchSchedule,
  } = scheduleQuery;
  const refreshSchedule = useCallback(async (): Promise<void> => {
    await refetchSchedule();
  }, [refetchSchedule]);
  const scheduleBlocks = useMemo(
    () =>
      scheduleData
        ? pickupZonesToScheduleOptions(scheduleData)
        : fallbackBlocks,
    [fallbackBlocks, scheduleData],
  );
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      paymentMethod: "debit",
      scheduleEnabled: false,
      scheduledForDate: localIsoDate(new Date()),
      scheduledForBlockId: firstScheduleBlockId(fallbackBlocks),
    },
  });
  const scheduleEnabled = form.watch("scheduleEnabled");
  const scheduledForDate = form.watch("scheduledForDate");
  const scheduledForBlockId = form.watch("scheduledForBlockId");
  const selectedBlock = scheduleBlockById(scheduledForBlockId, scheduleBlocks);
  const itemCopy =
    totals.itemCount === 1
      ? "1 producto"
      : `${String(totals.itemCount)} productos`;
  const windowLabel =
    scheduleEnabled && selectedBlock
      ? `${selectedBlock.start}-${selectedBlock.end}`
      : "15-25 min";
  const mutation = useMutation({
    mutationFn: (payload: ReturnType<typeof buildCreateOrderPayload>) =>
      createOrder(payload, customerToken ?? undefined),
  });

  useEffect(() => {
    if (scheduleBlocks.length === 0) {
      return;
    }

    if (scheduleBlockById(scheduledForBlockId, scheduleBlocks) === undefined) {
      form.setValue(
        "scheduledForBlockId",
        firstScheduleBlockId(scheduleBlocks),
      );
    }
  }, [form, scheduleBlocks, scheduledForBlockId]);

  const submit = form.handleSubmit(async (values) => {
    if (!canStartCheckout(items)) {
      return;
    }

    const schedule = values.scheduleEnabled
      ? buildScheduleSelection(
          values.scheduledForDate,
          values.scheduledForBlockId,
          scheduleBlocks,
        )
      : { enabled: false as const };

    if (schedule === null) {
      return;
    }

    const payload = buildCreateOrderPayload({
      customerId,
      items,
      paymentMethod: values.paymentMethod,
      schedule,
    });
    const response = await mutation.mutateAsync(payload);

    clearCart();
    onOrderCreated(response.order ?? responseToOrder(response, payload));
  });

  return (
    <Screen
      subtitle="Define cuándo pasas y cómo lo vas a pagar."
      title="Retiro"
    >
      <RefreshableScrollView
        contentContainerStyle={styles.content}
        onRefresh={refreshSchedule}
        refreshing={isScheduleRefetching}
      >
        <ScheduleSummary
          itemCopy={itemCopy}
          scheduleEnabled={scheduleEnabled}
          total={formatClp(totals.subtotal)}
          windowLabel={windowLabel}
        />

        <ScheduleModeSection
          onImmediate={() => {
            form.setValue("scheduleEnabled", false, { shouldValidate: true });
          }}
          onScheduled={() => {
            form.setValue("scheduleEnabled", true, { shouldValidate: true });
          }}
          scheduleEnabled={scheduleEnabled}
        />

        {scheduleEnabled ? (
          <ScheduleBlocks
            blocks={scheduleBlocks}
            selectedBlockId={scheduledForBlockId}
            selectedDate={scheduledForDate}
            onBlockChange={(blockId) => {
              form.setValue("scheduledForBlockId", blockId, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            onDateChange={(date) => {
              form.setValue("scheduledForDate", date, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            scheduleDates={scheduleDates}
          />
        ) : null}

        <Controller
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <PaymentMethodSection
              onChange={field.onChange}
              value={field.value}
            />
          )}
        />

        <PrimaryButton
          disabled={!canStartCheckout(items) || mutation.isPending}
          label={mutation.isPending ? "Enviando..." : "Confirmar retiro"}
          onPress={() => {
            void submit();
          }}
        />
        {mutation.isError ? (
          <Text style={styles.error}>No se pudo crear el pedido.</Text>
        ) : null}
      </RefreshableScrollView>
    </Screen>
  );
}
