# SushiFrito React Native Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Flutter prototype and Express API with a working React Native MVP, Next.js KDS/API, Drizzle/Postgres contracts and Socket.io realtime.

**Architecture:** A pnpm monorepo isolates mobile, web, realtime, shared contracts and DB code. The web app hosts HTTP APIs and KDS, while `apps/realtime` owns persistent sockets.

**Tech Stack:** Expo React Native, Next.js 16, React 19.2, TypeScript strict, Zod 4, Drizzle ORM, Neon Postgres, Socket.io, Vitest, pnpm.

---

## Tasks

- [ ] Clean repository artifacts and remove committed secrets/build outputs.
- [ ] Add pnpm workspace, strict TypeScript, lint/test/build scripts and CI.
- [ ] Implement shared contracts, DB schema, migrations and repository functions.
- [ ] Implement Next.js Route Handlers, legacy adapters and KDS web UI.
- [ ] Implement Expo customer app, cart, tracking, history and notifications.
- [ ] Implement Socket.io realtime service and event emit endpoint.
- [ ] Install dependencies, run lint/typecheck/test/build and verify health/KDS locally.

## Acceptance

- `POST /api/orders` validates payloads and returns HTTP 201 with `orderId`, `orderNumber` and status.
- KDS shows active visible orders without manual refresh and supports status changes.
- Customer tracking updates from realtime events and shows the four required steps.
- Scheduled orders are hidden until 15 minutes before their block.
- Repeat order deep-copies items into the current cart.
- No `.env`, `node_modules`, Flutter build output or npm lockfile remains tracked.
