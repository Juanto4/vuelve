# Vuelve — kit de prospección

Este es el documento más importante del proyecto. **El código no factura: tú facturas.**
Todo lo que hay aquí está escrito para copiar, pegar y enviar.

**Nicho: instaladores y energía** (calderas, ACS, aire acondicionado, solar, fontanería).
**Precio: auditoría 199 € · instalación 900 € · gestión 299 €/mes.**

Objetivo: 10 contactos directos al día → 2 llamadas → 1 propuesta → 1 venta (199–900 €).

> Por qué este nicho: las agencias de marketing atacan peluquerías y clínicas. En instalación hay menos
> competencia, el ticket es de 500 € a 3.000 € y **un solo cliente recuperado paga el mes**. Además el
> cliente tiene una base de clientes enorme (cada instalación es una obra que dura 10 años) y casi nadie
> le escribe después.

---

## 0. Tus enlaces (copia y pega)

| Qué | Enlace | Para qué |
|---|---|---|
| La web | `https://vuelve-pink.vercel.app` | Mandarlo solo si te lo piden |
| **Informe de ejemplo** | `https://vuelve-pink.vercel.app/demo/diagnostico` | **El mejor argumento de venta**: es un informe real de 3 páginas con sus datos. Se abre y se impressiona |
| Calculadora de dinero perdido | `https://vuelve-pink.vercel.app/#calculadora` | Para que el cliente mueva sus números y vea el euro |
| Pago de la auditoría (199 €) | *pendiente: Stripe* | Enlace de pago tras crearlo |

> Regla: **el primer mensaje NO lleva enlace** (parece spam). El enlace va en el **segundo** mensaje o en el email,
> cuando ya te han contestado. El informe de ejemplo es el que convence.

---

## 1. Tu oferta en una frase

> "Recupero por WhatsApp los clientes a los que les instalaste una caldera, un aire acondicionado o una placa
> solar y no han vuelto. Sin que tengas que hacer nada: tú atiendes las respuestas."

Si te preguntan "¿y esto en qué se diferencia de un CRM?":

> "Un CRM te guarda los datos. Yo te los hago trabajar: escribo por WhatsApp (con la API oficial de Meta, con
> plantillas aprobadas) a los clientes que no vuelven y a los que tienen una revisión pendiente, con tu tono,
> y te digo cuánto dinero has recuperado."

Si te preguntan "¿por qué WhatsApp y no un email o un SMS?":

> "Porque te contestan. Un email a un instalador lo lee nadie; un WhatsApp lo lee el 80 % de las veces. Y como
> usa la API oficial, no te pueden banear el número por escribir en masa."

---

## 2. Dónde encuentras a los clientes (5 minutos)

**Ya tienes la lista hecha en [`PROSPECTOS.md`](PROSPECTOS.md)**: 169 empresas de calderas, climatización, solar y
fontanería con el teléfono enlazado a WhatsApp, ordenadas por prioridad (empieza por la Fase 1, #1 hacia abajo).
Cuando la agotes, el mismo sistema:

Apunta en una hoja: `negocio | ciudad | WhatsApp | nº de reseñas | última reseña | nº de empleados`.

| Búsqueda | Dónde |
|---|---|
| Google Maps | "instalador de calderas [ciudad]", "servicio de aire acondicionado [ciudad]", "placas solares [ciudad]" |
| Directorios del sector | Gasistas, instaladores de ACS, climatización y asociaciones de instaladores de tu comunidad autónoma |
| Barrios y pueblos | Google Maps: "fontanería [barrio]", "calderas [barrio]" |
| Comunidades | Administradores de fincas (tienen una cola de clientes cada año) |
| Reformas | Constructoras y reformistas que derivan trabajos |
| Google Ads | La competencia que ya paga (es dinero que ya está en el sector) |

**Señales de que un negocio necesita esto (úsalas en el mensaje):**
- Última reseña de hace 6+ meses → no están ganando clientes nuevos, pero **tienen una base grande**.
- "Presupuesto cerrado" / "Aceptamos nuevos clientes" en su web → están activos.
- Tienen 50+ reseñas → base de clientes grande → mucho dinero dormido.
- Ofrecen mantenimiento anual pero no avisan a nadie → es exactamente tu servicio.

---

## 3. Mensajes directos (Instagram / Facebook / WhatsApp)

### Variante calderas / ACS

> ¡Hola! Vi que trabajáis calderas y ACS en [ciudad] 👏
> Una pregunta rápida: de los clientes a los que les instalasteis una caldera hace un año o dos, ¿cuántos ya
> os han vuelto a llamar para la revisión o para otro trabajo?
> Es que ese dinero está dormido en vuestra base, y hay formas de recuperarlo por WhatsApp sin parecer spam
> ni perder tiempo. ¿Te lo explico en 30 segundos?

### Variante climatización / solar

> ¡Hola! ¿Cómo estáis?
> Una duda: ¿tenéis controlado cuántos clientes de los que instalasteis hace 2 años siguen con el equipo
> funcionando y no os han vuelto a llamar?
> En climatización y solar eso suele ser un 40–50 % de la base, y son trabajos de 500 a 3.000 €. Si te interesa
> te paso cómo se recupera esa gente por WhatsApp.

### Variante fontanería / pequeñas instalaciones

> ¡Hola! Vi vuestro trabajo de [fontanería/obras] por [barrio] 👏
> ¿Lleváis un registro de los clientes a los que les toca mantenimiento o revisión?
> Mucho cliente vuelve solo por recordatorio, y los que no vuelven dejan de factar. ¿Te lo explico?

### Follow-up 1 (2 días después, sin respuesta)

> ¡Hola! Te escribo por lo de los clientes que no os vuelven. Si no es el momento, dime y no te insisto más 🙂

### Follow-up 2 (5 días después) — **el último**

> ¡Hola! Último mensaje, prometido 🙂 Con 3 clientes que llevan un año sin llamar te puedo recuperar entre
> 1.500 y 3.000 €/mes. Si te interesa, te paso un cálculo hecho con tus números (son 2 min). Si no, también vale.

> Regla: **máximo 3 mensajes por contacto.** Después, silencio. El silencio es lo que hace que no parezcas spam.

---

## 4. Primer mensaje por WhatsApp (a número de móvil de negocio)

> Buenos días 👋 Soy [tu nombre], de [tu empresa]. Escribo porque vi que sois [instaladores de calderas] en
> [ciudad]. Los negocios como el vuestro sueles tener entre un 40 y un 50 % de clientes antiguos que no os
> vuelven a llamar, y cada trabajo perdido son 500–3.000 €.
> ¿Te lo explico en 2 minutos por aquí o prefieres que te mande un cálculo por escrito?

---

## 5. Email en frío

**Asunto:** los clientes que no os vuelven (cálculo de 1 página)

> Hola [nombre],
>
> Soy [tu nombre], de [tu empresa]. Escribo porque trabajáis en [sector] en [ciudad] y tengo una pregunta:
>
> ¿Cuánto dinero os está costando al mes los clientes a los que les hicisteis un trabajo y no han vuelto?
> No es una estimación abstracta: lo calculo con el número de clientes activos, el ticket medio y el
> porcentaje de presupuestos sin respuesta, y os sale en euros al mes.
>
> Te adjunto el cálculo con cifras de ejemplo de tu sector: https://vuelve-pink.vercel.app/demo/diagnostico
> Si los números te cuadran, en 48 h te entrego tu lista de clientes dormidos y las plantillas de WhatsApp
> (ya aprobadas y listas para usar).
>
> ¿Te lo mando?
>
> Un saludo,
> [tu nombre] · [tu empresa] · [teléfono]

---

## 6. Guion de llamada (60 segundos)

> "Hola [nombre], soy [tu nombre] de [tu empresa]. ¿Tienes un minuto?
>
> Te llamo por algo muy concreto: los instaladores como tú suelen tener entre un 40 y un 50 % de clientes que
> no vuelven a llamar. Cada trabajo de esos vale entre 500 y 3.000 €.
>
> ¿Tú sabrías decirme más o menos cuántos clientes activos tienes?
> [escuchar]
>
> Perfecto. Con el ticket medio que tienes, eso son unos [X] euros al mes que se os están escapando.
>
> ¿Y esos clientes que no vuelven están en alguna lista a la que puedas escribirles?
> [escuchar]
>
> Eso es exactamente lo que montamos: escribimos por WhatsApp con la API oficial de Meta —plantillas
> aprobadas, tu número, tu saldo— y rellenamos los huecos con los que confirman.
>
> Te lo dejo por escrito: 199 € por una auditoría con tu lista de clientes dormidos, tus plantillas y el
> cálculo exacto. Sin compromiso. ¿Te lo mando?"

**Reglas de la llamada:**
- Objetivo único: que acepten **la auditoría de 199 €**. Nada más.
- Si dicen "ya tengo un CRM": "Perfecto, ¿sabes cuántos clientes inactivos tiene? Eso es exactamente lo que vamos a activar."
- Si dicen "eso lo tengo en una hoja de Excel": "Pues mejor: en 48 h te digo cuántos hay y cuánto valen."
- Si dicen "no me interesa": "¿Y si te digo que con 2 clientes recuperados ya has pagado la auditoría? ¿Te lo resumo?"
- Si dicen "déjame que lo piense": "Claro. Te escribo hoy con el resumen de 1 página, ¿te va bien?"

---

## 7. La llamada de diagnóstico (15 min) — para cuando piden más info

1. **2 min** — Su negocio: nº de clientes instalados, ticket medio, servicios (caldera, ACS, solar…), % de presupuestos sin respuesta.
2. **3 min** — Calcula en vivo con la calculadora de tu web (`https://vuelve-pink.vercel.app/#calculadora`) o a mano:
   "Te estáis dejando X €/mes".
3. **3 min** — Qué harías: lista de clientes dormidos + plantillas + 1 campaña de prueba.
4. **3 min** — Precio y garantía: **199 €** la auditoría (se descuenta de la instalación), **900 €** la instalación
   (te lo dejo funcionando con la API de WhatsApp), **299 €/mes** si lo gestiono.
   **Garantía: si en 30 días no recuperamos 2 clientes, te devuelvo la mensualidad.**
5. **2 min** — Cierre: "¿Te lo dejo preparado para esta semana?"
6. **1 min** — Siguiente paso: pasarela de pago (Stripe Payment Link) y qué necesitas de ellos (su lista de clientes y su acceso a WhatsApp Business).

**Regla de oro: nunca envíes la propuesta sin una llamada previa.** Por escrito cierra un 80 % menos.

---

## 8. Estructura del PDF que entregas (auditoría de 199 €)

**No lo maquetas a mano: se genera en `/panel` → pestaña «Diagnóstico PDF».**

1. **Portada**: nombre comercial, a quién va dirigido, fecha y la cifra grande de dinero que se le escapa.
2. **Resumen en 1 página**: clientes instalados, presupuestos/citas que se pierden, clientes dormidos y **€ perdidos/mes**.
3. **Los clientes dormidos**: hasta 50 con nombre, teléfono, fecha del último trabajo, servicio y ticket (CSV aparte con todos).
4. **Las plantillas**: texto listo para copiar, con el nombre del negocio ya puesto y la línea de baja del RGPD.
5. **La campaña de prueba**: a quién escribir, cuándo y qué medir.
6. **El plan**: qué pasa si contrata la instalación o la gestión, con precios y garantía.

Flujo: creas el «espacio de trabajo» del cliente (desde el lead con «→ espacio»), pegas su lista de clientes en la
pestaña **Clientes**, y en **Diagnóstico PDF** le das a «Guardar como PDF». Se lo envías por email.

Si quieres ver el resultado antes de tener datos reales: `/demo/diagnostico` (con datos inventados).

---

## 9. Qué necesitas de cada cliente (checklist de arranque)

Esto es lo que te va a pedir al cerrar la auditoría. Pídeselo todo junto, en un mensaje:

- [ ] **Su lista de clientes** (Excel, CSV, export de su facturador o foto del libro de trabajo).
- [ ] **Acceso a su WhatsApp Business** (o 30 min de videollamada para guiarlo: `docs/MOTOR-WHATSAPP.md`).
- [ ] **Su Phone Number ID y su token** de la API de Meta (los genera él en su cuenta).
- [ ] **Consentimiento**: si va a recibir mensajes comerciales, que registre quién lo ha dado (o que solo use
      plantillas de servicio, que no lo necesitan).
- [ ] Su tono: cómo escribe él ("tú" / "usted", formal / cercano), su horario y su nombre comercial.

---

## 10. Cobro

| Método | Para qué | Cómo |
|---|---|---|
| **Stripe Payment Link** | Pago automático con tarjeta (España y UE) | Stripe → Payment Links → 199 € → copiar URL a `NEXT_PUBLIC_STRIPE_AUDIT_URL` |
| **Transferencia / Bizum** | Clientes que no quieren tarjeta | Poner tus datos en la web y pedir confirmación por WhatsApp |
| **Factura con IVA** | Empresas que lo necesitan | Factura simplificada: "servicios de consultoría y marketing digital, IVA 21 %" (revisa con tu gestoría) |

Cobra **siempre por adelantado**. Nunca "te lo hago y luego ya vemos".

---

## 11. Métricas que debes mirar cada lunes

| Métrica | Objetivo semanal |
|---|---|
| Contactos directos enviados | 50 (10/día laborable) |
| Respuestas | ≥ 8 (15 %) |
| Llamadas hechas | 10 |
| Propuestas enviadas | 4 |
| Ventas | 1–2 |
| Ticket medio | ≥ 250 € |

Si no llegas a 10 contactos/día, el problema no es el mensaje: es que no te has sentado a hacerlo.
