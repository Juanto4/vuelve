# Motor de WhatsApp (API oficial + n8n)

Guía de instalación del motor. **Un cliente nuevo debe quedar operativo en 30–45 minutos**, no en 3 horas.
Esta guía es también el entregable que dejas al cliente (o te quedas tú el servicio de gestión).

---

## Por qué la API oficial y no enlaces `wa.me`

| | Enviar a mano (`wa.me`) | API oficial + plantillas |
|---|---|---|
| Legalidad | Fuera de la ventana de 24 h solo se permite con plantilla aprobada | Plantillas aprobadas por Meta, siempre |
| Riesgo de bloqueo | Alto: WhatsApp banea números que envían en masse | Bajo, si respetas los límites |
| Coste por cliente | Tu tiempo (2–3 h por campaña) | ~0,05 €/mensaje (0,016 € los de servicio) |
| Escalabilidad | Máx. 3–4 clientes | 15–20 clientes con 1–2 h/día |

**Ventana de 24 horas**: si el cliente te ha escrito en las últimas 24 h, puedes responder con texto libre.
Pasadas las 24 h, todo mensaje debe salir por plantilla aprobada.

**Categorías de plantilla**:
- `UTILITY` → transaccional (confirmación de cita, presupuesto, recordatorio de revisión). No exige consentimiento.
- `MARKETING` → promocional (reactivación, ofertas, petición de reseña). **Exige consentimiento de marketing registrado.**

---

## Paso 0 · Base de datos del panel (una vez, 5 min)

El motor guarda las credenciales del cliente, el consentimiento y el registro de envíos en Supabase.
Está automatizado para que no dependa de que alguien entre al SQL Editor:

```bash
# 1. Genera un token en https://supabase.com/dashboard/account/tokens
# 2. (PowerShell)
$env:SUPABASE_ACCESS_TOKEN="sbp_xxx"
npm run supabase:setup
```

El script es **idempotente**: crea la organización y el proyecto si no existen, aplica `supabase/schema.sql`
(archivo completo o sentencia a sentencia, con fallback), deja la autenticación por email sin confirmación
y escribe las claves en `.env.local`. Puedes relanzarlo cuando actualices el esquema.

Qué queda en la base de datos:

| Tabla | Para qué |
|---|---|
| `workspaces` | Un cliente del servicio. Guarda `wa_phone_number_id`, `wa_token`, `wa_daily_limit`, `wa_auto` |
| `clients` | La base de clientes del negocio, con `wa_consent`, `wa_consent_at` y `wa_consent_source` |
| `leads` | Los leads de la web y los añadidos a mano |
| `activities` | Registro de envíos, consentimientos y trabajos facturados |

Las políticas RLS hacen que cada cuenta solo vea sus datos; los triggers `set_user_id()` asignan el
`user_id` automáticamente en cada alta.

---

## Paso 1 · Crear la cuenta del cliente (10 min)

El cliente usa **su propio número y su propio saldo**. Tú no gastas de tu cartera y el historial queda en su WhatsApp.

1. **Meta Business Manager** → `business.facebook.com` → crear cuenta (o que use la del cliente).
2. **WhatsApp Manager** → *Empezar* → *Configurar un número de teléfono*.
   - Debe ser un número **móvil** que **no esté activo en la app de WhatsApp** (si lo está, tienes que borrar la
     cuenta o usar otro número).
   - Verificación por SMS o llamada.
3. **Level 1 (gratis)**: 1.000 conversaciones/mes y 80 plantillas. Para empezar, suficiente.
4. En **WhatsApp Manager → API Setup**: copia el **Phone Number ID** y genera un **token permanente**.
   - Token → *WhatsApp Manager → API Setup → Temporary access token → Create token → System user → Permanent*.
5. En **Settings → General → Webhooks** (opcional): Callback URL = `https://tu-dominio/api/whatsapp/webhook`
   y suscríbete a `messages`.

Todo esto lo hace el cliente en su propia cuenta; tú lo guides por videollamada de 15 minutos.

---

## Paso 2 · Aprobar las plantillas (24 h, mayormente automático)

En **WhatsApp Manager → Plantillas de mensaje → Crear**:

1. Copia el cuerpo **exacto** que aparece en el panel (pestaña *Motor WhatsApp → Paso 2*).
2. Categoría: `UTILITY` o `MARKETING` según el panel.
3. Idioma: `es`.
4. Los parámetros `{{1}}`, `{{2}}`… se numeran **en el orden en que aparecen** en el texto.

Plantillas del proyecto (panel → Motor):

| Nombre | Categoría | Cuándo se usa |
|---|---|---|
| `reactivacion_cliente` | MARKETING | Cliente que no llama desde hace meses. **Necesita consentimiento.** |
| `revision_programada` | UTILITY | Recordatorio de revisión anual (caldera, ACS, solar) |
| `confirmacion_cita` | UTILITY | Confirmación tras agendar |
| `presupuesto_pendiente` | UTILITY | Seguimiento de un presupuesto sin respuesta |
| `hueco_liberado` | UTILITY | Hueco libre en la agenda (lista de espera) |
| `solicitud_resena` | MARKETING | Petición de reseña en Google. **Necesita consentimiento.** |

**Tips para que Meta no las rechace:**
- Sin emojis ni demasiados signos.
- Sin URLs acortadas tipo `bit.ly` (usa enlaces de tu propio dominio).
- El texto debe ser coherente con la categoría declarada: si pones "UTILITY" y el texto vende, te la rebajan.
- La primera revisión suele tardar minutos; si tarda más de 24 h, revisa que no haya variables mal numeradas.

---

## Paso 3 · Guardar credenciales en el panel

**Panel → selector de cliente → pestaña "Motor WhatsApp" → Paso 1.**

- **Phone Number ID**: el ID numérico de su número en la API.
- **Token de acceso permanente**: el token que genera el cliente.
- **Límite de envíos por día**: 80 por defecto (empieza bajo; súbelo si la calidad de la cuenta es buena).

El token se guarda en la fila del cliente (`workspaces.wa_token`) y **nunca se vuelve a mostrar**: el panel solo
enseña los 4 últimos caracteres. Al terminar el contrato, bórralo (botón de borrado en la misma pantalla).

> Si trabajas con una sola cuenta tuya (modo prueba), define `WHATSAPP_TOKEN` y `WHATSAPP_PHONE_NUMBER_ID`
> en `.env.local` y el panel lo usará como respaldo cuando el cliente no tenga credenciales propias.

---

## Paso 4 · Consentimiento de marketing (lo que te protege)

1. **Recógelo** en el momento del trabajo: un mensaje de confirmación ("Te avisamos del mantenimiento anual por
   WhatsApp. ¿Te parece bien? Responde SÍ") o una casilla en tu formulario de presupuesto.
2. **Registralo** en el panel: pestaña *Motor → Consentimiento de marketing*, marca los contactos.
   Se guarda fecha (`wa_consent_at`) y origen (`wa_consent_source`), que es lo que te pide la AEPD si pregunta.
3. **El motor lo aplica solo**: las plantillas `MARKETING` no se envían a quien no tenga el consentimiento marcado.

Alternativa al consentimiento: usa solo plantillas `UTILITY` (recordatorios de revisión, presupuestos, citas) y
deja la reactivación comercial para cuando lo tengas. En el sector de la instalación esto funciona muy bien:
el 70 % del resultado sale de recordatorios de mantenimiento, no de ofertas.

---

## Paso 5 · Lanzar la primera campaña

**Panel → Motor WhatsApp → Paso 3**

1. Elige plantilla y segmento (`Dormidos 180+ días` / `Todos`).
2. Pon el **límite** de envíos de esa tanda (empieza con 20).
3. **Simular** primero: te dice a quién se le enviaría y a quién se le salta (sin consentimiento, sin teléfono
   válido, límite alcanzado).
4. **Enviar**: el motor llama a la Graph API, registra cada envío en `activities` y respeta el límite diario.
5. Mide: en *Métricas* verás envíos, citas/trabajos recuperados y dinero recuperado.

Intervalos: el motor espera ~0,9 s entre envíos. No subas el ritmo a ciegas: la **calidad de la cuenta** de Meta
depende de las respuestas y de las bajas. Si la calidad baja, Meta te recorta el límite automáticamente.

---

## Paso 6 · Automatizar con n8n (opcional, es lo que escala)

Si el cliente quiere que la campaña corra sola en **su** infraestructura (su n8n, su número, su saldo):

1. Panel → Motor → Paso 4 → descarga el flujo:
   - `reactivacion-clientes.json` → reactivación mensual de dormidos.
   - `recordatorio-cita.json` → recordatorio 24 h antes (webhook).
   - `solicitud-resena.json` → petición de reseña tras la visita.
2. En n8n: **Import from file** → pegarlo.
3. Crea la hoja de Google Sheets con las columnas que indica la nota del flujo (`Contactos`, `Visitas`, `Envios`).
4. En n8n → **Settings → Variables**: `WA_PHONE_NUMBER_ID`, `WA_TOKEN`, `NEGOCIO`.
5. Activa el flujo (para el de prueba: *Execute workflow*).

**Alternativa sin n8n**: `POST /api/whatsapp/cron` con la cabecera `x-cron-key: <CRON_SECRET>` lanza la campaña
programada de los clientes marcados como automáticos. Se puede llamar desde Vercel Cron o desde un n8n del cliente.

---

## Costes (referencia, España 2026)

| Concepto | Coste |
|---|---|
| Plantilla de marketing | ~0,05 – 0,06 € por conversación |
| Plantilla de servicio (utility) | ~0,016 € por conversación |
| Campaign de 300 clientes | ~15 – 18 € |
| Nivel 1 de la API | Gratis, 1.000 conversaciones/mes |
| n8n self-hosted | Gratis (o 20 €/mes en la nube) |

Los conversaciones de un cliente se le facturan a él, nunca salen de tu cuenta.

---

## Errores frecuentes de la API

| Código | Qué significa | Solución |
|---|---|---|
| `131009` | Número de parámetros incorrecto | Revisa el orden `{{1}}`, `{{2}}`… en la plantilla |
| `131047` | Fuera de la ventana de 24 h o sin consentimiento | Usa plantilla aprobada y registra el consentimiento |
| `131051` | Tipo de mensaje no soportado | La plantilla no admite ese uso |
| `132001` | La plantilla no existe o no está aprobada | Créala y espera la aprobación |
| `132007` | Límite de plantillas alcanzado | Revisa la calidad de la cuenta |
| `47002` | El contacto no te ha escrito en 24 h | Envía plantilla aprobada, no texto libre |
| `131052` | Número no válido para WhatsApp | Revisa el teléfono (prefijos +34) |

---

## Qué le entregas al cliente (checklist de cierre)

- [ ] Panel con su espacio de trabajo, su base de clientes y su consentimiento registrado.
- [ ] Plantillas aprobadas por Meta (textos y captura).
- [ ] Flow de n8n (si lo ha pedido) + guía de importación.
- [ ] Informe del primer mes: cuántos contactos, cuántos respondieron, cuánto dinero.
- [ ] Acceso a su informe mensual y canal de soporte.
- [ ] Recordatorio: **al terminar el contrato, revoca el token y borra los datos de sus contactos.**
