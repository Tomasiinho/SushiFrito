import "server-only";

export type RealtimeEventName =
  | "order.created"
  | "order.status_changed"
  | "kitchen.summary_changed";

export type RealtimeEvent =
  | {
      event: "order.created";
      payload: {
        orderId: string;
      };
    }
  | {
      event: "order.status_changed";
      payload: {
        orderId: string;
        status: string;
      };
    }
  | {
      event: "kitchen.summary_changed";
      payload: Record<string, unknown>;
    };

function getRealtimeEmitUrl(): string | null {
  const baseUrl =
    process.env.REALTIME_INTERNAL_URL?.trim() ||
    process.env.NEXT_PUBLIC_REALTIME_URL?.trim();

  if (!baseUrl) {
    return null;
  }

  return new URL("/emit", baseUrl).toString();
}

export async function emitRealtimeEvent(event: RealtimeEvent): Promise<void> {
  const emitUrl = getRealtimeEmitUrl();
  if (emitUrl === null) {
    return;
  }

  try {
    const headers = new Headers({ "Content-Type": "application/json" });
    const token = process.env.REALTIME_EMIT_TOKEN?.trim();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    await fetch(emitUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...event,
        emittedAt: new Date().toISOString(),
      }),
      cache: "no-store",
    });
  } catch {
    return;
  }
}
