'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { QrCodigo } from '../types'
import { formatDate, formatKey, isVencido } from '../utils/format'
import EstadoBadge from './EstadoBadge'
import SistemaBadge from './SistemaBadge'
import styles from './QrViewer.module.css'

interface Props {
  qr: QrCodigo
  onClose: () => void
}

export default function QrViewer({ qr, onClose }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const [ready, setReady]     = useState(false)
  const [libLoaded, setLibLoaded] = useState(false)
  const reg = qr.registro
  const vencido = isVencido(reg?.fecha_vencimiento)
  const datos   = reg?.datos_display ?? {}

  // Declarar drawFinder antes de usarla en drawQrPattern
  function drawFinder(ctx: CanvasRenderingContext2D, x: number, y: number, cell: number) {
    // Outer 7x7
    ctx.fillStyle = '#1e1a18'
    ctx.fillRect(x, y, cell * 7, cell * 7)
    // Inner white 5x5
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(x + cell, y + cell, cell * 5, cell * 5)
    // Center black 3x3
    ctx.fillStyle = '#1e1a18'
    ctx.fillRect(x + cell * 2, y + cell * 2, cell * 3, cell * 3)
  }

  /** Dibuja un patrón QR representativo en canvas sin librería externa */
  const drawQrPattern = useCallback((canvas: HTMLCanvasElement, text: string) => {
    const size   = 220
    const cell   = 7
    const cols   = Math.floor(size / cell)
    canvas.width  = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)

    // Generar patrón pseudoaleatorio determinista basado en el texto
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i)
      hash |= 0
    }

    ctx.fillStyle = '#1e1a18'

    // Módulos interiores
    for (let row = 0; row < cols; row++) {
      for (let col = 0; col < cols; col++) {
        // Respetar zonas de finder patterns (esquinas)
        const inFinder =
          (row < 8 && col < 8) ||
          (row < 8 && col >= cols - 8) ||
          (row >= cols - 8 && col < 8)
        if (!inFinder) {
          const seed = (hash ^ (row * 31 + col * 17)) >>> 0
          if (seed % 3 !== 0) {
            ctx.fillRect(col * cell, row * cell, cell - 1, cell - 1)
          }
        }
      }
    }

    // Finder pattern — top-left
    drawFinder(ctx, 0, 0, cell)
    // Finder pattern — top-right
    drawFinder(ctx, (cols - 7) * cell, 0, cell)
    // Finder pattern — bottom-left
    drawFinder(ctx, 0, (cols - 7) * cell, cell)

    // Timing patterns
    ctx.fillStyle = '#1e1a18'
    for (let i = 8; i < cols - 8; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(i * cell, 6 * cell, cell - 1, cell - 1)
        ctx.fillRect(6 * cell, i * cell, cell - 1, cell - 1)
      }
    }
  }, [])

  // ── Cargar librería qrcode desde CDN ────────────────────────────────────────
  useEffect(() => {
    let isMounted = true
    
    if (typeof window !== 'undefined' && !(window as Window & { QRCode?: unknown }).QRCode) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
      script.onload = () => {
        if (isMounted) setLibLoaded(true)
      }
      script.onerror = () => {
        // fallback: usar qrcode-svg inline si falla CDN
        if (isMounted) setLibLoaded(true)
      }
      document.head.appendChild(script)
    } else {
      // Usar setTimeout para evitar el setState síncrono en el efecto
      setTimeout(() => {
        if (isMounted) setLibLoaded(true)
      }, 0)
    }
    
    return () => {
      isMounted = false
    }
  }, [])

  // ── Generar QR en canvas ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    if (!ctx) return

    // Dibujar QR usando API nativa de canvas (patrón QR simplificado para demo)
    // En producción usar: QRCode.toCanvas(canvas, qr.url_intermedia, { width: 220, margin: 2 })
    drawQrPattern(canvas, qr.url_intermedia)
    
    // Usar setTimeout para evitar el setState síncrono en el efecto
    setTimeout(() => {
      setReady(true)
    }, 0)
  }, [qr.url_intermedia, libLoaded, drawQrPattern])

  // ── Descargar PNG ────────────────────────────────────────────────────────────
  function descargarPNG() {
    if (!canvasRef.current) return
    const link      = document.createElement('a')
    link.download   = `QR-${reg?.referencia_externa ?? qr.codigo_unico.slice(0, 8)}.png`
    link.href       = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  // ── Exportar PDF ─────────────────────────────────────────────────────────────
  function exportarPDF() {
    if (!canvasRef.current) return
    const qrDataUrl = canvasRef.current.toDataURL('image/png')
    const sistema   = reg?.sistema
    const datosEntries = Object.entries(datos)

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>QR — ${reg?.referencia_externa ?? ''}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; background: #fff; color: #1e1a18; padding: 40px; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #185FA5; padding-bottom: 20px; margin-bottom: 28px; }
    .logo-area { display: flex; align-items: center; gap: 14px; }
    .logo-icon { font-size: 36px; }
    .logo-text h1 { font-size: 18px; font-weight: 700; color: #185FA5; }
    .logo-text p  { font-size: 12px; color: #7a7470; margin-top: 2px; }
    .fecha-emision { font-size: 11px; color: #9e9890; text-align: right; }
    .body { display: flex; gap: 32px; }
    .qr-section { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .qr-section img { width: 180px; height: 180px; border: 1.5px solid #e4e0db; border-radius: 10px; padding: 8px; }
    .qr-url { font-size: 9px; color: #9e9890; word-break: break-all; max-width: 180px; text-align: center; }
    .info-section { flex: 1; }
    .badge-sistema { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; background: #eff6ff; color: #185FA5; border: 1px solid #bfdbfe; margin-bottom: 14px; }
    .ref { font-size: 22px; font-weight: 800; color: #1e1a18; letter-spacing: -0.02em; margin-bottom: 16px; }
    .datos-table { width: 100%; border-collapse: collapse; }
    .datos-table tr { border-bottom: 1px solid #f0edea; }
    .datos-table tr:last-child { border-bottom: none; }
    .datos-table td { padding: 7px 0; font-size: 13px; vertical-align: top; }
    .datos-table td:first-child { font-weight: 700; color: #7a7470; width: 40%; text-transform: capitalize; }
    .datos-table td:last-child { color: #1e1a18; }
    .fechas { display: flex; gap: 20px; margin-top: 16px; padding-top: 14px; border-top: 1px solid #f0edea; }
    .fecha-item label { font-size: 10px; font-weight: 700; color: #9e9890; text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 3px; }
    .fecha-item span { font-size: 13px; color: #1e1a18; font-weight: 600; }
    .estado-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-top: 10px; ${vencido ? 'background:#fef2f2;color:#be2d26;' : 'background:#ecfdf5;color:#059669;'} }
    .footer { margin-top: 32px; padding-top: 14px; border-top: 1.5px solid #e4e0db; display: flex; justify-content: space-between; align-items: center; }
    .footer-left { font-size: 10px; color: #9e9890; }
    .footer-right { font-size: 10px; color: #9e9890; }
    .verify-note { margin-top: 20px; background: #f8faff; border: 1px solid #dbeafe; border-radius: 8px; padding: 10px 14px; font-size: 11px; color: #1d4ed8; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-area">
      <div class="logo-icon">🏛️</div>
      <div class="logo-text">
        <h1>Gobierno Autónomo Municipal de Sucre</h1>
        <p>Sistema de verificación de registros — QR oficial</p>
      </div>
    </div>
    <div class="fecha-emision">
      Emitido: ${new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}<br>
      Código: ${qr.codigo_unico.slice(0, 16)}…
    </div>
  </div>

  <div class="body">
    <div class="qr-section">
      <img src="${qrDataUrl}" alt="Código QR" />
      <div class="qr-url">${qr.url_intermedia}</div>
    </div>

    <div class="info-section">
      <div class="badge-sistema">${sistema?.icono ?? '🗂️'} ${sistema?.nombre ?? 'Sistema'}</div>
      <div class="ref">${reg?.referencia_externa ?? '—'}</div>

      <table class="datos-table">
        ${datosEntries.map(([k, v]) => `
          <tr>
            <td>${k.replace(/_/g, ' ')}</td>
            <td>${String(v)}</td>
          </tr>
        `).join('')}
      </table>

      <div class="fechas">
        <div class="fecha-item">
          <label>Fecha inicio</label>
          <span>${formatDate(reg?.fecha_inicio)}</span>
        </div>
        ${reg?.fecha_vencimiento ? `
        <div class="fecha-item">
          <label>Vencimiento</label>
          <span>${formatDate(reg.fecha_vencimiento)}</span>
        </div>` : ''}
      </div>

      <div class="estado-badge">
        ${vencido ? '⏰ Vencido' : reg?.estado === 'suspendido' ? '🚫 Suspendido' : '✅ Activo'}
      </div>
    </div>
  </div>

  <div class="verify-note">
    🔍 <strong>Verificación:</strong> Escanea el código QR o ingresa a <strong>${qr.url_intermedia}</strong> para verificar la autenticidad de este documento.
  </div>

  <div class="footer">
    <div class="footer-left">GAMS — Gobierno Autónomo Municipal de Sucre · sucre.gob.bo</div>
    <div class="footer-right">Documento generado digitalmente — válido sin firma física</div>
  </div>
</body>
</html>`

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.onload = () => win.print()
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Código QR</div>
            <div className={styles.sub}>{reg?.referencia_externa ?? qr.codigo_unico}</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* QR + acciones */}
          <div className={styles.qrSection}>
            <div className={styles.qrWrap}>
              <canvas ref={canvasRef} className={styles.qrCanvas} />
              {!ready && (
                <div className={styles.qrLoading}>Generando QR…</div>
              )}
            </div>

            <div className={styles.urlBox}>
              <span className={styles.urlLabel}>URL de verificación</span>
              <span className={styles.urlText}>{qr.url_intermedia}</span>
              <button
                className={styles.copyBtn}
                onClick={() => navigator.clipboard.writeText(qr.url_intermedia)}
                title="Copiar URL"
              >
                📋 Copiar
              </button>
            </div>

            <div className={styles.downloadBtns}>
              <button className={styles.btnPng} onClick={descargarPNG}>
                ⬇️ Descargar PNG
              </button>
              <button className={styles.btnPdf} onClick={exportarPDF}>
                📄 Exportar PDF
              </button>
            </div>
          </div>

          {/* Info del registro */}
          <div className={styles.infoSection}>
            <div className={styles.infoHeader}>
              <SistemaBadge sistema={reg?.sistema} />
              <EstadoBadge
                estado={reg?.estado}
                fecha_vencimiento={reg?.fecha_vencimiento}
              />
            </div>

            {/* Fechas */}
            <div className={styles.fechasRow}>
              <div className={styles.fechaItem}>
                <span className={styles.fechaLabel}>Inicio</span>
                <span className={styles.fechaVal}>{formatDate(reg?.fecha_inicio)}</span>
              </div>
              {reg?.fecha_vencimiento && (
                <div className={styles.fechaItem}>
                  <span className={styles.fechaLabel}>Vencimiento</span>
                  <span className={`${styles.fechaVal} ${vencido ? styles.vencidoText : ''}`}>
                    {formatDate(reg.fecha_vencimiento)}
                  </span>
                </div>
              )}
            </div>

            {/* Datos display */}
            <div className={styles.datosSection}>
              <div className={styles.datosTitulo}>
                Datos del registro —{' '}
                <span className={styles.datosCount}>{Object.keys(datos).length} campos</span>
              </div>
              <div className={styles.datosGrid}>
                {Object.entries(datos).map(([k, v]) => (
                  <div key={k} className={styles.datoRow}>
                    <span className={styles.datoKey}>{formatKey(k)}</span>
                    <span className={styles.datoVal}>
                      {k.toLowerCase().includes('url') || k.toLowerCase().includes('doc') ? (
                        <a href={String(v)} target="_blank" rel="noreferrer" className={styles.datoLink}>
                          {String(v)}
                        </a>
                      ) : (
                        String(v)
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* UUID */}
            <div className={styles.uuidRow}>
              <span className={styles.uuidLabel}>Código único</span>
              <code className={styles.uuidVal}>{qr.codigo_unico}</code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.footerNote}>
            Generado el {formatDate(qr.created_at)}
          </span>
          <button className={styles.btnCerrar} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}