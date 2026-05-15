'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { AuditoriaEntry, AuditoriaFiltros } from '../types'
import { auditoriaService } from '../../../lib/api-services'

const LIMITE_DEFAULT = 200

// Mapeo seguro desde la respuesta del backend
function mapEntry(raw: Record<string, unknown>): AuditoriaEntry {
  return {
    id:            Number(raw.id ?? 0),
    tabla_nombre:  String(raw.tabla_nombre ?? ''),
    registro_id:   String(raw.registro_id ?? ''),
    accion:        (raw.accion as AuditoriaEntry['accion']) ?? 'INSERT',
    usuario_id:    raw.usuario_id != null ? Number(raw.usuario_id) : null,
    datos_antes:   (raw.datos_antes as Record<string, unknown>) ?? null,
    datos_despues: (raw.datos_despues as Record<string, unknown>) ?? null,
    ip_address:    raw.ip_address ? String(raw.ip_address) : null,
    created_at:    String(raw.created_at ?? ''),
    usuario:       raw.usuario
      ? {
          id:     Number((raw.usuario as Record<string, unknown>).id ?? 0),
          nombre: String((raw.usuario as Record<string, unknown>).nombre ?? ''),
          email:  String((raw.usuario as Record<string, unknown>).email ?? ''),
        }
      : null,
  }
}

export function useAuditoria() {
  const [entradas, setEntradas]           = useState<AuditoriaEntry[]>([])
  const [cargando, setCargando]           = useState(true)
  const [error, setError]                 = useState<string | null>(null)
  const [seleccionada, setSeleccionada]   = useState<AuditoriaEntry | null>(null)
  const [filtros, setFiltros]             = useState<AuditoriaFiltros>({
    tabla: '', accion: '', busqueda: '',
  })

  // ── Carga — mismo patrón que useSistemas ────────────────────────────────
  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const raw = await auditoriaService.getAll(1, LIMITE_DEFAULT)
      // auditoriaService.getAll devuelve objeto paginado o array directo
      const lista = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as Record<string, unknown>).data)
          ? (raw as { data: Record<string, unknown>[] }).data
          : []
      setEntradas(lista.map(mapEntry))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar auditoría')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setCargando(true)
    setError(null)

    auditoriaService.getAll(1, LIMITE_DEFAULT)
      .then((raw) => {
        if (cancelled) return
        const lista = Array.isArray(raw)
          ? raw
          : Array.isArray((raw as Record<string, unknown>).data)
            ? (raw as { data: Record<string, unknown>[] }).data
            : []
        setEntradas(lista.map(mapEntry))
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Error al cargar auditoría')
      })
      .finally(() => { if (!cancelled) setCargando(false) })

    return () => { cancelled = true }
  }, [])

  // ── Filtrado local (sin roundtrip al backend) ────────────────────────────
  const filtradas = useMemo(() => {
    let rows = [...entradas]

    if (filtros.tabla) {
      rows = rows.filter(e => e.tabla_nombre === filtros.tabla)
    }
    if (filtros.accion) {
      rows = rows.filter(e => e.accion === filtros.accion)
    }
    if (filtros.busqueda.trim()) {
      const q = filtros.busqueda.toLowerCase()
      rows = rows.filter(e =>
        e.registro_id.toLowerCase().includes(q) ||
        e.usuario?.email.toLowerCase().includes(q) ||
        e.usuario?.nombre.toLowerCase().includes(q) ||
        e.ip_address?.toLowerCase().includes(q)
      )
    }

    return rows
  }, [entradas, filtros])

  // ── Stats derivados ──────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     entradas.length,
    inserts:   entradas.filter(e => e.accion === 'INSERT').length,
    updates:   entradas.filter(e => e.accion === 'UPDATE').length,
    deletes:   entradas.filter(e => e.accion === 'DELETE').length,
  }), [entradas])

  const setFiltro = useCallback(<K extends keyof AuditoriaFiltros>(
    key: K, value: AuditoriaFiltros[K],
  ) => {
    setFiltros(prev => ({ ...prev, [key]: value }))
  }, [])

  return {
    entradas: filtradas,
    totalSinFiltro: entradas.length,
    cargando,
    error,
    stats,
    filtros,
    setFiltro,
    seleccionada,
    setSeleccionada,
    recargar: cargar,
  }
}