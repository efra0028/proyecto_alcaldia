// src/app/admin/qrGenerador/hooks/useQrGeneradorAdmin.ts
'use client'

import { useState, useRef, useCallback } from 'react'
import {
  isValidUrl, normalizeUrl, slugifyUrl,
  downloadCanvas, uploadArchivo,
  ALLOWED_MIMETYPES, formatBytes,
} from '../utils/qr'
import type {
  QrOpcionesAdmin, ModoEntrada, EstadoGenerador,
  FormErrorsAdmin, QrFormatoDescarga, ErrorCorrection,
} from '../types'
import { apiClient } from '@/app/lib/api-client'

// ── Defaults ──────────────────────────────────────────────────

const DEFAULT_OPCIONES: QrOpcionesAdmin = {
  fgColor: '#BE2D26',
  bgColor: '#FFFFFF',
  size: 1024,
  errorCorrection: 'H',
  includeMargin: true,
  logoUrl: '/sede.ico',
  logoSize: 20,
}

// ── Return type ───────────────────────────────────────────────

export interface UseQrGeneradorAdminReturn {
  // Modo
  modo: ModoEntrada
  setModo: (m: ModoEntrada) => void

  // URL
  urlInput: string
  setUrlInput: (v: string) => void
  handleUrlBlur: () => void

  // Archivo
  archivo: File | null
  archivoUrl: string       // URL pública tras subir
  isDragging: boolean
  handleFileDrop: (e: React.DragEvent) => void
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  setDragging: (v: boolean) => void
  removeArchivo: () => void

  // Estado y errores
  estado: EstadoGenerador
  errors: FormErrorsAdmin
  isReady: boolean         // QR tiene valor final para renderizar

  // Valor final del QR (URL o URL del archivo subido)
  qrValue: string

  // Opciones
  opciones: QrOpcionesAdmin
  setFgColor: (v: string) => void
  setBgColor: (v: string) => void
  setSize: (v: number) => void
  setErrorCorrection: (v: ErrorCorrection) => void
  setIncludeMargin: (v: boolean) => void
  setLogoUrl: (v: string) => void
  setLogoSize: (v: number) => void
  applyPreset: (fg: string, bg: string) => void

  // Canvas
  registerCanvas: (c: HTMLCanvasElement | null) => void

  // Acciones
  handleGenerar: () => Promise<void>
  handleDownload: (format: QrFormatoDescarga) => void
  handleCopyUrl: () => Promise<void>
  handleReset: () => void
  copied: boolean
}

// ── Hook ──────────────────────────────────────────────────────

export function useQrGeneradorAdmin(): UseQrGeneradorAdminReturn {
  const [modo, setModoRaw] = useState<ModoEntrada>('url')
  const [urlInput, setUrlInputRaw] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [archivoUrl, setArchivoUrl] = useState('')
  const [isDragging, setDragging] = useState(false)
  const [estado, setEstado] = useState<EstadoGenerador>('idle')
  const [errors, setErrors] = useState<FormErrorsAdmin>({})
  const [qrValue, setQrValue] = useState('')
  const [opciones, setOpciones] = useState<QrOpcionesAdmin>(DEFAULT_OPCIONES)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const isReady = estado === 'ready' && qrValue.length > 0

  // ── Modo ────────────────────────────────────────────────────

  const setModo = useCallback((m: ModoEntrada) => {
    setModoRaw(m)
    setQrValue('')
    setEstado('idle')
    setErrors({})
  }, [])

  // ── URL ─────────────────────────────────────────────────────

  const setUrlInput = useCallback((v: string) => {
    setUrlInputRaw(v)
    setErrors(e => ({ ...e, url: undefined }))
    const normalized = normalizeUrl(v)
    if (v.length > 4 && isValidUrl(normalized)) {
      setQrValue(normalized)
      setEstado('ready')
    } else {
      setQrValue('')
      setEstado('idle')
    }
  }, [])

  const handleUrlBlur = useCallback(() => {
    if (!urlInput.trim()) return
    const normalized = normalizeUrl(urlInput)
    if (!isValidUrl(normalized)) {
      setErrors(e => ({ ...e, url: 'Ingresa una URL válida (ej: https://www.sucre.gob.bo)' }))
      setEstado('idle')
    } else {
      setErrors(e => ({ ...e, url: undefined }))
      setUrlInputRaw(normalized)
      setQrValue(normalized)
      setEstado('ready')
    }
  }, [urlInput])

  // ── Archivo ─────────────────────────────────────────────────

  const processFile = useCallback((file: File) => {
    if (!ALLOWED_MIMETYPES.includes(file.type)) {
      setErrors(e => ({ ...e, archivo: `Tipo no permitido: ${file.type}` }))
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrors(e => ({ ...e, archivo: `El archivo supera los 50 MB (${formatBytes(file.size)})` }))
      return
    }
    setArchivo(file)
    setErrors(e => ({ ...e, archivo: undefined }))
    setEstado('idle')   // espera que el admin pulse "Subir y generar"
    setQrValue('')
    setArchivoUrl('')
  }, [])

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''   // permite re-seleccionar el mismo archivo
  }, [processFile])

  const removeArchivo = useCallback(() => {
    setArchivo(null)
    setArchivoUrl('')
    setQrValue('')
    setEstado('idle')
  }, [])

  // ── Acción principal: Subir + generar QR ────────────────────

  const handleGenerar = useCallback(async () => {
    if (modo === 'url') {
      const normalized = normalizeUrl(urlInput)
      if (!isValidUrl(normalized)) {
        setErrors(e => ({ ...e, url: 'Ingresa una URL válida' }))
        return
      }
      setQrValue(normalized)
      setEstado('ready')
      return
    }

    // Modo archivo
    if (!archivo) {
      setErrors(e => ({ ...e, archivo: 'Selecciona un archivo primero' }))
      return
    }

    setEstado('uploading')
    setErrors({})

    try {
      const token = apiClient.getToken() ?? ''
      const result = await uploadArchivo(archivo, token)
      const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${result.url}`
      setArchivoUrl(fullUrl)
      setQrValue(fullUrl)
      setEstado('ready')
    } catch (err) {
      setEstado('error')
      setErrors({
        general: err instanceof Error ? err.message : 'Error al subir el archivo',
      })
    }
  }, [modo, urlInput, archivo])

  // ── Reset ───────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setUrlInputRaw('')
    setArchivo(null)
    setArchivoUrl('')
    setQrValue('')
    setEstado('idle')
    setErrors({})
    setOpciones(DEFAULT_OPCIONES)
  }, [])

  // ── Opciones ────────────────────────────────────────────────

  const setter = <K extends keyof QrOpcionesAdmin>(key: K) =>
    (value: QrOpcionesAdmin[K]) => setOpciones(p => ({ ...p, [key]: value }))

  const applyPreset = useCallback((fg: string, bg: string) => {
    setOpciones(p => ({ ...p, fgColor: fg, bgColor: bg }))
  }, [])

  // ── Canvas ──────────────────────────────────────────────────

  const registerCanvas = useCallback((c: HTMLCanvasElement | null) => {
    canvasRef.current = c
  }, [])

  const handleDownload = useCallback((format: QrFormatoDescarga) => {
    const canvas = canvasRef.current
    if (!canvas || !isReady) return
    const slug = modo === 'url' ? slugifyUrl(qrValue) : (archivo?.name.replace(/\s+/g, '-').slice(0, 40) ?? 'archivo')
    downloadCanvas(canvas, `qr-${slug}`, format, opciones.size)
  }, [isReady, modo, qrValue, archivo, opciones.size])

  const handleCopyUrl = useCallback(async () => {
    if (!qrValue) return
    await navigator.clipboard.writeText(qrValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [qrValue])

  return {
    modo, setModo,
    urlInput, setUrlInput, handleUrlBlur,
    archivo, archivoUrl, isDragging,
    handleFileDrop, handleFileSelect,
    setDragging, removeArchivo,
    estado, errors, isReady, qrValue,
    opciones,
    setFgColor: setter('fgColor'),
    setBgColor: setter('bgColor'),
    setSize: setter('size'),
    setErrorCorrection: setter('errorCorrection'),
    setIncludeMargin: setter('includeMargin'),
    setLogoUrl: setter('logoUrl'),
    setLogoSize: setter('logoSize'),
    applyPreset,
    registerCanvas,
    handleGenerar, handleDownload, handleCopyUrl, handleReset,
    copied,
  }
}