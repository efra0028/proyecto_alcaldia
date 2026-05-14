import type { Sistema, QrCodigo, EstadoRegistro } from '../types'

// ── Sistemas registrados ──────────────────────────────────────────────────────
export const SISTEMAS: Sistema[] = [
  { id: 'sis-001', nombre: 'Trámites municipales', color_hex: '#185FA5', icono: '📋' },
  { id: 'sis-002', nombre: 'Personas / Funcionarios', color_hex: '#0F6E56', icono: '👤' },
  { id: 'sis-003', nombre: 'Vehículos / Licencias',  color_hex: '#BA7517', icono: '🚗' },
  { id: 'sis-004', nombre: 'Publicaciones / Avisos',  color_hex: '#534AB7', icono: '📰' },
  { id: 'sis-005', nombre: 'Eventos / Entradas',      color_hex: '#A32D2D', icono: '🎟️' },
  { id: 'sis-006', nombre: 'Documentos',              color_hex: '#6B4C9A', icono: '📄' },
]

// ── Estados ───────────────────────────────────────────────────────────────────
export const ESTADOS_REGISTRO: {
  value: EstadoRegistro
  label: string
  color: string
  bg: string
}[] = [
  { value: 'activo',     label: 'Activo',     color: '#059669', bg: '#ECFDF5' },
  { value: 'suspendido', label: 'Suspendido', color: '#D97706', bg: '#FFFBEB' },
  { value: 'vencido',    label: 'Vencido',    color: '#BE2D26', bg: '#FEF2F2' },
]

// ── URL base pública ──────────────────────────────────────────────────────────
export const BASE_VERIFICAR_URL = 'https://sucre.gob.bo/verificar'

// ── Mock data ─────────────────────────────────────────────────────────────────
export const QR_MOCK: QrCodigo[] = [
  {
    id: 1,
    registro_id: 'reg-001',
    codigo_unico: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    url_intermedia: 'https://sucre.gob.bo/verificar/a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    imagen_qr_url: null,
    created_at: '2025-05-01T09:00:00',
    registro: {
      id: 'reg-001',
      sistema_id: 'sis-001',
      sistema: SISTEMAS[0],
      referencia_externa: 'TC-2025-00123',
      datos_display: {
        tipo: 'Permiso de construcción',
        solicitante: 'Juan Carlos Pérez Mamani',
        ci: '4521789',
        descripcion: 'Construcción de vivienda unifamiliar — Zona Norte',
        estado: 'Aprobado',
      },
      fecha_inicio: '2025-05-01',
      fecha_vencimiento: '2026-05-01',
      estado_id: 1,
      estado: 'activo',
      created_at: '2025-05-01T09:00:00',
    },
  },
  {
    id: 2,
    registro_id: 'reg-002',
    codigo_unico: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    url_intermedia: 'https://sucre.gob.bo/verificar/b2c3d4e5-f6a7-8901-bcde-f12345678901',
    imagen_qr_url: null,
    created_at: '2025-05-02T10:30:00',
    registro: {
      id: 'reg-002',
      sistema_id: 'sis-002',
      sistema: SISTEMAS[1],
      referencia_externa: 'CI-8754321',
      datos_display: {
        nombre: 'María Fernanda Rojas',
        cargo: 'Directora de Cultura',
        dependencia: 'GAMS — Secretaría de Cultura',
        ci: '8754321',
        fecha_posesion: '2024-01-15',
      },
      fecha_inicio: '2024-01-15',
      fecha_vencimiento: undefined,
      estado_id: 1,
      estado: 'activo',
      created_at: '2025-05-02T10:30:00',
    },
  },
  {
    id: 3,
    registro_id: 'reg-003',
    codigo_unico: 'c3d4e5f6-a7b8-9012-cdef-012345678902',
    url_intermedia: 'https://sucre.gob.bo/verificar/c3d4e5f6-a7b8-9012-cdef-012345678902',
    imagen_qr_url: null,
    created_at: '2025-05-03T08:15:00',
    registro: {
      id: 'reg-003',
      sistema_id: 'sis-003',
      sistema: SISTEMAS[2],
      referencia_externa: '1234-SUC',
      datos_display: {
        placa: '1234-SUC',
        propietario: 'Roberto Mamani Quispe',
        ci: '3321456',
        tipo_vehiculo: 'Automóvil',
        marca: 'Toyota',
        modelo: 'Corolla 2020',
        licencia: 'LIC-2025-00456',
      },
      fecha_inicio: '2025-01-10',
      fecha_vencimiento: '2025-12-31',
      estado_id: 1,
      estado: 'activo',
      created_at: '2025-05-03T08:15:00',
    },
  },
  {
    id: 4,
    registro_id: 'reg-004',
    codigo_unico: 'd4e5f6a7-b8c9-0123-def0-123456789003',
    url_intermedia: 'https://sucre.gob.bo/verificar/d4e5f6a7-b8c9-0123-def0-123456789003',
    imagen_qr_url: null,
    created_at: '2025-04-20T14:00:00',
    registro: {
      id: 'reg-004',
      sistema_id: 'sis-005',
      sistema: SISTEMAS[4],
      referencia_externa: 'EVT-2025-GUADALUPE-001',
      datos_display: {
        evento: 'Entrada de la Virgen de Guadalupe 2025',
        tipo_entrada: 'Palco VIP — Fila A',
        titular: 'Ana Sofía Delgado',
        numero_entrada: '001',
        fecha_evento: '2025-05-15',
      },
      fecha_inicio: '2025-05-15',
      fecha_vencimiento: '2025-05-15',
      estado_id: 2,
      estado: 'vencido',
      created_at: '2025-04-20T14:00:00',
    },
  },
  {
    id: 5,
    registro_id: 'reg-005',
    codigo_unico: 'e5f6a7b8-c9d0-1234-ef01-234567890004',
    url_intermedia: 'https://sucre.gob.bo/verificar/e5f6a7b8-c9d0-1234-ef01-234567890004',
    imagen_qr_url: null,
    created_at: '2025-05-04T11:00:00',
    registro: {
      id: 'reg-005',
      sistema_id: 'sis-006',
      sistema: SISTEMAS[5],
      referencia_externa: 'DOC-2025-CERT-789',
      datos_display: {
        tipo_documento: 'Certificado de residencia',
        titular: 'Luis Miguel Torrez',
        ci: '5678901',
        zona: 'Barrio Petrolero',
        emitido_por: 'Sub-Alcaldía Norte',
        documento_url: 'https://sucre.gob.bo/docs/cert-789.pdf',
      },
      fecha_inicio: '2025-05-04',
      fecha_vencimiento: '2025-11-04',
      estado_id: 2,
      estado: 'suspendido',
      created_at: '2025-05-04T11:00:00',
    },
  },
]