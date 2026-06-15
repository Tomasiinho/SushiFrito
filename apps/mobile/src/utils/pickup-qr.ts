import * as QRCode from "qrcode";

import type { PickupQrParams } from "@/types/navigation";

export type PickupQrMatrix = {
  cells: boolean[];
  payload: string;
  size: number;
};

export function buildPickupQrPayload(params: PickupQrParams): string {
  const query = new URLSearchParams();

  query.set("v", "1");

  if (params.orderId) {
    query.set("orderId", params.orderId);
  }

  if (params.pickupCode) {
    query.set("pickupCode", params.pickupCode);
  }

  return `sushifrito:///pickup-qr?${query.toString()}`;
}

export function createPickupQrMatrix(params: PickupQrParams): PickupQrMatrix {
  const payload = buildPickupQrPayload(params);
  const qrCode = QRCode.create(payload, { errorCorrectionLevel: "M" });

  return {
    cells: Array.from(qrCode.modules.data, (cell) => cell === 1),
    payload,
    size: qrCode.modules.size,
  };
}
