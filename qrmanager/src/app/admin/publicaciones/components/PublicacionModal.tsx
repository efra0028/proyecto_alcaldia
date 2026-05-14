'use client'

import { useState } from 'react'
import type { Publicacion, PublicacionFormData, FormErrors, EstadoPublicacion } from '../types'
import styles from './PublicacionModal.module.css'
import type { TipoPublicacionResponse } from '../../../lib/api-services'
import { uploadService } from '../../../lib/api-services'

interface Props {
  publicacion: Publicacion | null
  onClose: () => void
  onSave: (form: PublicacionFormData) => void
  tipos: TipoPublicacionResponse[]
}

const today = new Date().toISOString().slice(0, 10)

const EMPTY_FORM: PublicacionFormData = {
  tipo_id: 1,
  titulo: '',
  resumen: '',
  cuerpo: '',
  portada_url: '',
  archivos_urls: '',
  fecha_publicacion: today,
  fecha_vencimiento: '',
  estado: 'borrador',
  destacada: false,
  orden_carrusel: 0,
}

function publicacionToForm(p: Publicacion): PublicacionFormData {
  return {
    id: p.id,
    tipo_id: p.tipo_id,
    titulo: p.titulo,
    resumen: p.contenido.resumen,
    cuerpo: p.contenido.cuerpo ?? '',
    portada_url: p.adjuntos_urls.portada ?? '',
    archivos_urls: (p.adjuntos_urls.archivos ?? []).join('\n'),
    fecha_publicacion: p.fecha_publicacion,
    fecha_vencimiento: p.fecha_vencimiento ?? '',
    estado: p.estado ?? 'borrador',
    destacada: p.destacada,
    orden_carrusel: p.orden_carrusel,
  }
}

export default function PublicacionModal({ publicacion, onClose, onSave, tipos }: Props) {
  const isEdit = !!publicacion

  const [form, setForm] = useState<PublicacionFormData>(
    isEdit ? publicacionToForm(publicacion!) : EMPTY_FORM,
  )
  const [errors, setErrors]   = useState<FormErrors>({})
  const [tab, setTab]         = useState<'general' | 'contenido' | 'adjuntos'>('general')
  const [uploading, setUploading] = useState(false)  // ✅ nuevo
  const [uploadError, setUploadError] = useState<string | null>(null)  // ✅ nuevo

  function setField<K extends keyof PublicacionFormData>(key: K, val: PublicacionFormData[K]) {
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.titulo.trim())     e.titulo = 'El título es requerido'
    if (!form.resumen.trim())    e.resumen = 'El resumen es requerido'
    if (!form.fecha_publicacion) e.fecha_publicacion = 'La fecha de publicación es requerida'
    if (!form.tipo_id)           e.tipo_id = 'Selecciona un tipo'
    setErrors(e)
    if (Object.keys(e).length > 0) {
      if (e.titulo || e.tipo_id) setTab('general')
      else if (e.resumen)        setTab('contenido')
    }
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave(form)
    onClose()
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  // ✅ Ahora sube al backend y guarda la URL, no base64
  async function handlePortadaFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)
    try {
      const url = await uploadService.uploadImagen(file)
      setField('portada_url', url)
    } catch {
      setUploadError('Error al subir la imagen. Intenta con una URL directa.')
    } finally {
      setUploading(false)
    }
  }

  const TABS = [
    { key: 'general',   label: 'General' },
    { key: 'contenido', label: 'Contenido' },
    { key: 'adjuntos',  label: 'Adjuntos' },
  ] as const

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.title}>
              {isEdit ? 'Editar publicación' : 'Nueva publicación'}
            </div>
            <div className={styles.sub}>
              {isEdit
                ? `Modificando: ${publicacion!.titulo.slice(0, 50)}${publicacion!.titulo.length > 50 ? '…' : ''}`
                : 'Completa los datos de la nueva publicación'}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* ── TAB: General ── */}
          {tab === 'general' && (
            <div className={styles.grid}>

              {/* Tipo */}
              <div className={styles.group}>
                <label className={styles.label}>Tipo *</label>
                <select
                  className={`${styles.input} ${errors.tipo_id ? styles.inputErr : ''}`}
                  value={form.tipo_id}
                  onChange={(e) => setField('tipo_id', Number(e.target.value))}
                >
                  {tipos.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
                {errors.tipo_id && <span className={styles.errMsg}>{errors.tipo_id}</span>}
              </div>

              {/* Estado */}
              <div className={styles.group}>
                <label className={styles.label}>Estado</label>
                <div className={styles.radioRow}>
                  {(['borrador', 'publicado', 'archivado'] as EstadoPublicacion[]).map((est) => (
                    <div
                      key={est}
                      className={`${styles.radioChip} ${form.estado === est ? styles[`radio_${est}`] : ''}`}
                      onClick={() => setField('estado', est)}
                    >
                      ●{' '}
                      {est === 'borrador' ? 'Borrador' : est === 'publicado' ? 'Publicado' : 'Archivado'}
                    </div>
                  ))}
                </div>
              </div>

              {/* Título */}
              <div className={`${styles.group} ${styles.full}`}>
                <label className={styles.label}>Título *</label>
                <input
                  className={`${styles.input} ${errors.titulo ? styles.inputErr : ''}`}
                  value={form.titulo}
                  onChange={(e) => setField('titulo', e.target.value)}
                  placeholder="Ej. Entrada de la Virgen de Guadalupe 2025 — programa oficial"
                />
                {errors.titulo && <span className={styles.errMsg}>{errors.titulo}</span>}
              </div>

              {/* Fecha publicación */}
              <div className={styles.group}>
                <label className={styles.label}>Fecha de publicación *</label>
                <input
                  className={`${styles.input} ${errors.fecha_publicacion ? styles.inputErr : ''}`}
                  type="date"
                  value={form.fecha_publicacion}
                  onChange={(e) => setField('fecha_publicacion', e.target.value)}
                />
                {errors.fecha_publicacion && (
                  <span className={styles.errMsg}>{errors.fecha_publicacion}</span>
                )}
              </div>

              {/* Fecha vencimiento */}
              <div className={styles.group}>
                <label className={styles.label}>
                  Fecha de vencimiento{' '}
                  <span className={styles.optional}>(opcional)</span>
                </label>
                <input
                  className={styles.input}
                  type="date"
                  value={form.fecha_vencimiento}
                  onChange={(e) => setField('fecha_vencimiento', e.target.value)}
                />
              </div>

              {/* Carrusel */}
              <div className={`${styles.group} ${styles.full}`}>
                <label className={styles.label}>Carrusel destacado</label>
                <div className={styles.carruselRow}>
                  <div
                    className={`${styles.checkChip} ${form.destacada ? styles.checkChipOn : ''}`}
                    onClick={() => setField('destacada', !form.destacada)}
                  >
                    <span className={`${styles.checkbox} ${form.destacada ? styles.checkboxOn : ''}`}>
                      {form.destacada && '✓'}
                    </span>
                    Incluir en carrusel principal
                  </div>

                  {form.destacada && (
                    <div className={styles.ordenWrap}>
                      <label className={styles.labelSmall}>Posición en carrusel</label>
                      <input
                        className={`${styles.input} ${styles.inputSmall}`}
                        type="number"
                        min={1}
                        max={10}
                        value={form.orden_carrusel || 1}
                        onChange={(e) => setField('orden_carrusel', Number(e.target.value))}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Contenido ── */}
          {tab === 'contenido' && (
            <div className={styles.grid}>
              <div className={`${styles.group} ${styles.full}`}>
                <label className={styles.label}>Resumen *</label>
                <textarea
                  className={`${styles.input} ${styles.textarea} ${errors.resumen ? styles.inputErr : ''}`}
                  rows={3}
                  value={form.resumen}
                  onChange={(e) => setField('resumen', e.target.value)}
                  placeholder="Breve descripción visible en listados y tarjetas…"
                />
                {errors.resumen && <span className={styles.errMsg}>{errors.resumen}</span>}
              </div>

              <div className={`${styles.group} ${styles.full}`}>
                <label className={styles.label}>
                  Cuerpo completo <span className={styles.optional}>(opcional)</span>
                </label>
                <textarea
                  className={`${styles.input} ${styles.textareaLg}`}
                  rows={8}
                  value={form.cuerpo}
                  onChange={(e) => setField('cuerpo', e.target.value)}
                  placeholder="Contenido completo de la publicación en texto plano o HTML…"
                />
              </div>
            </div>
          )}

          {/* ── TAB: Adjuntos ── */}
          {tab === 'adjuntos' && (
            <div className={styles.grid}>
              <div className={`${styles.group} ${styles.full}`}>
                <label className={styles.label}>
                  URL de portada <span className={styles.optional}>(opcional)</span>
                </label>
                <input
                  className={styles.input}
                  type="url"
                  value={form.portada_url}
                  onChange={(e) => setField('portada_url', e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />

                <label className={styles.label} style={{ marginTop: '0.75rem' }}>
                  O subir desde tu equipo <span className={styles.optional}>(opcional)</span>
                </label>
                <input
                  className={styles.input}
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={handlePortadaFileChange}
                />

                {/* ✅ Estados de carga y error */}
                {uploading && (
                  <p style={{ fontSize: '12px', color: '#888', marginTop: 4 }}>
                    ⏳ Subiendo imagen...
                  </p>
                )}
                {uploadError && (
                  <p style={{ fontSize: '12px', color: '#c8102e', marginTop: 4 }}>
                    ⚠️ {uploadError}
                  </p>
                )}

                {form.portada_url && !uploading && (
                  <div className={styles.previewWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.portada_url}
                      alt="Portada"
                      className={styles.preview}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                )}
              </div>

              <div className={`${styles.group} ${styles.full}`}>
                <label className={styles.label}>
                  URLs de archivos adjuntos{' '}
                  <span className={styles.optional}>(uno por línea)</span>
                </label>
                <textarea
                  className={`${styles.input} ${styles.textarea}`}
                  rows={4}
                  value={form.archivos_urls}
                  onChange={(e) => setField('archivos_urls', e.target.value)}
                  placeholder={`https://ejemplo.com/archivo1.pdf\nhttps://ejemplo.com/archivo2.pdf`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleSave}
            disabled={uploading}
          >
            {isEdit ? 'Guardar cambios' : 'Crear publicación'}
          </button>
        </div>
      </div>
    </div>
  )
}