'use client'
import { useState } from 'react'
import type { Sistema, SistemaFormData, FormErrors } from '../types'
import { COLORES_PRESET } from '../data/constants'
import styles from './SistemaModal.module.css'

interface Props {
  sistema: Sistema | null
  onClose: () => void
  onSave: (form: SistemaFormData) => void
}

const EMPTY_FORM: SistemaFormData = {
  nombre: '',
  descripcion: '',
  color_hex: '#BE2D26',
  logo_url: '',
  schema_campos: null,
}

export default function SistemaModal({ sistema, onClose, onSave }: Props) {
  const isEdit = !!sistema

  const [form, setForm] = useState<SistemaFormData>(
    isEdit
      ? {
          id: sistema!.id,
          nombre: sistema!.nombre,
          descripcion: sistema!.descripcion,
          color_hex: sistema!.color_hex || '#BE2D26',
          logo_url: sistema!.logo_url || '',
          schema_campos: sistema!.schema_campos,
        }
      : EMPTY_FORM,
  )
  const [errors, setErrors] = useState<FormErrors>({})

  function setField<K extends keyof SistemaFormData>(key: K, val: SistemaFormData[K]) {
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido'
    if (form.color_hex && !/^#[0-9A-Fa-f]{6}$/.test(form.color_hex))
      e.color_hex = 'Color HEX inválido (ej. #3B82F6)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave(isEdit ? { ...form, id: sistema!.id } : form)
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
            <div className={styles.title}>
              {isEdit ? 'Editar sistema' : 'Nuevo sistema'}
            </div>
            <div className={styles.sub}>
              {isEdit
                ? `Modificando: ${sistema!.nombre}`
                : 'Completa los datos del nuevo sistema'}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <div className={styles.grid}>

            {/* Nombre */}
            <div className={`${styles.group} ${styles.full}`}>
              <label className={styles.label}>Nombre del sistema *</label>
              <input
                className={`${styles.input} ${errors.nombre ? styles.inputErr : ''}`}
                value={form.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
                placeholder="Ej. Taxi Seguro"
              />
              {errors.nombre && <span className={styles.errMsg}>{errors.nombre}</span>}
            </div>

            {/* Descripción */}
            <div className={`${styles.group} ${styles.full}`}>
              <label className={styles.label}>Descripción</label>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                value={form.descripcion}
                onChange={(e) => setField('descripcion', e.target.value)}
                placeholder="Descripción breve del sistema…"
                rows={3}
              />
            </div>

            {/* Color HEX */}
            <div className={styles.group}>
              <label className={styles.label}>Color identificador</label>
              <div className={styles.colorRow}>
                <input
                  className={`${styles.input} ${styles.colorInput} ${errors.color_hex ? styles.inputErr : ''}`}
                  value={form.color_hex}
                  onChange={(e) => setField('color_hex', e.target.value)}
                  placeholder="#BE2D26"
                  maxLength={7}
                />
                <div
                  className={styles.colorPreview}
                  style={{ background: /^#[0-9A-Fa-f]{6}$/.test(form.color_hex) ? form.color_hex : '#e4e0db' }}
                />
              </div>
              {errors.color_hex && <span className={styles.errMsg}>{errors.color_hex}</span>}
              <div className={styles.colorPalette}>
                {COLORES_PRESET.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`${styles.colorSwatch} ${form.color_hex === c ? styles.colorSwatchActive : ''}`}
                    style={{ background: c }}
                    onClick={() => setField('color_hex', c)}
                  />
                ))}
              </div>
            </div>

            {/* Logo URL */}
            <div className={styles.group}>
              <label className={styles.label}>URL del logo</label>
              <input
                className={styles.input}
                value={form.logo_url}
                onChange={(e) => setField('logo_url', e.target.value)}
                placeholder="https://cdn.gams.gob.bo/logos/…"
              />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
          <button className={styles.btnPrimary} onClick={handleSave}>
            {isEdit ? 'Guardar cambios' : 'Crear sistema'}
          </button>
        </div>
      </div>
    </div>
  )
}