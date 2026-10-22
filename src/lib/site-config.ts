export const CONFIG = {
  brand: "Vuelve",
  claim: "Que tus clientes vuelvan. Sin pedirlo.",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  stripeAudit: process.env.NEXT_PUBLIC_STRIPE_AUDIT_URL ?? "",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? "",
  email: "hola@vuelve.app",
  city: "España",
};

export const PRICING = [
  {
    id: "auditoria",
    name: "Auditoría",
    price: "199 €",
    priceNote: "pago único (se descuenta de la instalación)",
    pitch: "Saber exactamente cuánto dinero estás dejando en la mesa, con tus datos.",
    features: [
      "Revisión de tu base de clientes, tu agenda y tu ciclo de mantenimiento",
      "Lista de clientes dormidos con teléfono y fecha de la última instalación",
      "Plantillas de WhatsApp adaptadas a tu sector (revisión, presupuesto, reseñas)",
      "Cálculo del dinero que pierdes al mes (clientes que no vuelven + presupuestos sin respuesta)",
      "Informe de 3 páginas en PDF para entregar al equipo",
    ],
    cta: "Pedir auditoría",
    highlight: false,
  },
  {
    id: "instalacion",
    name: "Instalación",
    price: "900 €",
    priceNote: "pago único",
    pitch: "Lo monto yo, con tu número y tus credenciales. Entrega en 5 días laborables.",
    features: [
      "Configuración de la API oficial de WhatsApp Business con tus plantillas aprobadas",
      "Carga de tu base de clientes y registro del consentimiento de marketing",
      "Campañas montadas: reactivación, revisión anual, confirmación de cita y reseñas",
      "Flujo de n8n para que la campaña corra sola (o campañas manuales guiadas)",
      "Formación en vídeo de 20 minutos para tu equipo",
      "30 días de soporte por WhatsApp",
    ],
    cta: "Empezar la instalación",
    highlight: true,
  },
  {
    id: "gestion",
    name: "Gestión",
    price: "299 €",
    priceNote: "al mes, sin permanencia",
    pitch: "Lanzo las campañas cada mes y te doy el dinero recuperado.",
    features: [
      "Todo lo de la instalación incluido",
      "Campañas de reactivación, mantenimiento y reseñas cada mes",
      "300 conversaciones incluidas (los envíos extra se facturan a coste de WhatsApp)",
      "Te doy las respuestas clasificadas en una bandeja",
      "Informe mensual: clientes recuperados y dinero recuperado",
      "Puedes cancelar cuando quieras",
    ],
    cta: "Empezar la gestión",
    highlight: false,
  },
];

export const FAQ = [
  {
    q: "¿Necesito WhatsApp Business API?",
    a: "Para empezar no: la auditoría y la instalación se pueden hacer con enlaces de WhatsApp. En cuanto vas a enviar cientos de mensajes, la API oficial es obligatoria (y es lo que Meta exige fuera de la ventana de 24 horas). La instalación incluye configurar tu cuenta, tus plantillas aprobadas y el flujo de envío automático.",
  },
  {
    q: "¿Quién paga las conversaciones de WhatsApp?",
    a: "Tú, con tu número y tu cuenta de Meta. Una plantilla de marketing en España cuesta alrededor de 0,05 € por mensaje (0,016 € las de servicio), así que 300 mensajes al mes son unos 15 €. Va incluido en el plan de gestión y nunca sale de mi bolsillo.",
  },
  {
    q: "¿Es legal escribirles así? (RGPD)",
    a: "Solo con dos garantías: mensajes con plantilla aprobada por Meta y consentimiento de marketing registrado (te doy el procedimiento para recogerlo y dejarlo documentado). Los mensajes de servicio (confirmaciones, presupuestos) son de categoría UTILITY y no necesitan ese consentimiento. Todo eso te lo entrego por escrito para tu responsable de protección de datos.",
  },
  {
    q: "¿Y si no tengo base de datos de clientes?",
    a: "Ese es el punto: en la instalación el trabajo es extraerla de tus fuentes (agenda, facturador, exportación de trabajos) o reconstruirla a mano. Si tienes menos de 100 clientes, la hacemos en una tarde contigo por videollamada.",
  },
  {
    q: "¿Cuánto tarda?",
    a: "La auditoría se entrega en 48 horas. La instalación, en 5 días laborables desde que tenemos acceso a tus datos y a tu cuenta de Meta.",
  },
  {
    q: "¿Y si no funciona?",
    a: "Garantía de 30 días: si no recuperamos 2 clientes en el primer mes, te devolvemos la mensualidad. En el plan de gestión cancelas cuando quieras, sin permanencia.",
  },
  {
    q: "¿Lo haces solo o con mi equipo?",
    a: "Tú y tu equipo atendéis las citas (es lo menos automatizable). Yo me encargo de los contactos, las plantillas, los envíos y la medición del dinero recuperado.",
  },
];
