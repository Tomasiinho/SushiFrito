# SushiFrito

MVP completo para pedidos de sushi en Valparaiso: app cliente React Native, panel de cocina web y backend tipado.

## Stack

- `apps/mobile`: Expo + React Native + TypeScript.
- `apps/web`: Next.js 16 App Router, KDS y Route Handlers.
- `apps/realtime`: Socket.io para eventos de cocina y seguimiento.
- `packages/shared`: contratos Zod, tipos y utilidades compartidas.
- `packages/db`: Drizzle ORM, schema y migraciones forward-only.

## Setup local

```zsh
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

`DATABASE_URL` debe apuntar a Neon para que `/api/health`, catálogo, pedidos y KDS lean datos reales. El loader local revisa `.env.local` en la raiz y `apps/web/.env.local`; sin esa variable, el web server levanta igual, pero las APIs de datos responden readiness `503`.

## Comandos

```zsh
pnpm dev:web
pnpm dev:mobile
pnpm dev:realtime
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm db:generate
pnpm db:migrate
```

## Variables principales

- `DATABASE_URL`: conexión Neon/PostgreSQL.
- `BETTER_AUTH_SECRET`: secreto de Better Auth, mínimo 32 caracteres.
- `REALTIME_EMIT_TOKEN`: token interno para que `apps/web` emita eventos a `apps/realtime`.
- `KITCHEN_MUTATION_TOKEN`: token server-side para mutaciones KDS en producción.
- `CUSTOMER_ACCESS_TOKEN_SECRET`: secreto HMAC para crear pedidos e historial de invitado; si falta, web usa `ORDER_ACCESS_TOKEN_SECRET`/`KITCHEN_SESSION_SECRET`/`BETTER_AUTH_SECRET`.
- `ORDER_ACCESS_TOKEN_SECRET`: secreto HMAC para seguimiento privado de pedidos; si falta, web usa `KITCHEN_SESSION_SECRET`/`BETTER_AUTH_SECRET`.
- `NEXT_PUBLIC_API_URL` / `EXPO_PUBLIC_API_URL`: base URL del backend.
- `NEXT_PUBLIC_REALTIME_URL` / `EXPO_PUBLIC_REALTIME_URL`: URL pública Socket.io.
- `EXPO_PUBLIC_EAS_PROJECT_ID`: UUID real del proyecto EAS; requerido para push real en iPhone.

## Deploy MVP

Web/API esta configurado para Vercel con root `apps/web`. El deploy manual productivo probado usa:

```zsh
vercel deploy --prod --yes
```

La app movil puede probarse con Expo Go apuntando a produccion:

```zsh
EXPO_PUBLIC_API_URL=https://sushifrito.vercel.app pnpm --filter @sushifrito/mobile dev -- --tunnel
```

Push real no se valida en Expo Go. Para una build instalable:

```zsh
cd apps/mobile
pnpm dlx eas-cli@latest login
pnpm dlx eas-cli@latest init
pnpm dlx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_API_URL --value https://sushifrito.vercel.app
pnpm dlx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_EAS_PROJECT_ID --value <uuid-real-eas-project>
pnpm dlx eas-cli@latest build --platform ios --profile preview
```

## Seguridad operativa

El remoto anterior contenia `.env`, `node_modules`, `build` y `package-lock.json`. El valor de `DATABASE_URL` debe rotarse en Neon antes de usar este MVP en produccion.
