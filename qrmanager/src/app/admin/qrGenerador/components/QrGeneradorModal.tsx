// src/app/admin/qrGenerador/components/QrGeneradorModal.tsx
'use client'

import { useEffect, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { useQrGeneradorAdmin } from '../hooks/useQrGeneradorAdmin'
import {
  PRESET_COLORS, SIZE_OPTIONS, ERROR_CORRECTION_LABELS,
  getMimeIcon, getMimeLabel, formatBytes, ALLOWED_MIMETYPES,
} from '../utils/qr'
import type { ErrorCorrection, QrFormatoDescarga } from '../types'
import styles from './QrGeneradorModal.module.css'

const PREVIEW_SIZE = 240

interface Props {
  onClose: () => void
}

export default function QrGeneradorModal({ onClose }: Props) {
  const hook = useQrGeneradorAdmin()
  const {
    modo, setModo,
    urlInput, setUrlInput, handleUrlBlur,
    archivo, isDragging,
    handleFileDrop, handleFileSelect, setDragging, removeArchivo,
    estado, errors, isReady, qrValue,
    opciones,
    setFgColor, setBgColor, setSize, setErrorCorrection,
    setIncludeMargin, setLogoUrl, setLogoSize, applyPreset,
    registerCanvas,
    handleGenerar, handleDownload, handleCopyUrl, handleReset,
    copied,
  } = hook

  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // Registra el canvas cuando el preview cambia
  useEffect(() => {
    if (!previewRef.current) return
    const canvas = previewRef.current.querySelector('canvas')
    registerCanvas(canvas ?? null)
  })

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  const isUploading = estado === 'uploading'

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={styles.modal}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Generador de QR</div>
            <div className={styles.sub}>
              Crea un código QR a partir de una URL o subiendo un archivo
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* ── Body ── */}
        <div className={styles.body}>
          <div className={styles.layout}>

            {/* ── Columna izquierda: formulario ── */}
            <div className={styles.formCol}>

              {/* Selector de modo */}
              <div className={styles.modeToggle}>
                <button
                  className={`${styles.modeBtn} ${modo === 'url' ? styles.modeBtnActive : ''}`}
                  onClick={() => setModo('url')}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  URL / Enlace
                </button>
                <button
                  className={`${styles.modeBtn} ${modo === 'archivo' ? styles.modeBtnActive : ''}`}
                  onClick={() => setModo('archivo')}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Subir archivo
                </button>
              </div>

              {/* ── Modo URL ── */}
              {modo === 'url' && (
                <div className={styles.group}>
                  <label className={styles.label}>
                    URL de destino <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                    </span>
                    <input
                      type="text"
                      className={`${styles.input} ${errors.url ? styles.inputErr : ''}`}
                      placeholder="https://www.sucre.gob.bo"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      onBlur={handleUrlBlur}
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                  {errors.url && <span className={styles.errMsg}>{errors.url}</span>}
                  <p className={styles.hint}>El QR redirigirá a esta URL al ser escaneado.</p>
                </div>
              )}

              {/* ── Modo Archivo ── */}
              {modo === 'archivo' && (
                <div className={styles.group}>
                  <label className={styles.label}>
                    Archivo <span className={styles.required}>*</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_MIMETYPES.join(',')}
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />

                  {archivo ? (
                    <div className={styles.fileChip}>
                      <span className={styles.fileChipIcon}>{getMimeIcon(archivo.type)}</span>
                      <div className={styles.fileChipInfo}>
                        <span className={styles.fileChipName}>{archivo.name}</span>
                        <span className={styles.fileChipMeta}>
                          {getMimeLabel(archivo.type)} · {formatBytes(archivo.size)}
                        </span>
                      </div>
                      <button
                        className={styles.fileChipRemove}
                        onClick={removeArchivo}
                        aria-label="Quitar archivo"
                      >✕</button>
                    </div>
                  ) : (
                    <div
                      className={`${styles.dropzone} ${isDragging ? styles.dropzoneDrag : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragging(true) }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleFileDrop}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <p className={styles.dropzoneTitle}>Arrastra aquí o haz clic</p>
                      <p className={styles.dropzoneSub}>
                        PDF, Word, Excel, PPT, imágenes, ZIP — máx. 50 MB
                      </p>
                    </div>
                  )}
                  {errors.archivo && <span className={styles.errMsg}>{errors.archivo}</span>}
                </div>
              )}

              {/* ── Error general ── */}
              {errors.general && (
                <div className={styles.errorBanner}>
                  <span>⚠</span> {errors.general}
                </div>
              )}

              {/* ── Presets de color ── */}
              <div className={styles.group}>
                <label className={styles.label}>Esquema de color</label>
                <div className={styles.presetRow}>
                  {PRESET_COLORS.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      className={`${styles.presetBtn} ${opciones.fgColor === p.fg && opciones.bgColor === p.bg ? styles.presetBtnActive : ''}`}
                      onClick={() => applyPreset(p.fg, p.bg)}
                      title={p.label}
                    >
                      <span
                        className={styles.presetSwatch}
                        style={{ background: `linear-gradient(135deg, ${p.fg} 50%, ${p.bg} 50%)` }}
                      />
                      <span className={styles.presetLabel}>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Colores custom ── */}
              <div className={styles.colorRow}>
                <div className={styles.colorPicker}>
                  <span className={styles.colorLabel}>QR</span>
                  <div className={styles.colorInputWrap}>
                    <input type="color" value={opciones.fgColor}
                      onChange={e => setFgColor(e.target.value)} className={styles.colorInput} />
                    <span className={styles.colorHex}>{opciones.fgColor.toUpperCase()}</span>
                  </div>
                </div>
                <div className={styles.colorPicker}>
                  <span className={styles.colorLabel}>Fondo</span>
                  <div className={styles.colorInputWrap}>
                    <input type="color" value={opciones.bgColor}
                      onChange={e => setBgColor(e.target.value)} className={styles.colorInput} />
                    <span className={styles.colorHex}>{opciones.bgColor.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* ── Corrección de errores ── */}
              <div className={styles.group}>
                <label className={styles.label}>Corrección de errores</label>
                <div className={styles.ecGrid}>
                  {(Object.entries(ERROR_CORRECTION_LABELS) as [ErrorCorrection, string][]).map(([key, label]) => (
                    <button key={key} type="button"
                      className={`${styles.ecBtn} ${opciones.errorCorrection === key ? styles.ecBtnActive : ''}`}
                      onClick={() => setErrorCorrection(key)}
                    >
                      <span className={styles.ecKey}>{key}</span>
                      <span className={styles.ecLabel}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Tamaño ── */}
              <div className={styles.group}>
                <label className={styles.label}>Tamaño de exportación</label>
                <div className={styles.sizeGrid}>
                  {SIZE_OPTIONS.map(s => (
                    <button key={s.value} type="button"
                      className={`${styles.sizeBtn} ${opciones.size === s.value ? styles.sizeBtnActive : ''}`}
                      onClick={() => setSize(s.value)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Logo ── */}
              <div className={styles.group}>
                <label className={styles.label}>
                  Logo central
                  <span className={styles.optional}>opcional</span>
                </label>
                <input type="text" className={styles.input}
                  placeholder="/sede.ico  (por defecto)"
                  value={opciones.logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  spellCheck={false}
                />
                {opciones.logoUrl && (
                  <div className={styles.sliderRow}>
                    <span className={styles.sliderLabel}>Tamaño</span>
                    <input type="range" min={8} max={30}
                      value={opciones.logoSize}
                      onChange={e => setLogoSize(Number(e.target.value))}
                      className={styles.slider}
                    />
                    <span className={styles.sliderVal}>{opciones.logoSize}%</span>
                  </div>
                )}
              </div>

              {/* ── Toggle margen ── */}
              <div className={styles.toggleRow}>
                <div>
                  <p className={styles.toggleTitle}>Incluir margen (quiet zone)</p>
                  <p className={styles.toggleDesc}>Espacio blanco recomendado para impresión.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={opciones.includeMargin}
                  onClick={() => setIncludeMargin(!opciones.includeMargin)}
                  className={`${styles.toggle} ${opciones.includeMargin ? styles.toggleOn : ''}`}
                >
                  <span className={styles.toggleThumb} />
                </button>
              </div>
            </div>

            {/* ── Columna derecha: preview ── */}
            <div className={styles.previewCol}>
              <div className={styles.previewCard}>

                <div className={styles.previewEyebrow}>
                  {isReady && <span className={styles.previewDot} />}
                  Vista previa
                </div>

                {/* QR Canvas */}
                <div
                  className={`${styles.qrBox} ${isReady ? styles.qrBoxReady : ''}`}
                  style={{ background: opciones.bgColor }}
                  ref={previewRef}
                >
                  {isReady ? (
                    <QRCodeCanvas
                      value={qrValue}
                      size={PREVIEW_SIZE}
                      fgColor={opciones.fgColor}
                      bgColor={opciones.bgColor}
                      level={opciones.errorCorrection}
                      includeMargin={opciones.includeMargin}
                      imageSettings={
                        opciones.logoUrl
                          ? {
                              src: opciones.logoUrl,
                              height: Math.round(PREVIEW_SIZE * (opciones.logoSize / 100)),
                              width: Math.round(PREVIEW_SIZE * (opciones.logoSize / 100)),
                              excavate: true,
                            }
                          : undefined
                      }
                    />
                  ) : (
                    <div className={styles.qrPlaceholder}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.3">
                        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1"/>
                        <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
                        <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
                        <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none"/>
                        <path d="M14 14h3v3h-3zM17 17h4M17 21v-4M21 14v3"/>
                      </svg>
                      <p>
                        {modo === 'url'
                          ? 'Ingresa una URL'
                          : isUploading
                            ? 'Subiendo archivo…'
                            : 'Sube un archivo y pulsa\n"Subir y generar QR"'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Meta */}
                {isReady && (
                  <div className={styles.previewMeta}>
                    <div className={styles.previewMetaRow}>
                      <span>Exportación</span>
                      <strong>{opciones.size} × {opciones.size} px</strong>
                    </div>
                    <div className={styles.previewMetaRow}>
                      <span>Corrección</span>
                      <strong>Nivel {opciones.errorCorrection}</strong>
                    </div>
                  </div>
                )}

                {/* URL destino */}
                {isReady && (
                  <div className={styles.previewUrl}>
                    <div className={styles.previewUrlRow}>
                      <code className={styles.previewUrlCode}>{qrValue}</code>
                      <button className={styles.copyBtn} onClick={handleCopyUrl} title="Copiar">
                        {copied ? '✓' : (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Descargas */}
                <div className={styles.downloadBtns}>
                  {(['png', 'jpeg'] as QrFormatoDescarga[]).map(fmt => (
                    <button
                      key={fmt}
                      disabled={!isReady}
                      onClick={() => handleDownload(fmt)}
                      className={`${styles.downloadBtn} ${fmt === 'png' ? styles.downloadBtnPrimary : styles.downloadBtnSecondary}`}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={handleReset}>
            Reiniciar
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
            <button
              className={styles.btnPrimary}
              onClick={handleGenerar}
              disabled={isUploading}
            >
              {isUploading ? (
                <><span className={styles.spinner} /> Subiendo…</>
              ) : modo === 'archivo' && !isReady ? (
                'Subir y generar QR'
              ) : (
                'Generar QR'
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}