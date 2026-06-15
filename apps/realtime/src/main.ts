import { createRealtimeService } from "./server.js";

const service = await createRealtimeService();

await service.start();
console.info(`@sushifrito/realtime listening on ${service.getUrl()}`);

function shutdown(signal: NodeJS.Signals): void {
  void service
    .stop()
    .then(() => {
      console.info(`@sushifrito/realtime stopped after ${signal}`);
      process.exit(0);
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exit(1);
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
