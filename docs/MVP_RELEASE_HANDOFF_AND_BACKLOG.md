# SushiFrito MVP - Handoff, salida y backlog

Fecha de corte: 2026-06-15

## Estado de salida

SushiFrito quedó migrado desde el proyecto Flutter legacy hacia un monorepo pnpm con:

- App cliente móvil en `apps/mobile` con Expo, React Native, Zustand, TanStack Query y TypeScript.
- KDS web en `apps/web` con Next.js 16 App Router.
- API en Route Handlers Next.js bajo `apps/web/src/app/api`.
- Contratos compartidos en `packages/shared`.
- Schema/migraciones Drizzle + Neon en `packages/db`.
- Servicio realtime Socket.io en `apps/realtime`.
- Panel admin web para productos, precios, puntos de retiro y horarios.

URL productiva inicial:

- Web/KDS: `https://sushifrito.vercel.app/kitchen`
- Admin: `https://sushifrito.vercel.app/admin`
- Health: `https://sushifrito.vercel.app/api/health`

## Alcance implementado

### Mobile cliente

- Flujo inicial con loading + home operativa antes del menú.
- Catálogo con filtros, imágenes, productos destacados y fallback local.
- Personalización de productos con salsas, palitos y selección visual mejorada.
- Carrito persistente con Zustand/AsyncStorage.
- Programación de retiro con horarios y puntos configurables desde backend.
- Checkout MVP con método `debit | junaeb`, sin integración de pago real.
- Pedido activo persistente, seguimiento en tiempo real y polling.
- Historial descriptivo con opción `Pedir de nuevo`.
- QR real de retiro generado desde `orderId` + `pickupCode`.
- Pull-to-refresh nativo en home, catálogo, carrito, retiro, seguimiento e historial.
- Expo dev-client configurado para probar en iPhone físico con backend productivo.

### Web/KDS

- Login real de cocina por sesión HTTP-only.
- Tablero KDS con tarjetas grandes, timers y estados.
- Priorización visual por tiempo: verde, amarillo, rojo/parpadeo.
- Métricas operativas: cola, promedio y pausa por alta demanda.
- Cambio de estado de pedido: `received -> preparing -> frying -> ready -> delivered`.
- Empty/error states operacionales para DB no configurada/no disponible/sin pedidos.
- Polling con TanStack Query y emisión realtime cuando `REALTIME_INTERNAL_URL` está configurado.

### Admin

- Panel para editar productos, precios y disponibilidad.
- Editor de zonas/puntos de retiro.
- Editor de bloques horarios.
- Mutaciones protegidas por sesión/admin.

### Backend/API

- `GET /api/products`
- `POST /api/orders`
- `GET /api/orders/:id`
- `GET /api/orders/history`
- `POST /api/orders/:id/reorder`
- `GET /api/kitchen/orders`
- `PATCH /api/kitchen/orders/:id/status`
- `GET /api/kitchen/summary`
- `POST /api/kitchen/pause`
- `POST /api/devices/push-token`
- Adaptadores legacy `/api/pedidos`, `/api/pedidos/activos`, `/api/pedidos/:id/estado`.

### Datos

- Neon real como fuente de verdad para catálogo, pedidos, cocina, admin y horarios.
- Migración inicial Drizzle forward-only.
- Seed operativo para productos, addons, zonas, bloques y kitchen settings.
- Pedidos QA usados solo para validación y cerrados como terminales.

## Decisiones y restricciones

- El KDS queda como web Next.js, no React Native.
- Vercel aloja web/API/KDS/admin.
- Socket.io queda separado en `apps/realtime`; Vercel Functions no se usan como WebSocket server.
- La app móvil usa cuenta invitada; no hay login de cliente todavía.
- Pago real Junaeb/Transbank queda fuera del MVP: se registra el método seleccionado.
- iOS con Apple ID gratis no soporta Push Notifications capability. Para instalar en iPhone físico local se dejó el plugin nativo de notificaciones desactivado en `apps/mobile/app.json`.
- Push real iOS requiere Apple Developer pagado y reactivar capabilities/plugins en build EAS/Apple.
- `apps/mobile/ios/` y `apps/mobile/android/` quedan ignorados porque son artefactos de prebuild local.

## Verificación ejecutada

Comando final:

```zsh
pnpm check
```

Resultado:

- ESLint sin errores.
- Typecheck en `apps/realtime`, `apps/mobile`, `apps/web`, `packages/db`, `packages/shared`.
- Tests verdes:
  - `packages/shared`: 7 tests.
  - `apps/realtime`: 4 tests.
  - `packages/db`: 2 tests.
  - `apps/mobile`: 21 tests.
  - `apps/web`: 15 tests.
- Build Next.js 16 exitoso para `apps/web`.

Verificación manual reciente:

- App instalada en iPhone físico con dev-client.
- Bundle cargado desde `http://192.168.100.165:8081`.
- Crash nativo por `ExpoFont` corregido alineando `expo-font` a `56.0.6`.
- KDS productivo disponible en `https://sushifrito.vercel.app/kitchen`.

## Deploy

### Vercel

El proyecto está preparado para deploy por Git/Vercel con:

```json
{
  "installCommand": "corepack enable && pnpm install --frozen-lockfile",
  "buildCommand": "pnpm --filter @sushifrito/web build"
}
```

Variables necesarias en Vercel:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `KITCHEN_ADMIN_PASSWORD`
- `KITCHEN_SESSION_SECRET`
- `CUSTOMER_ACCESS_TOKEN_SECRET`
- `ORDER_ACCESS_TOKEN_SECRET`
- `KITCHEN_MUTATION_TOKEN`
- `REALTIME_EMIT_TOKEN`
- `REALTIME_INTERNAL_URL` si realtime interno está activo.

### Mobile

Para Expo Go/dev-client contra producción:

```zsh
cd apps/mobile
EXPO_PUBLIC_API_URL=https://sushifrito.vercel.app pnpm exec expo start --dev-client --host lan --port 8081
```

Para build EAS futura:

```zsh
cd apps/mobile
pnpm dlx eas-cli@latest build --platform ios --profile preview
```

## Riesgos activos

- Push real iOS no queda cerrado sin Apple Developer pagado.
- El realtime productivo requiere desplegar `apps/realtime` y configurar `REALTIME_INTERNAL_URL`/Redis.
- El admin MVP debe recibir hardening de roles antes de uso con más operadores.
- No hay integración de pago real; el flujo registra intención de pago.
- La app móvil aún no tiene distribución TestFlight/App Store.
- Falta monitoreo externo y Sentry configurado para producción.

## Backlog final recomendado

### P0 - Cierre MVP operable

1. Activar Apple Developer pagado.
2. Rehabilitar capability de Push Notifications para iOS y validar token Expo/APNs.
3. Desplegar `apps/realtime` con Redis y configurar URLs productivas.
4. Ejecutar prueba end-to-end real: mobile crea pedido, KDS lo recibe, cocina cambia estados, cliente recibe listo y muestra QR.
5. Definir contraseñas/admins reales y rotación inicial de secretos.

### P1 - Producto

1. Mejorar selector de salsas con cantidades, favoritos y recomendaciones por producto.
2. Agregar sucursales/locales reales: facultades UPLA, centro Valparaíso y puntos estratégicos de oficina.
3. Agregar disponibilidad por punto de retiro y stock por horario.
4. Agregar notificación interna de cocina cuando entra pedido programado 15 minutos antes.
5. Crear flujo de cancelación y edición de pedido antes de preparación.

### P1 - Operación

1. Panel de cierre diario: pedidos, ingresos, tiempos promedio y demanda por punto.
2. Export CSV del historial de pedidos.
3. Auditoría de cambios admin: producto/precio/horario/zona.
4. Roles separados: cocina, admin catálogo, owner.
5. Runbook de incidentes: DB down, Vercel down, cocina pausada, push caído.

### P2 - Comercial

1. Integrar pago real: Transbank/Webpay o proveedor LATAM equivalente.
2. Integrar Junaeb si existe proveedor/flujo formal disponible.
3. Cupones por facultad/empresa.
4. Programa de favoritos y repetición rápida por ubicación.
5. Dashboard de demanda por zona para decidir expansión.

### P2 - Calidad técnica

1. Playwright e2e para KDS/admin.
2. Smoke mobile automatizado con Maestro o Detox cuando exista build estable.
3. Sentry web/mobile/realtime con redaction PII.
4. Rate limiting Redis en mutaciones públicas.
5. SBOM/SCA en CI y revisión de licencias.
