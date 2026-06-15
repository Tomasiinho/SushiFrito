import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

import type { RealtimeSocketServer } from "./socket-types.js";

export type RealtimeAdapterMode = "memory" | "redis";

export interface RealtimeAdapterConnection {
  close: () => Promise<void>;
  mode: RealtimeAdapterMode;
}

const memoryAdapterConnection: RealtimeAdapterConnection = {
  close: async (): Promise<void> => {},
  mode: "memory"
};

export async function configureRealtimeAdapter(
  io: RealtimeSocketServer,
  redisUrl: string | undefined,
  nodeEnv: string | undefined
): Promise<RealtimeAdapterConnection> {
  if (redisUrl === undefined || redisUrl.length === 0) {
    return memoryAdapterConnection;
  }

  const publishClient = createClient({ url: redisUrl });
  const subscribeClient = publishClient.duplicate();

  try {
    await Promise.all([publishClient.connect(), subscribeClient.connect()]);
    io.adapter(createAdapter(publishClient, subscribeClient));

    return {
      close: async (): Promise<void> => {
        await Promise.all([publishClient.close(), subscribeClient.close()]);
      },
      mode: "redis"
    };
  } catch (error) {
    await Promise.all([
      closeRedisClient(publishClient),
      closeRedisClient(subscribeClient)
    ]);

    if (nodeEnv === "production") {
      throw new Error("REDIS_URL is configured but Redis adapter failed", {
        cause: error
      });
    }

    return memoryAdapterConnection;
  }
}

async function closeRedisClient(client: {
  close: () => Promise<unknown>;
}): Promise<void> {
  try {
    await client.close();
  } catch {
    // The client may never have connected. Startup fallback handles that path.
  }
}
