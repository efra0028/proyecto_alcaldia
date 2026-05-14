import type { Usuario } from '../../usuarios/types/index'

export const SISTEMAS: string[] = [
  'Taxi Seguro',
  'DMA',
  'Carnaval',
  'Tráfico',
  'Permisos Baile',
  'Personal',
]

export const ROLES = ['superadmin', 'admin', 'operador'] as const

export const ROL_META: Record<string, { label: string; color: string; bg: string }> = {
  superadmin: { label: 'Super Admin',    color: '#7C3AED', bg: '#F5F3FF' },
  admin:      { label: 'Administrador',  color: '#1D4ED8', bg: '#EFF6FF' },
  operador:   { label: 'Operador',       color: '#059669', bg: '#ECFDF5' },
}

export const AVATAR_PALETTE = [
  '#BE2D26', '#1D4ED8', '#7C3AED',
  '#D97706', '#059669', '#0F766E',
]

export const USUARIOS_MOCK: Usuario[] = [
  {
    id: 1,
    nombre: 'María Fernanda Rojas',
    email: 'mrojas@sucre.gob.bo',
    rol: 'superadmin',
    estado: 'activo',
    ultimoAcceso: '2025-05-04 09:12',
    creado: '2024-01-15',
    sistemas: ['Taxi Seguro', 'DMA', 'Carnaval'],
  },
  {
    id: 2,
    nombre: 'Carlos Mamani Huanca',
    email: 'cmamani@sucre.gob.bo',
    rol: 'admin',
    estado: 'activo',
    ultimoAcceso: '2025-05-04 14:30',
    creado: '2024-03-02',
    sistemas: ['Taxi Seguro'],
  },
  {
    id: 3,
    nombre: 'Patricia Salinas Vda.',
    email: 'psalinas@sucre.gob.bo',
    rol: 'operador',
    estado: 'activo',
    ultimoAcceso: '2025-05-03 11:05',
    creado: '2024-04-10',
    sistemas: ['Carnaval'],
  },
  {
    id: 4,
    nombre: 'Jorge Quispe Torrico',
    email: 'jquispe@sucre.gob.bo',
    rol: 'operador',
    estado: 'suspendido',
    ultimoAcceso: '2025-04-18 08:44',
    creado: '2024-02-28',
    sistemas: ['Tráfico'],
  },
  {
    id: 5,
    nombre: 'Lucía Argandoña Paz',
    email: 'largandona@sucre.gob.bo',
    rol: 'admin',
    estado: 'activo',
    ultimoAcceso: '2025-05-04 16:00',
    creado: '2024-05-01',
    sistemas: ['DMA', 'Tráfico'],
  },
  {
    id: 6,
    nombre: 'Roberto Villarroel C.',
    email: 'rvillarroel@sucre.gob.bo',
    rol: 'operador',
    estado: 'activo',
    ultimoAcceso: '2025-05-02 10:22',
    creado: '2024-06-15',
    sistemas: ['Permisos Baile'],
  },
  {
    id: 7,
    nombre: 'Ana Cecilia Flores',
    email: 'aflores@sucre.gob.bo',
    rol: 'operador',
    estado: 'suspendido',
    ultimoAcceso: '2025-03-30 13:17',
    creado: '2024-07-08',
    sistemas: ['Taxi Seguro', 'Carnaval'],
  },
  {
    id: 8,
    nombre: 'Diego Montaño Soria',
    email: 'dmontano@sucre.gob.bo',
    rol: 'admin',
    estado: 'activo',
    ultimoAcceso: '2025-05-04 08:55',
    creado: '2024-08-20',
    sistemas: ['Personal', 'Carnaval'],
  },
]
