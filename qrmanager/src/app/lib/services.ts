// lib/services.ts
// Datos de los servicios disponibles en el portal GAMS

export interface Service {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  tag: string;
  color: string;
  bg: string;
}

export const SERVICES: Service[] = [
  {
    id: "taxi-seguro",
    emoji: "🚕",
    name: "Taxi Seguro",
    desc: "Verifica la habilitación y vigencia de conductores de taxi registrados en el municipio.",
    tag: "Transporte",
    color: "#BE2D26",
    bg: "#FBEAE9",
  },
  {
    id: "dma-permisos",
    emoji: "🚌",
    name: "DMA — Permisos de Viaje",
    desc: "Consulta permisos de viaje y transporte emitidos por la Dirección de Movilidad y Administración.",
    tag: "Movilidad",
    color: "#1D4ED8",
    bg: "#EFF6FF",
  },
  {
    id: "carnaval-cultura",
    emoji: "🎭",
    name: "Carnaval & Cultura",
    desc: "Valida credenciales y autorizaciones para participantes en eventos culturales y el Carnaval de Sucre.",
    tag: "Eventos",
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
  {
    id: "trafico-vialidad",
    emoji: "🚦",
    name: "Tráfico y Vialidad",
    desc: "Verifica permisos de circulación vehicular emitidos por la unidad de tráfico municipal.",
    tag: "Vialidad",
    color: "#D97706",
    bg: "#FFFBEB",
  },
  {
    id: "permisos-baile",
    emoji: "🎵",
    name: "Permisos de Baile",
    desc: "Consulta autorizaciones municipales para eventos en locales de baile y entretenimiento.",
    tag: "Locales",
    color: "#059669",
    bg: "#ECFDF5",
  },
  {
    id: "credencial-personal",
    emoji: "🪪",
    name: "Credencial de Personal",
    desc: "Verifica la identidad y vigencia de credenciales de funcionarios y personal municipal autorizado.",
    tag: "Personal",
    color: "#0F766E",
    bg: "#F0FDFA",
  },
];

// Información de la alcaldía
export const GAMS_INFO = {
  phone: "+591 4 645-6789",
  hours: "Lunes a viernes, 8:00 – 17:00",
  address: "Plaza 25 de Mayo s/n, Sucre, Bolivia",
  email: "contacto@gams.gob.bo",
  website: "https://www.sucre.bo",
};

// Datos de las oficinas
export const OFFICES = [
  {
    id: "sede-central",
    name: "Sede Central — Alcaldía",
    dept: "Gobierno Autónomo Municipal de Sucre",
    address: "Plaza 25 de Mayo s/n",
    reference: "Frente a la Catedral Metropolitana",
    hours: "Lunes a viernes 8:00 – 17:00",
    phone: "+591 4 645-6789",
    isMain: true,
  },
  {
    id: "dma",
    name: "Dirección de Movilidad (DMA)",
    dept: "Permisos de transporte y circulación",
    address: "Calle Junín N° 427",
    reference: "Entre Ravelo y Loa",
    hours: "Lunes a viernes 8:00 – 16:30",
    phone: "+591 4 645-7001",
    isMain: false,
  },
  {
    id: "taxi-seguro-of",
    name: "Oficina Taxi Seguro",
    dept: "Registro y habilitación de conductores",
    address: "Av. Hernando Siles N° 1500",
    reference: "Zona Norte, edificio municipal anexo",
    hours: "Lunes a viernes 8:30 – 16:00",
    phone: "+591 4 645-7120",
    isMain: false,
  },
  {
    id: "cultura",
    name: "Dirección de Cultura y Turismo",
    dept: "Eventos, Carnaval y credenciales culturales",
    address: "Calle España N° 210",
    reference: "Plaza Libertad, 2do piso",
    hours: "Lunes a viernes 8:00 – 16:30",
    phone: "+591 4 645-7205",
    isMain: false,
  },
];

export const OFFICE_HOURS = [
  { day: "Lunes", time: "8:00 – 17:00" },
  { day: "Martes", time: "8:00 – 17:00" },
  { day: "Miércoles", time: "8:00 – 17:00" },
  { day: "Jueves", time: "8:00 – 17:00" },
  { day: "Viernes", time: "8:00 – 17:00" },
  { day: "Sábado", time: "Cerrado" },
  { day: "Domingo", time: "Cerrado" },
];
