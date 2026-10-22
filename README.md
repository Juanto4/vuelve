# Vuelve

**Que tus clientes vuelvan. Sin pedírselo.**

Servicio de recuperación de clientes por WhatsApp para **instaladores, calderas, climatización y energía solar**
en España. Este repo contiene todo lo necesario para venderlo: la web que convierte, el panel donde entregas el
servicio y mides el dinero recuperado, el motor de WhatsApp con la API oficial y el kit de prospección.

> El código no factura. **Tú facturas** contactingando a 10 negocios al día. Todo lo que hay aquí está pensado
> para que dediques 1–2 h/día a vender, no a programar.

---

## Qué incluye

| Pieza | Ruta | Para qué |
|---|---|---|
| Landing con calculadora de dinero perdido | `/` | Que el visitante vea su número y pida la auditoría |
| Formulario de leads | `/` → sección Contacto | Entra al panel (`/panel` → Leads) |
| Panel de trabajo | `/panel` | Leads, clientes, campañas, métricas de dinero recuperado |
| **Motor de WhatsApp** | `/panel` → pestaña *Motor WhatsApp* | Credenciales por cliente, plantillas aprobadas de Meta, envío real por la API, límite diario y consentimiento |
| **Diagnóstico PDF** | `/panel` → pestaña *Diagnóstico PDF* | El informe de 199 € listo para entregar: portada, números, lista de dormidos, plantillas y plan. `Guardar como PDF` |
| Ejemplo del informe | `/demo/diagnostico` | Ver (e imprimir) un informe completo con datos inventados, sin configurar nada |
| Flujos de n8n | `public/n8n/*.json` | Reactivación mensual, recordatorio de cita y petición de reseña, importables |
| Acceso al panel | `/entrar` | Email + contraseña (Supabase Auth) |
| Páginas legales | `/aviso-legal`, `/privacidad` | **Placeholders**: rellénalos antes de cobrar |
| Guía del motor | `docs/MOTOR-WHATSAPP.md` | Setup de Meta, aprobación de plantillas, costes, límites, RGPD |
| Kit de prospección | `docs/OUTREACH.md` | Mensajes, guiones de llamada, estructura del PDF de auditoría |
| Plan de 14 días | `docs/PLAN-14-DIAS.md` | Qué hacer cada día con 1–2 h |

---

## Los precios (los mismos que el mercado, con más producto)

| Plan | Precio | Qué incluye |
|---|---|---|
| **Auditoría** | 199 € (se descuenta de la instalación) | Informe de 3 páginas, lista de dormidos, plantillas, cálculo de dinero perdido |
| **Instalación** | 900 € | API de WhatsApp Business con sus credenciales, consentimiento, campañas montadas, flujo n8n, formación |
| **Gestión** | 299 €/mes | Campañas cada mes, 300 conversaciones, informe mensual, garantía de 30 días |

---

## Arranque local

Requisitos: Node 20+ y una cuenta (gratuita) en [supabase.com](https://supabase.com).

```bash
npm install
```

### Opción A · Todo automático (recomendada)

El script crea la organización, el proyecto, aplica el esquema y te deja las claves en `.env.local`:

```bash
# 1. Genera un token en https://supabase.com/dashboard/account/tokens
# 2. Guárdalo en .env.local como SUPABASE_ACCESS_TOKEN=sbp_xxx  (o pásalo por entorno)
# 3.
npm run supabase:setup
```

Es **idempotente**: puedes volver a lanzarlo cuando actualices `supabase/schema.sql` sin romper nada.
El proyecto se crea en `eu-central-1` (la región más cercana a España) y la autenticación por email
queda con confirmación automática para poder entrar al panel sin esperas.

### Opción B · A mano

```bash
cp .env.example .env.local     # Windows: copy .env.example .env.local
```

Rellena `.env.local`:

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=34600111222
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_AUDIT_URL=https://buy.stripe.com/xxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_TOKEN=...
CRON_SECRET=...
```

Crea la base de datos:

1. Supabase → **SQL Editor** → New query → pega `supabase/schema.sql` → **Run**.
   (El archivo es idempotente: puedes volver a ejecutarlo cuando actualices el esquema.)
2. Supabase → **Authentication → Sign In / Providers → Email** → desactiva *Confirm email* (para entrar al panel sin esperar correos).
3. Supabase → **Project Settings → API** → copia las claves en `.env.local`.

Arranca:

```bash
npm run dev     # http://localhost:3000
```

Entra en `/entrar`, crea la cuenta (la primera vez) y ya tienes panel.

---

## Despliegue en Vercel (10 minutos)

1. Sube el repo a GitHub.
2. En [vercel.com](https://vercel.com) → **Add New → Project** → importa el repo (Vercel detecta Next.js).
3. En **Settings → Environment Variables**, añade todas las variables de `.env.example` con sus valores.
4. **Deploy**. La web está viva en `https://tu-proyecto.vercel.app`.
5. Conecta tu dominio (Settings → Domains) si tienes uno.
6. Crea el enlace de pago en Stripe (**Payment Links → 199 EUR**) y ponlo en `NEXT_PUBLIC_STRIPE_AUDIT_URL`.
   Tras cambiar variables de entorno, haz **Redeploy** en Vercel.
7. `vercel.json` ya incluye un cron (día 1 de cada mes a las 09:00) que llama a `/api/whatsapp/cron`.
   Vercel manda `Authorization: Bearer <CRON_SECRET>`: define `CRON_SECRET` en el panel de Vercel.

---

## Variables de entorno

| Variable | Obligatoria | Para qué |
|---|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Recomendada | Botón de WhatsApp de la landing. Sin ella, el formulario sigue funcionando |
| `NEXT_PUBLIC_BASE_URL` | No | URL pública (para compartir enlaces) |
| `NEXT_PUBLIC_STRIPE_AUDIT_URL` | No (sí para cobrar) | Payment Link de 199 € |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Para el panel | Login y datos |
| `SUPABASE_SERVICE_ROLE_KEY` | Para guardar leads | Solo servidor. **Nunca en el navegador** |
| `WHATSAPP_PHONE_NUMBER_ID` | No | Respaldo: tu propio número para pruebas. Lo normal es configurarlo por cliente en el panel |
| `WHATSAPP_TOKEN` | No | Respaldo: token de tu cuenta. Lo normal es configurarlo por cliente en el panel |
| `CRON_SECRET` | Para campañas automáticas | Protege `/api/whatsapp/cron` |

Si no hay Supabase configurado, la web funciona igual: el formulario responde "te escribo por WhatsApp" y el panel
explica los pasos de configuración.

---

## Cómo se usa el panel

- **Cliente** (selector superior): cada espacio de trabajo es un cliente del servicio (una empresa de calderas, una
  clínica). Se crea con «+ Nuevo cliente» o desde un lead con el botón «→ espacio». Todo lo de abajo se filtra por cliente.
- **Leads**: los que entran por el formulario + los que añades a mano. Estados: nuevo → contactado → propuesta → cerrado.
- **Clientes**: la base de clientes de ese negocio. Añade uno a uno o pega un CSV (`Nombre, Teléfono, dd/mm/aaaa, Ticket`).
  Filtra por **dormidos (180+ días)**: en instalación el ciclo es largo, antes de escribir a alguien hay que tener margen.
- **Campañas**: vista previa de los mensajes y enlaces `wa.me` para empezar sin API (o para lo puntual).
- **Motor WhatsApp**: el envío real. Credenciales del cliente (phone number ID + token, que nunca se vuelven a
  mostrar), plantillas de Meta listas para copiar, envío de campañas con límite diario y registro de consentimiento.
- **Diagnóstico PDF**: el informe que entregas por 199 €. Calcula el dinero que el cliente pierde al mes, lista
  hasta 50 clientes dormidos con teléfono, las plantillas adaptadas a su sector y el plan con precios y garantía.
  Botón **«Guardar como PDF / Imprimir»** → en el diálogo, «Guardar como PDF».
- **Métricas**: clientes, dormidos, mensajes enviados, trabajos y **dinero recuperado**, con el ROI frente a los 299 €/mes.

### Motor de WhatsApp en 4 pasos

1. **Credenciales**: pega el Phone Number ID y el token permanente del cliente (los genera él en su cuenta de Meta).
2. **Plantillas**: copia el cuerpo exacto al gestor de plantillas de Meta y espera la aprobación (minutos).
3. **Campaña**: elige plantilla y segmento, **simula** primero y luego envía. El motor respeta el límite diario
   (80 por defecto), salta a quien no tiene consentimiento y registra cada envío.
4. **n8n** (opcional): descarga el flujo y deja que la campaña corra sola en la infraestructura del cliente.

Todo el detalle, con costes y errores de la API, en [`docs/MOTOR-WHATSAPP.md`](docs/MOTOR-WHATSAPP.md).

### Flujo completo de un cliente (el que te da dinero)

```
Lead (web o DM)  →  "→ espacio"  →  Clientes: importar su lista (CSV)  →  Diagnóstico PDF  →  cobrar 199 €
                                                                        →  Instalación 900 €
                                                                        →  Gestión 299 €/mes
```

---

## Antes de cobrar a tu primer cliente

- [ ] Rellena `/aviso-legal` y `/privacidad` con tus datos reales (NIF, domicilio, email) — la AEPD lo exige.
- [ ] Crea el Payment Link de 199 € en Stripe y ponlo en `NEXT_PUBLIC_STRIPE_AUDIT_URL`.
- [ ] Ten un método de pago alternativo (Bizum/transferencia) para quien no quiera tarjeta.
- [ ] Ten claro tu IVA (21 % en servicios de consultoría/marketing) y fala con tu gestoría.
- [ ] Prepara la base legal de los envíos: plantillas aprobadas por Meta, consentimiento registrado en el panel
      y línea de baja en todos los mensajes (ya viene incluida en las plantillas).

---

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (Postgres + Auth + RLS) · Vercel ·
WhatsApp Business Cloud API · n8n (flujos opcionales).
Sin dependencias de pago: todo funciona con planes gratuitos hasta que factures.

## Comandos

```bash
npm run dev              # desarrollo
npm run build            # build de producción (comprobado: OK)
npm run start            # servir el build
npm run supabase:setup   # crear proyecto + esquema + claves (idempotente)
```
