# Plan de 14 días (1–2 h al día)

Objetivo al final del periodo: **1 cliente pagando (199–900 €) + la web desplegada + 50 contactos directos enviados**.

Cada bloque de día está pensado para caber en 90 minutos. Si un día solo puedes con 30 minutos, haz el bloque
"mínimo" y sigue.

**Nicho: instaladores y energía** (calderas, ACS, climatización, solar). No sales de ahí durante 14 días.

---

## Antes del día 1 (30 min, hazlo hoy)

- [ ] Copia `.env.example` a `.env.local` y pon tu número de WhatsApp: `NEXT_PUBLIC_WHATSAPP_NUMBER=34600111222`
- [ ] Crea el proyecto en Supabase, ejecuta `supabase/schema.sql`, pega URL y claves en `.env.local`
- [ ] Crea la cuenta en Supabase y desactiva "Confirm email" (Authentication → Sign In / Providers → Email → Confirm email OFF) para poder entrar al panel sin esperar correos
- [ ] Crea un Stripe Payment Link de 199 € y pégalo en `NEXT_PUBLIC_STRIPE_AUDIT_URL`
- [ ] Despliega en Vercel (ver README). Dominio: `vuelve-...vercel.app` o el que tengas
- [ ] Rellena `/aviso-legal` y `/privacidad` con tus datos reales (obligatorio antes de cobrar)
- [ ] Prepara la hoja de prospección con 30 instaladores reales de tu ciudad (nombre, WhatsApp, nº de reseñas, última reseña)
- [ ] **(Opcional pero recomendado)** crea una cuenta de Meta Business y un número de prueba: así teaches el
      motor con tu propio número antes de tocar el de un cliente. 30 min, guía en `docs/MOTOR-WHATSAPP.md`.

---

## Semana 1 · Validar y preparar

### Día 1 — Prepara el mensaje
- Min. 45: rellena la tabla `docs/OUTREACH.md` con 30 instaladores reales (nombre, ciudad, WhatsApp, nº de reseñas).
- Min. 45: elige las 2 plantillas de DM del §3 de OUTREACH y personalízalas con el nombre de tu ciudad.

### Día 2 — Monta el sistema
- Min. 60: en el panel (`/panel`), crea el espacio de trabajo «demo» y entra en "Clientes": importa 20 clientes
  inventados (pega un CSV `Nombre, Teléfono, dd/mm/aaaa, Ticket` con tickets de 500–3.000 €).
- Min. 30: pestaña "Motor WhatsApp": guarda un Phone Number ID y un token de prueba, y lanza un **mensaje de
  prueba** a tu móvil. Si llega, el motor funciona.

### Día 3 — Los primeros 10 contactos
- Min. 90: envía 10 DMs con la variante de tu sector. **Sin más.**
- Anota en la hoja: negocio, canal, fecha, respuesta.

### Día 4 — Content + seguimiento
- Min. 45: graba un vídeo de 40 s con el móvil: "3 clientes que no te llaman desde hace 2 años = 2.400 €/mes que se van". Solo tú y el móvil, sin edición.
- Min. 45: manda 8 DMs más + 2 seguimientos a los que no respondieron.

### Día 5 — Primeros leads
- Min. 30: revisa el panel → si ha entrado algún lead por el formulario, llámalo (guion de 60 s del OUTREACH).
- Min. 60: 10 DMs más con el vídeo adjunto.

### Día 6 — Primeras llamadas
- Min. 90: llama a los 3–4 negocios que han contestado. Objetivo: agendar la llamada de diagnóstico de 15 min.
- Envia el resumen de 1 página (plantilla del §5 del OUTREACH) **solo después** de la llamada.

### Día 7 — Cierre de la semana
- Min. 30: cuentas: DMs enviados, respuestas, llamadas, propuestas.
- Min. 60: prepara la propuesta (199 / 900 / 299 €/mes, garantía) y el PDF de auditoría vacío, para rellenar rápido.

**Hito semana 1:** ≥ 40 contactos enviados, ≥ 2 llamadas hechas, ≥ 1 propuesta enviada.

---

## Semana 2 · Cerrar y entregar

### Día 8 — Cambia el mensaje
- Min. 30: revisa qué variante de DM ha tenido mejor respuesta; duplica esa, cambia la otra.
- Min. 60: 10 contactos nuevos.

### Día 9 — Cierra
- Min. 90: llama a los leads calientes que no han pagado. Si dicen "es caro": baja el primer paso a la
  **auditoría de 199 €** y ofrécete a hacerla con un solo segmento de su base (los 30 clientes más recientes).
- Envia el enlace de pago de Stripe en el mensaje, no por teléfono.

### Día 10 — Recoge los datos del cliente (si hay venta)
- Min. 60: pide su lista de clientes (Excel, export del facturador o foto del libro de trabajo).
- Min. 30: crea las plantillas en el panel (pestaña "Motor WhatsApp" → Paso 2) con el nombre del negocio.

### Día 11 — Monta y entrega la auditoría
- Min. 90: monta el PDF (estructura en OUTREACH §8), incluido el cálculo con sus números.
- Envíalo. Pide revisión y llamada.

### Día 12 — Venta de la instalación
- Min. 90: 10 DMs + llamadas de seguimiento.
- Objetivo: convierte la auditoría en "instalación 900 €" (o "auditoría + primera campaña").
- Recuerda: los 199 € de la auditoría se descuentan de la instalación.

### Día 13 — Sistema
- Min. 45: automatiza el seguimiento: programa los 2 follow-ups de todos los contactos del día.
- Min. 45: mide: calcula el coste por hora real de tu tiempo. Si vendes a 200 €/h de trabajo, tu cuenta.

### Día 14 — Decide
- Min. 60: mira los números: ¿cuántos contactos? ¿cuántas llamadas? ¿cuántas ventas? ¿cuánto dinero?
- Min. 30: decide una de estas tres:
  - **A)** el mensaje no funciona → cambia el mensaje, no el nicho (el nicho aguanta 2 semanas mínimo).
  - **B)** el mensaje funciona pero no cierras → mejora la llamada de 15 min.
  - **C)** cierras → sube la gestión a 349 €/mes y ofrece el anual (3.348 €/año).

---

## Reglas del plan

1. **1–2 h/día, todos los días.** La constancia gana a los días de 8 h.
2. **Hecho > perfecto.** 10 DMs mediocres hoy > 1 DM perfecto mañana.
3. **Mide solo 3 cosas**: contactos enviados, llamadas hechas, euros facturados.
4. **El primer cliente se consigue a base de llamadas, no de clicks.** Prospecta en frío.
5. **Cobra por adelantado.** Siempre.
6. **A la hora de responder, responde**: en este nicho, escribir a un instalador sobre su base de clientes es
   un favor, no un spam. No mandes blasts.
7. Si a los 14 días no has facturado nada: cambia de mensaje y repite 7 días. Si a los 30 días sigues sin
   facturación, cambia de nicho o pivota a servicios de automatizaciones para pymes (800–1.500 €/proyecto).
