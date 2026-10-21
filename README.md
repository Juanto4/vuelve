# Vuelve

**Que tus clientes vuelvan. Sin pedírselo.**

Servicio de recuperación de clientes por WhatsApp para peluquerías, clínicas, fisios y talleres en España.
Este repo contiene todo lo necesario para venderlo: la web que convierte, el panel donde entregas el servicio y
medir el dinero recuperado, y el kit de prospección.

> El código no factura. **Tú facturas** contactingando a 10 negocios al día. Todo lo que hay aquí está pensado
> para que dediques 1–2 h/día a vender, no a programar.

---

## Qué incluye

| Pieza | Ruta | Para qué |
|---|---|---|
| Landing con calculadora de dinero perdido | `/` | Que el visitante vea su número y pida el diagnóstico |
| Formulario de leads | `/` → sección Contacto | Entra al panel (`/panel` → Leads) |
| Panel de trabajo | `/panel` | Leads, clientes, campañas con plantillas, métricas de dinero recuperado |
| **Diagnóstico PDF** | `/panel` → pestaña Diagnóstico | El informe de 149 € listo para entregar: portada, números, lista de dormidos, plantillas y plan. `Guardar como PDF` |
| Ejemplo del informe | `/demo/diagnostico` | Ver (e imprimir) un informe completo con datos inventados, sin configurar nada |
| Acceso al panel | `/entrar` | Email + contraseña (Supabase Auth) |
| Páginas legales | `/aviso-legal`, `/privacidad` | **Placeholders**: rellénalos antes de cobrar |
| Kit de prospección | `docs/OUTREACH.md` | Mensajes, guiones de llamada, estructura del PDF de diagnóstico |
| Plan de 14 días | `docs/PLAN-14-DIAS.md` | Qué hacer cada día con 1–2 h |

---

## Arranque local

Requisitos: Node 20+ y una cuenta gratuita en [supabase.com](https://supabase.com).

```bash
npm install
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
```

Crea la base de datos:

1. Supabase → **SQL Editor** → New query → pega `supabase/schema.sql` → **Run**.
2. Supabase → **Authentication → Sign In / Providers → Email** → desactiva *Confirm email* (para entrar al panel sin esperar correos).
3. Supabase → **Project Settings → API** → copia las claves en `.env.local`.

Arranca:

```bash
npm run dev     # http://localhost:3000
```

---

## Despliegue en Vercel (10 minutos)

1. Sube el repo a GitHub.
2. En [vercel.com](https://vercel.com) → **Add New → Project** → importa el repo (Vercel detecta Next.js).
3. En **Settings → Environment Variables**, añade todas las variables de `.env.example` con sus valores.
4. **Deploy**. La web está viva en `https://tu-proyecto.vercel.app`.
5. Conecta tu dominio (Settings → Domains) si tienes uno.
6. Crea el enlace de pago en Stripe (**Payment Links → 149 EUR**) y ponlo en `NEXT_PUBLIC_STRIPE_AUDIT_URL`.
   Tras cambiar variables de entorno, haz **Redeploy** en Vercel.

---

## Variables de entorno

| Variable | Obligatoria | Para qué |
|---|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Recomendada | Botón de WhatsApp de la landing. Sin ella, el formulario sigue funcionando |
| `NEXT_PUBLIC_BASE_URL` | No | URL pública (para compartir enlaces) |
| `NEXT_PUBLIC_STRIPE_AUDIT_URL` | No (sí para cobrar) | Payment Link de 149 € |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Para el panel | Login y datos |
| `SUPABASE_SERVICE_ROLE_KEY` | Para guardar leads | Solo servidor. **Nunca en el navegador** |

Si no hay Supabase configurado, la web funciona igual: el formulario responde "te escribo por WhatsApp" y el panel
explica los pasos de configuración.

---

## Cómo se usa el panel

- **Cliente** (selector superior): cada espacio de trabajo es un cliente del servicio (una peluquería, una clínica).
  Se crea con «+ Nuevo cliente» o desde un lead con el botón «→ espacio». Todo lo de abajo se filtra por cliente.
- **Leads**: los que entran por el formulario + los que añades a mano. Estados: nuevo → contactado → propuesta → cerrado.
- **Clientes**: la base de clientes de ese negocio. Añade uno a uno o pega un CSV (`Nombre, Teléfono, dd/mm/aaaa, Ticket`).
  Filtra por **dormidos (90+ días)** para ver a quién reactivar.
- **Campañas**: eliges sector, plantilla, fecha y segmento; previsualizas el mensaje con los datos de cada cliente
  y abres WhatsApp con el texto ya escrito (enlaces `wa.me`, sin coste ni aprobación de API).
- **Diagnóstico PDF**: el informe que entregas por 149 €. Calcula el dinero que el cliente pierde al mes
  (ausencias + reactivables), lista hasta 50 clientes dormidos con teléfono, las 4 plantillas adaptadas a su
  sector y el plan con precios y garantía. Botón **«Guardar como PDF / Imprimir»** → en el diálogo, «Guardar como PDF».
  La cabecera, los botones y los formularios llevan `no-print`, así que al imprimir sale solo el informe, en A4.
- **Métricas**: clientes, dormidos, mensajes enviados, citas y **dinero recuperado**, con el ROI frente a los 129 €/mes.

Los mensajes se generan con enlaces `wa.me`: no necesitas la API de WhatsApp ni aprobación de plantillas para empezar.
Cuando superes ~50 conversaciones al día, migra a la API oficial.

### Flujo completo de un cliente (el que te da dinero)

```
Lead (web o DM)  →  "→ espacio"  →  Clientes: importar su lista (CSV)  →  Diagnóstico PDF  →  cobrar 149 €
                                                                        →  Puesta en marcha 399 €
                                                                        →  Plan gestionado 129 €/mes
```

---

## Antes de cobrar a tu primer cliente

- [ ] Rellena `/aviso-legal` y `/privacidad` con tus datos reales (NIF, domicilio, email) — la AEPD lo exige.
- [ ] Crea el Payment Link de 149 € en Stripe y ponlo en `NEXT_PUBLIC_STRIPE_AUDIT_URL`.
- [ ] Ten un método de pago alternativo (Bizum/transferencia) para quien no quiera tarjeta.
- [ ] Ten claro tu IVA (21 % en servicios de consultoría/marketing) y fala con tu gestoría.
- [ ] Prepara la base legal de los envíos: relación previa con el cliente (interés legítimo) o consentimiento, y
      línea de baja en todos los mensajes (ya viene incluida en las plantillas).

---

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (Postgres + Auth + RLS) · Vercel.
Sin dependencias de pago: todo funciona con planes gratuitos hasta que factures.

## Comandos

```bash
npm run dev     # desarrollo
npm run build   # build de producción (comprobado: OK)
npm run start   # servir el build
```
