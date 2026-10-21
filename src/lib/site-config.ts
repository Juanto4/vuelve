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
    id: "diagnostico",
    name: "Diagnóstico",
    price: "149 €",
    priceNote: "pago único",
    pitch: "Saber exactamente cuánto dinero estás dejando en la mesa.",
    features: [
      "Revisión de tu base de clientes y tu sistema de citas",
      "Lista de 50 clientes dormidos con teléfono listo para contactar",
      "4 plantillas de WhatsApp adaptadas a tu negocio",
      "Cálculo del dinero que pierdes al mes (ausencias + clientes que no vuelven)",
      "Informe de 3 páginas para entregar al equipo",
    ],
    cta: "Pedir diagnóstico",
    highlight: false,
  },
  {
    id: "puesta",
    name: "Puesta en marcha",
    price: "399 €",
    priceNote: "pago único + 129 €/mes opcional",
    pitch: "Lo monto yo, lo usas tú. Entrega en 5 días laborables.",
    features: [
      "Instalación y configuración de las campañas",
      "Integración con tu agenda (Google Calendar, Calendly o la que uses)",
      "Plantillas, automatizaciones de respuesta y recordatorios",
      "Formación en vídeo de 20 minutos para tu equipo",
      "30 días de soporte por WhatsApp",
      "Garantía: si no recuperas 3 citas en 30 días, te devuelvo el dinero",
    ],
    cta: "Empezar la puesta en marcha",
    highlight: true,
  },
  {
    id: "gestionado",
    name: "Plan gestionado",
    price: "129 €",
    priceNote: "al mes, sin permanencia",
    pitch: "Yo lanzo las campañas cada mes. Tú atiendes las respuestas.",
    features: [
      "Todo lo de la puesta en marcha incluido",
      "Campañas de reactivación y de ausencias cada mes",
      "Te doy las respuestas clasificadas en una bandeja",
      "Informe mensual: citas recuperadas y dinero recuperado",
      "Puedes cancelar cuando quieras",
    ],
    cta: "Empezar el plan gestionado",
    highlight: false,
  },
];

export const FAQ = [
  {
    q: "¿No tengo WhatsApp Business, funciona igual?",
    a: "Sí. La versión inicial usa enlaces de WhatsApp (wa.me): no necesitas API ni aprobación de WhatsApp para empezar. Cuando superes unas 50 conversaciones al día, te ayudo a migrar a la API oficial.",
  },
  {
    q: "¿No tengo base de datos de clientes.",
    a: "Ese es el punto: en la puesta en marcha el trabajo es extraerla de tus fuentes (agenda, facturador, exportación de citas) o reconstruirla a mano. Si tienes menos de 100 clientes, la hacemos en una tarde contigo por videollamada.",
  },
  {
    q: "¿Es legal escribirles así? (RGPD)",
    a: "Trabajamos con dos garantías: solo contactas a clientes con los que ya tuviste una relación (interés legítimo) y todos los mensajes incluyen una línea de baja. Te entrego el texto legal y el procedimiento documentado para adaptarlo a tu caso.",
  },
  {
    q: "¿Cuánto tarda?",
    a: "El diagnóstico se entrega en 48 horas. La puesta en marcha, en 5 días laborables desde que tenemos acceso a tus datos.",
  },
  {
    q: "¿Y si no funciona?",
    a: "Garantía de 30 días en la puesta en marcha: si no recuperamos 3 citas, te devolvemos el dinero. En el plan gestionado cancelas cuando quieras, sin permanencia.",
  },
  {
    q: "¿Lo haces solo o con mi equipo?",
    a: "Tú y tu equipo atendéis las citas (es lo que menos automatizable es). Yo me encargo de escribir los contactos, las plantillas y la medición del dinero recuperado.",
  },
];
