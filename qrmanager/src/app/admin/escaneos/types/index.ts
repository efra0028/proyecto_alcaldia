// src/app/admin/escaneos/types/index.ts

export type ResultadoEscaneo = 'VALIDO' | 'BLOQUEADO' | 'VENCIDO' | 'EXPIRADO'

export interface EscaneoQr {
  id: number
  codigo: string       // el código UUID del QR
  titulo?: string | null
}

export interface EscaneoEntry {
  id: number
  qr_codigo_id: number
  ip_address: string
  dispositivo: string | null
  resultado: ResultadoEscaneo
  created_at: string
  qr_codigo: EscaneoQr | null
}

export interface EscaneoEstadisticas {
  total: number
  validos: number
  bloqueados: number
  vencidos: number
}

export interface EscaneoFiltros {
  resultado: string   // '' = todos
  busqueda: string    // filtra ip, dispositivo, qr_codigo_id
}

export const RESULTADOS: { value: string; label: string }[] = [
  { value: '',          label: 'Todos los resultados' },
  { value: 'VALIDO',    label: 'Válido'       },
  { value: 'BLOQUEADO', label: 'Bloqueado'    },
  { value: 'VENCIDO',   label: 'Vencido'      },
  { value: 'EXPIRADO',  label: 'Expirado'     },
]