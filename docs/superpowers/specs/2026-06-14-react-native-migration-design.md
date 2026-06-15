# SushiFrito React Native Migration Design

## Summary

SushiFrito migrates from a small Flutter prototype plus Express API to a pnpm monorepo with a React Native customer app, a Next.js kitchen display system, typed API contracts, Drizzle/Postgres persistence and a separate Socket.io realtime service.

The MVP covers UT1571-UT1579: order registration, KDS display, realtime status changes, KDS visual priority, ready push notification, customer tracking, scheduled orders, repeat order and kitchen dashboard metrics.

## Architecture

- `apps/mobile` is the customer Expo app. It owns catalog, cart, scheduled order controls, tracking, history and push token registration.
- `apps/web` is the Next.js 16 app. It owns Route Handlers, the web KDS and the health check.
- `apps/realtime` is a Socket.io service for events that Vercel Functions cannot host as persistent WebSockets.
- `packages/shared` owns Zod schemas, DTOs and domain helpers used by all apps.
- `packages/db` owns Drizzle schema, migrations and repository functions.

## Domain Rules

- Canonical order states are `received`, `preparing`, `frying`, `ready`, `delivered`, `cancelled`.
- Payment methods for MVP are `junaeb` and `debit`; no real payment processor is integrated yet.
- Scheduled orders remain hidden from KDS until 15 minutes before the selected block.
- KDS priority colors are green under 7 minutes, yellow from 7 to 12 minutes and blinking red after 12 minutes.
- Push notification text for ready orders is fixed: `¡Tu SushiFrito está crujiente y listo para retiro!`.

## Security And Compatibility

- The previous committed `.env` is removed and `DATABASE_URL` must be rotated in Neon.
- Legacy `/api/pedidos` endpoints stay for one release as adapters over the new typed API.
- Database migrations are forward-only; destructive cleanup is deferred.
- Server modules that read secrets stay in server-only boundaries.
