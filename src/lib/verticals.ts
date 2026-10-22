import type { MessageTemplate, Vertical } from "./types";

const BAJA = "Responde BAJA y no recibirás más mensajes.";

function plantillas(opts: {
  servicio: string;
  servicioPlural: string;
  meses: number;
}): MessageTemplate[] {
  const s = opts.servicio;
  const sp = opts.servicioPlural;
  return [
    {
      id: "reactivar",
      label: "Reactivar cliente dormido",
      descripcion: "Cliente que no viene desde hace meses",
      texto: (v) =>
        `¡Hola ${v.nombre}! Soy del equipo de ${v.negocio}. Hacía ${v.meses} meses que no te veíamos y queríamos saber cómo estás 😊. ` +
        `Si te apetece, te guardamos hueco para ${s.toLowerCase()}. ¿Te viene bien esta semana? ${BAJA}`,
    },
    {
      id: "recordatorio",
      label: "Recordatorio de cita",
      descripcion: "Reduce ausencias (no-shows)",
      texto: (v) =>
        `¡Hola ${v.nombre}! Te recordamos tu cita de ${s.toLowerCase()} el ${v.fecha} a las ${v.hora}. ` +
        `Responde a este mensaje para confirmar o cambiar la hora. ¡Gracias! ${BAJA}`,
    },
    {
      id: "confirmacion",
      label: "Confirmación de cita",
      descripcion: "Para enviar justo después de agendar",
      texto: (v) =>
        `¡Perfecto ${v.nombre}! Tu cita de ${s.toLowerCase()} queda confirmada el ${v.fecha} a las ${v.hora}. ` +
        `Te esperamos. Si necesitas cambiarla, avísanos por aquí. ${BAJA}`,
    },
    {
      id: "lista_espera",
      label: "Oferta de hueco libre",
      descripcion: "Canciones y huecos que se liberan",
      texto: (v) =>
        `¡Hola ${v.nombre}! Se nos ha liberado un hueco para ${s.toLowerCase()} el ${v.fecha} a las ${v.hora}. ` +
        `¿Te viene bien? Dínoslo y lo reservamos. ${BAJA}`,
    },
    {
      id: "oferta",
      label: "Reactivación con incentivo",
      descripcion: "Cliente dormido + descuento suave",
      texto: (v) =>
        `¡Hola ${v.nombre}! Como hace ${v.meses} meses que no te vemos, te preparamos ${v.oferta} en ${sp.toLowerCase()}. ` +
        `¿Te lo preparamos esta semana? ${BAJA}`,
    },
    {
      id: "resena",
      label: "Petición de reseña",
      descripcion: "Reseñas en Google: más visibilidad local",
      texto: (v) =>
        `¡Hola ${v.nombre}! Gracias por tu confianza 😊 Si tienes un minuto, nos ayudaría muchísimo una reseña en Google. ` +
        `Te paso el enlace aquí. ¡Gracias! ${BAJA}`,
    },
  ];
}

export const VERTICALES: Vertical[] = [
  {
    id: "instaladores",
    nombre: "Instaladores y energía",
    ejemplos: "Calderas, ACS, aire acondicionado, energía solar, fontanería",
    ticket: 850,
    noShow: 12,
    dormidos: 45,
    donde: [
      "Google Maps: instaladores de tu población y provincia",
      "Directorios del sector (gasistas, climatización, solar)",
      "Comunidades de propietarios y administradores de fincas",
      "Reformas y constructoras (acuerdos de derivación)",
    ],
    servicio: "tu revisión",
    servicioPlural: "tus instalaciones",
    plantillas: plantillas({ servicio: "tu revisión", servicioPlural: "tus instalaciones", meses: 14 }),
  },
  {
    id: "peluqueria",
    nombre: "Peluquerías y estética",
    ejemplos: "Peluquerías, barberías, centros de estética, uñas, pestañas",
    ticket: 45,
    noShow: 12,
    dormidos: 28,
    donde: [
      "Instagram local: hashtags de tu ciudad y barrio",
      "Google Maps: negocios con reseñas de hace meses",
      "Grupos de Facebook de vecinos de tu zona",
      "Carteles en puertas con WhatsApp",
    ],
    servicio: "tu servicio",
    servicioPlural: "tus servicios",
    plantillas: plantillas({ servicio: "tu servicio", servicioPlural: "tus servicios", meses: 4 }),
  },
  {
    id: "dental",
    nombre: "Clínicas dentales",
    ejemplos: "Dentistas, ortodoncistas, clínicas dentales de barrio",
    ticket: 120,
    noShow: 10,
    dormidos: 32,
    donde: [
      "Google Maps: clínicas cuya última reseña es de hace 6+ meses",
      "Clínicas de barrio (no cadenas grandes)",
      "Acuerdos de derivación con odontólogos de la zona",
      "Instagram local",
    ],
    servicio: "tu revisión",
    servicioPlural: "tus tratamientos",
    plantillas: plantillas({ servicio: "tu revisión", servicioPlural: "tus tratamientos", meses: 8 }),
  },
  {
    id: "fisio",
    nombre: "Fisioterapia y salud",
    ejemplos: "Fisio, osteopatía, fisioterapia deportiva",
    ticket: 60,
    noShow: 15,
    dormidos: 25,
    donde: [
      "Gimnasios de barrio (acuerdos de derivación)",
      "Clubes deportivos",
      "Google Maps: fisioterápicos con poca actividad",
    ],
    servicio: "tu sesión",
    servicioPlural: "tus sesiones",
    plantillas: plantillas({ servicio: "tu sesión", servicioPlural: "tus sesiones", meses: 6 }),
  },
  {
    id: "taller",
    nombre: "Talleres y servicios técnicos",
    ejemplos: "Talleres de coche, tintorerías, calderas, aire acondicionado",
    ticket: 180,
    noShow: 8,
    dormidos: 40,
    donde: [
      "Google Maps por taller y población",
      "Comunidades de propietarios",
      "Instaladores de calderas y climatización",
    ],
    servicio: "tu revisión",
    servicioPlural: "tus revisiones",
    plantillas: plantillas({ servicio: "tu revisión", servicioPlural: "tus revisiones", meses: 12 }),
  },
  {
    id: "bienestar",
    nombre: "Bienestar y formación",
    ejemplos: "Coaches, centros de yoga, academias de formación",
    ticket: 90,
    noShow: 18,
    dormidos: 35,
    donde: [
      "Eventos y workshops",
      "Instagram de coaches locales",
      "LinkedIn (formadores en empresas)",
    ],
    servicio: "tu sesión",
    servicioPlural: "tus programas",
    plantillas: plantillas({ servicio: "tu sesión", servicioPlural: "tus programas", meses: 5 }),
  },
];

export function getVertical(id: string | null | undefined): Vertical {
  return VERTICALES.find((v) => v.id === id) ?? VERTICALES[0];
}
