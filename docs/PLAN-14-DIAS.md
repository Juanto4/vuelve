# Plan de 14 días (1–2 h al día)

Objetivo al final del periodo: **1 cliente pagando (149–399 €) + la web desplegada + 50 contactos directos enviados**.

Cada bloque de día está pensado para caber en 90 minutos. Si un día solo puedes con 30 minutos, haz el bloque
"mínimo" y sigue.

---

## Antes del día 1 (30 min, hazlo hoy)

- [ ] Copia `.env.example` a `.env.local` y pon tu número de WhatsApp: `NEXT_PUBLIC_WHATSAPP_NUMBER=34600111222`
- [ ] Crea el proyecto en Supabase, ejecuta `supabase/schema.sql`, pega URL y claves en `.env.local`
- [ ] Crea la cuenta en Supabase y desactiva "Confirm email" (Authentication → Sign In / Providers → Email → Confirm email OFF) para poder entrar al panel sin esperar correos
- [ ] Crea un Stripe Payment Link de 149 € y pégalo en `NEXT_PUBLIC_STRIPE_AUDIT_URL`
- [ ] Despliega en Vercel (ver README). Dominio: `vuelve-...vercel.app` o el que tengas
- [ ] Rellena `/aviso-legal` y `/privacidad` con tus datos reales (obligatorio antes de cobrar)
- [ ] Elige **un solo sector** para las primeras 2 semanas (recomendación: peluquerías/estética o clínicas dentales)

---

## Semana 1 · Validar y preparar

### Día 1 — Prepara el mensaje
- Min. 45: elige sector y rellena la tabla `docs/OUTREACH.md` con 30 negocios reales (nombre, ciudad, Instagram, WhatsApp, nº de reseñas).
- Min. 45: elige las 2 plantillas de DM que vas a usar y personalízalas con el nombre de tu ciudad.

### Día 2 — Construye el sistema
- Min. 60: en el panel (`/panel`), crea la cuenta, entra en "Clientes" e importa 20 clientes de ejemplo (pega un CSV inventado).
- Min. 30: prueba una campaña completa: segmenta "dormidos", previsualiza el mensaje y comprueba que el enlace de WhatsApp se abre con el texto correcto.

### Día 3 — Los primeros 10 contactos
- Min. 90: envía 10 DMs con la variante de tu sector. **Sin\\(m\\)ás.
- Anota en la hoja: negocio, canal, fecha, respuesta.

### Día 4 — Content + seguimiento
- Min. 45: graba un vídeo de 40 s con el móvil: "3 clientes que ya te conocieron y no han vuelto = 300 €/mes que se van". Solo tú y el móvil, sin edición.
- Min. 45: manda 8 DMs más + 2 seguimientos a los que no respondieron.

### Día 5 — Primeros leads
- Min. 30: revisa el panel → si ha entrado algún lead por el formulario, llámalo (guion de 60 s del OUTREACH).
- Min. 60: 10 DMs más con el vídeo adjunto.

### Día 6 — Primeras llamadas
- Min. 90: llama a los 3–4 negocios que han contestado. Objetivo: agendar la llamada de diagnóstico de 15 min.
- Envia el resumen de 1 página (plantilla del punto 6 del OUTREACH) **solo después** de la llamada.

### Día 7 — Cierre de la semana
- Min. 30: cuentas: DMs enviados, respuestas, llamadas, propuestas.
- Min. 60: prepara la propuesta (precio, plazo, garantía) y el PDF de diagnóstico vacío, para rellenar rápido.

**Hito semana 1:** ≥ 40 contactos enviados, ≥ 2 llamadas hechas, ≥ 1 propuesta enviada.

---

## Semana 2 · Cerrar y entregar

### Día 8 — Cambia el mensaje
- Min. 30: revisa qué variante de DM ha tenido mejor respuesta; duplica esa, cambia la otra.
- Min. 60: 10 contactos nuevos.

### Día 9 — Cierra
- Min. 90: llama a los leads calientes que no han pagado. Si dicen "es caro": baja el primer paso al diagnóstico de 149 € y ofrécete a hacerlo con un solo sector de su base (lista de 30).
- Envia el enlace de pago de Stripe en el mensaje, no por teléfono.

### Día 10 — Entrega tu primer diagnóstico (si hay venta)
- Min. 60: pide la lista de clientes (agenda, CSV, foto del libro de citas).
- Min. 30: crea las 4 plantillas en el panel con el nombre del negocio.

### Día 11 — Monta y entrega
- Min. 90: monta el PDF de diagnóstico (estructura en OUTREACH §8), incluido el cálculo con sus números.
- Envíalo. Pide revisión y llamada.

### Día 12 — Venta de la puesta en marcha
- Min. 90: 10 DMs + llamadas de seguimiento.
- Objetivo: convierte el diagnóstico en "puesta en marcha 399 €" (o "diagnóstico + primera campaña 199 €").

### Día 13 — Sistema
- Min. 45: automatiza el seguimiento: programa los 2 follow-ups de todos los contactos del día.
- Min. 45: mide: calcula el coste por hora real de tu tiempo. Si vendes a 200 €/h de trabajo, tu cuenta.

### Día 14 — Decide
- Min. 60: mira los números: ¿cuántos contactos? ¿cuántas llamadas? ¿cuántas ventas? ¿cuánto dinero?
- Min. 30: decide una de estas tres:
  - **A)** el mensaje no funciona → cambia el sector (no el mensaje).
  - **B)** el mensaje funciona pero no cierras → mejora la llamada de 15 min.
  - **C)** cierras → sube el precio del plan gestionado a 179 €/mes y ofrece el anual.

---

## Reglas del plan

1. **1–2 h/día, todos los días.** La constancia gana a los días de 8 h.
2. **Hecho > perfecto.** 10 DMs mediocre hoy > 1 DMs perfecto mañana.
3. **Mide solo 3 cosas**: contactos enviados, llamadas hechas, euros facturados.
4. **El primer cliente se consigue a base de llamadas, no de clicks.** Prospecta en frío.
5. **Cobra por adelantado.** Siempre.
6. Si a los 14 días no has facturado nada: cambia de sector y repite 7 días. El producto no es el problema.

