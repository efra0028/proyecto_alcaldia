import { useState, useMemo, useCallback, useEffect } from 'react'
import type {
  QrCodigo,
  QrFormData,
  ToastState,
  SortKey,
  SortDir,
  EstadoRegistro,
} from '../types/index'
import { parseJsonSafe, isVencido } from '../utils/format'
import type { QrCodigoResponse, SistemaBackendResponse } from '../../../lib/api-services'
import { qrCodigosService, registrosService, sistemasService } from '../../../lib/api-services'

function normalizeRegistroEstado(
  valor?: { nombre?: string } | string,
): EstadoRegistro | undefined {
  if (!valor) return undefined
  if (typeof valor === 'string') return valor.toLowerCase() as EstadoRegistro
  return valor.nombre?.toLowerCase() as EstadoRegistro
}

function mapQrCodigoResponse(qr: QrCodigoResponse): QrCodigo {
  return {
    id: qr.id,
    registro_id: qr.registro_id,
    codigo_unico: qr.codigo_unico,
    url_intermedia: qr.url_intermedia,
    imagen_qr_url: qr.imagen_qr_url,
    created_at: qr.created_at,
    registro: qr.registro
      ? {
          ...qr.registro,
          estado: normalizeRegistroEstado(qr.registro.estado),
          fecha_vencimiento: qr.registro.fecha_vencimiento ?? undefined,
        }
      : undefined,
  }
}

export function useQrCodigos() {
  const [qrCodigos, setQrCodigos]         = useState<QrCodigo[]>([])
  const [sistemas, setSistemas]           = useState<SistemaBackendResponse[]>([])  // ← corregido
  const [search, setSearch]               = useState('')
  const [filtroSistema, setFiltroSistema] = useState('todos')
  const [filtroEst, setFiltroEst]         = useState('todos')
  const [sortKey, setSortKey]             = useState<SortKey>('created_at')
  const [sortDir, setSortDir]             = useState<SortDir>('desc')
  const [toast, setToast]                 = useState<ToastState>({ msg: '', type: 'success' })

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: ToastState['type'] = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500)
  }, [])

  // ── Cargar QR ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    qrCodigosService.getAll(undefined, 1, 100)
      .then((response) => {
        if (!cancelled) setQrCodigos(response.data.map(mapQrCodigoResponse))
      })
      .catch(() => {
        if (!cancelled) showToast('No se pudo cargar los códigos QR', 'error')
      })

    return () => { cancelled = true }
  }, [showToast])

  // ── Cargar Sistemas ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    sistemasService.getAll()
      .then((data) => {
        if (!cancelled) setSistemas(data)
      })
      .catch(() => {
        if (!cancelled) showToast('No se pudo cargar los sistemas', 'error')
      })

    return () => { cancelled = true }
  }, [showToast])

  // ── Sort toggle ───────────────────────────────────────────────────────────
  const toggleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }, [sortKey])

  // ── Filtered + sorted ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = [...qrCodigos]

    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter((qr) => {
        const reg = qr.registro
        if (!reg) return false
        return (
          reg.referencia_externa.toLowerCase().includes(q) ||
          qr.codigo_unico.toLowerCase().includes(q) ||
          reg.sistema?.nombre.toLowerCase().includes(q) ||
          Object.values(reg.datos_display).some((v) =>
            String(v).toLowerCase().includes(q),
          )
        )
      })
    }

    if (filtroSistema !== 'todos') {
      rows = rows.filter((qr) => qr.registro?.sistema_id === filtroSistema)
    }

    if (filtroEst !== 'todos') {
      rows = rows.filter((qr) => {
        const reg = qr.registro
        if (!reg) return false
        const efectivo = isVencido(reg.fecha_vencimiento) ? 'vencido' : reg.estado
        return efectivo === filtroEst
      })
    }

    rows.sort((a, b) => {
      let va = ''
      let vb = ''
      switch (sortKey) {
        case 'referencia_externa':
          va = a.registro?.referencia_externa ?? ''
          vb = b.registro?.referencia_externa ?? ''
          break
        case 'sistema_id':
          va = a.registro?.sistema?.nombre ?? ''
          vb = b.registro?.sistema?.nombre ?? ''
          break
        case 'estado':
          va = a.registro?.estado ?? ''
          vb = b.registro?.estado ?? ''
          break
        case 'fecha_vencimiento':
          va = a.registro?.fecha_vencimiento ?? '9999'
          vb = b.registro?.fecha_vencimiento ?? '9999'
          break
        default:
          va = a.created_at ?? ''
          vb = b.created_at ?? ''
      }
      const cmp = va.localeCompare(vb, 'es')
      return sortDir === 'asc' ? cmp : -cmp
    })

    return rows
  }, [qrCodigos, search, filtroSistema, filtroEst, sortKey, sortDir])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total    = qrCodigos.length
    const activos  = qrCodigos.filter((qr) => {
      const r = qr.registro
      return r?.estado === 'activo' && !isVencido(r.fecha_vencimiento)
    }).length
    const vencidos = qrCodigos.filter((qr) => isVencido(qr.registro?.fecha_vencimiento)).length
    const sistemasCount = new Set(qrCodigos.map((qr) => qr.registro?.sistema_id)).size
    return { total, activos, vencidos, sistemas: sistemasCount }
  }, [qrCodigos])

  // ── Crear QR ──────────────────────────────────────────────────────────────
  const crearQr = useCallback(async (form: QrFormData) => {
    const datos_display = parseJsonSafe(form.datos_display_raw) ?? {}

    try {
      const registro = await registrosService.create({
        sistema_id: form.sistema_id,
        referencia_externa: form.referencia_externa,
        datos_display,
        fecha_inicio: form.fecha_inicio,
        fecha_vencimiento: form.fecha_vencimiento || undefined,
        estado_id: 1,
      })

      const qrResponse = await qrCodigosService.generar(registro.id)
      const nuevo = mapQrCodigoResponse({
        ...qrResponse,
        registro: {
          ...registro,
          estado: 'activo',
        },
      })

      if (form.estado === 'suspendido' && nuevo.registro) {
        await registrosService.suspend(nuevo.registro.id, 'Suspendido desde panel al crear')
        nuevo.registro = { ...nuevo.registro, estado: 'suspendido' }
      }

      setQrCodigos((prev) => [nuevo, ...prev])
      showToast('QR generado correctamente')
      return nuevo
    } catch (error) {
      console.error('Error generando QR:', error)
      const message = (error as Error)?.message || 'No se pudo generar el QR'
      showToast(message, 'error')
      throw error
    }
  }, [showToast])

  // ── Suspender / reactivar ─────────────────────────────────────────────────
  const toggleEstado = useCallback(async (qr: QrCodigo) => {
    if (!qr.registro) {
      showToast('Registro no disponible', 'error')
      return
    }

    const actual = qr.registro.estado
    const next: EstadoRegistro = actual === 'activo' ? 'suspendido' : 'activo'

    try {
      if (next === 'suspendido') {
        await registrosService.suspend(qr.registro.id, 'Suspendido desde panel')
      } else {
        await registrosService.activate(qr.registro.id)
      }

      setQrCodigos((prev) =>
        prev.map((q) =>
          q.id === qr.id
            ? { ...q, registro: q.registro ? { ...q.registro, estado: next } : q.registro }
            : q,
        ),
      )

      showToast(
        `Registro ${next === 'activo' ? 'reactivado' : 'suspendido'}`,
        next === 'activo' ? 'success' : 'error',
      )
    } catch {
      showToast('No se pudo actualizar el estado del registro', 'error')
    }
  }, [showToast])

  // ── Eliminar ──────────────────────────────────────────────────────────────
  const eliminarQr = useCallback(async (id: number) => {
    try {
      await qrCodigosService.delete(id)
      setQrCodigos((prev) => prev.filter((q) => q.id !== id))
      showToast('QR eliminado', 'error')
    } catch {
      showToast('No se pudo eliminar el QR', 'error')
    }
  }, [showToast])

  return {
    search, setSearch,
    filtroSistema, setFiltroSistema,
    filtroEst, setFiltroEst,
    sortKey, sortDir, toggleSort,
    filtered,
    total: qrCodigos.length,
    stats,
    sistemas,
    crearQr,
    toggleEstado,
    eliminarQr,
    toast,
  }
}