import type { CreateOrderResponse } from "@/api/orders";
import {
  fallbackScheduleBlockOptions,
  type ScheduleBlockOption,
} from "@/screens/schedule-block-options";
import type { CreateOrderPayload, OrderDto } from "@/types/shared";

const fallbackBlocks = fallbackScheduleBlockOptions();

export const firstScheduleBlockId = (
  blocks: readonly ScheduleBlockOption[] = fallbackBlocks,
): string => blocks[0]?.id ?? "";

export const scheduleBlockById = (
  blockId: string | undefined,
  blocks: readonly ScheduleBlockOption[] = fallbackBlocks,
): ScheduleBlockOption | undefined =>
  blocks.find((block) => block.id === blockId);

export const responseToOrder = (
  response: CreateOrderResponse,
  payload: CreateOrderPayload,
): OrderDto => ({
  id: response.orderId,
  orderNumber: response.orderNumber,
  customerId: payload.customerId ?? "guest-customer",
  status: response.status,
  total: 0,
  createdAt: new Date().toISOString(),
  items: [],
  ...(response.pickupCode ? { pickupCode: response.pickupCode } : {}),
  ...(payload.scheduled?.date
    ? { scheduledForDate: payload.scheduled.date }
    : {}),
  ...(payload.scheduled
    ? {
        scheduledForBlockId: `${payload.scheduled.blockStart}-${payload.scheduled.blockEnd}`,
      }
    : {}),
});

export function buildScheduleSelection(
  date: string | undefined,
  blockId: string | undefined,
  blocks: readonly ScheduleBlockOption[] = fallbackBlocks,
): {
  blockEnd: string;
  blockId: string;
  blockStart: string;
  date: string;
  enabled: true;
  zone: string;
} | null {
  if (!date || !blockId) {
    return null;
  }

  const block = scheduleBlockById(blockId, blocks);

  if (block === undefined) {
    return null;
  }

  return {
    blockEnd: block.end,
    blockId,
    blockStart: block.start,
    date,
    enabled: true,
    zone: block.zone,
  };
}
