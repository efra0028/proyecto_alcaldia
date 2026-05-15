'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { escaneoService, type EscaneoResponse } from '../../../lib/api-services'
import type {
  EscaneoEntry,
  EscaneoEstadisticas,
  EscaneoFiltros,
} from '../types'

const LIMITE_DEFAULT = 200

// ── Mapeo seguro backend → tipo local ────────────────────────────────────────
function mapEntry(raw: EscaneoResponse): EscaneoEntry {
  return {
    id:           raw.id,
    qr_codigo_id: raw.qr_codigo_id,
    ip_address:   raw.ubicacion ?? '—',
    dispositivo:  raw.navegador ?? null,
    resultado:    mapResultado(raw.resultado),
    created_at:   raw.creado_en,
    qr_codigo:    null,
  }
}

// El backend usa minúsculas; nuestros tipos usan mayúsculas
function mapResultado(r: EscaneoResponse['resultado']): EscaneoEntry['resultado'] {
  const map: Record<string, EscaneoEntry['resultado']> = {
    valido:    'VALIDO',
    invalido:  'BLOQUEADO',
    bloqueado: 'BLOQUEADO',
    vencido:   'VENCIDO',
  }
  return map[r] ?? 'VALIDO'
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useEscaneos() {
  const [entradas, setEntradas]         = useState<EscaneoEntry[]>([])
  const [estadisticas, setEstadisticas] = useState<EscaneoEstadisticas>({
    total: 0, validos: 0, bloqueados: 0, vencidos: 0,
  })
  const [cargando, setCargando]         = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [seleccionado, setSeleccionado] = useState<EscaneoEntry | null>(null)
  const [filtros, setFiltros]           = useState<EscaneoFiltros>({
    resultado: '', busqueda: '',
  })

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const [recientes, stats] = await Promise.all([
        escaneoService.getRecent(LIMITE_DEFAULT),
        escaneoService.getStats(),
      ])
      setEntradas(recientes.map(mapEntry))
      setEstadisticas({
        total:      stats.total,
        validos:    stats.validos,
        bloqueados: stats.bloqueados,
        vencidos:   stats.vencidos,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar escaneos')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const filtradas = useMemo(() => {
    let rows = [...entradas]
    if (filtros.resultado) {
      rows = rows.filter(e => e.resultado === filtros.resultado)
    }
    if (filtros.busqueda.trim()) {
      const q = filtros.busqueda.toLowerCase()
      rows = rows.filter(e =>
        e.ip_address.toLowerCase().includes(q) ||
        e.dispositivo?.toLowerCase().includes(q) ||
        String(e.qr_codigo_id).includes(q)
      )
    }
    return rows
  }, [entradas, filtros])

  const setFiltro = useCallback(<K extends keyof EscaneoFiltros>(
    key: K, value: EscaneoFiltros[K],
  ) => {
    setFiltros(prev => ({ ...prev, [key]: value }))
  }, [])

  return {
    entradas: filtradas,
    totalSinFiltro: entradas.length,
    cargando,
    error,
    estadisticas,
    filtros,
    setFiltro,
    seleccionado,
    setSeleccionado,
    recargar: cargar,
  }
}