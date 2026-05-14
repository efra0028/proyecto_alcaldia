'use client'

import { useState } from 'react'
import type { Usuario, UsuarioFormData, FormErrors } from '../types'
import { ROLES, SISTEMAS, ROL_META } from '../data/constants'
import styles from './UsuarioModal.module.css'

interface Props {
  usuario: Usuario | null   // null = crear, objeto = editar
  onClose: () => void
  onSave: (form: UsuarioFormData) => void
}

const EMPTY_FORM: UsuarioFormData = {
  nombre: '',
  email: '',
  rol: 'operador',
  estado: 'activo',
  sistemas: [],
  password: '',
}

export default function UsuarioModal({ usuario, onClose, onSave }: Props) {
  const isEdit = !!usuario

  const [form, setForm] = useState<UsuarioFormData>(
    isEdit
      ? { ...usuario, password: '' }
      : EMPTY_FORM,
  )
  const [errors, setErrors] = useState<FormErrors>({})

  function setField<K extends keyof UsuarioFormData>(key: K, val: UsuarioFormData[K]) {
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function toggleSistema(s: string) {
    const next = form.sistemas.includes(s)
      ? form.sistemas.filter((x) => x !== s)
      : [...form.sistemas, s]
    setField('sistemas', next)
  }

  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido'
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Ingresa un email válido'
    if (!isEdit && !form.password.trim()) e.password = 'La contraseña es requerida'
    if (form.sistemas.length === 0) e.sistemas = 'Selecciona al menos un sistema'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave(isEdit ? { ...form, id: usuario!.id } : form)
  }

  // Close on backdrop click
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
              {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
            </div>
            <div className={styles.sub}>
              {isEdit
                ? `Modificando: ${usuario!.nombre}`
                : 'Completa los datos del nuevo funcionario'}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <div className={styles.grid}>

            {/* Nombre */}
            <div className={`${styles.group} ${styles.full}`}>
              <label className={styles.label}>Nombre completo *</label>
              <input
                className={`${styles.input} ${errors.nombre ? styles.inputErr : ''}`}
                value={form.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
                placeholder="Ej. María Fernanda Rojas"
              />
              {errors.nombre && <span className={styles.errMsg}>{errors.nombre}</span>}
            </div>

            {/* Email */}
            <div className={styles.group}>
              <label className={styles.label}>Correo institucional *</label>
              <input
                className={`${styles.input} ${errors.email ? styles.inputErr : ''}`}
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="usuario@sucre.gob.bo"
              />
              {errors.email && <span className={styles.errMsg}>{errors.email}</span>}
            </div>

            {/* Rol */}
            <div className={styles.group}>
              <label className={styles.label}>Rol *</label>
              <select
                className={styles.input}
                value={form.rol}
                onChange={(e) => setField('rol', e.target.value as UsuarioFormData['rol'])}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{ROL_META[r].label}</option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div className={`${styles.group} ${styles.full}`}>
              <label className={styles.label}>
                {isEdit
                  ? 'Nueva contraseña (dejar vacío para no cambiar)'
                  : 'Contraseña *'}
              </label>
              <input
                className={`${styles.input} ${errors.password ? styles.inputErr : ''}`}
                type="password"
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
                placeholder={isEdit ? '••••••••' : 'Mínimo 8 caracteres'}
              />
              {errors.password && <span className={styles.errMsg}>{errors.password}</span>}
            </div>

            {/* Sistemas */}
            <div className={`${styles.group} ${styles.full}`}>
              <label className={styles.label}>
                Sistemas con acceso *{' '}
                {errors.sistemas && (
                  <span className={styles.errMsg}>{errors.sistemas}</span>
                )}
              </label>
              <div className={styles.checkGrid}>
                {SISTEMAS.map((s) => {
                  const on = form.sistemas.includes(s)
                  return (
                    <div
                      key={s}
                      className={`${styles.checkChip} ${on ? styles.checkChipOn : ''}`}
                      onClick={() => toggleSistema(s)}
                    >
                      <span className={`${styles.checkbox} ${on ? styles.checkboxOn : ''}`}>
                        {on && '✓'}
                      </span>
                      {s}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Estado — solo editar */}
            {isEdit && (
              <div className={`${styles.group} ${styles.full}`}>
                <label className={styles.label}>Estado</label>
                <div className={styles.radioRow}>
                  {(['activo', 'suspendido'] as const).map((est) => (
                    <div
                      key={est}
                      className={`${styles.radioChip} ${form.estado === est ? (est === 'activo' ? styles.radioActive : styles.radioSuspend) : ''}`}
                      onClick={() => setField('estado', est)}
                    >
                      ● {est === 'activo' ? 'Activo' : 'Suspendido'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.btnPrimary} onClick={handleSave}>
            {isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </div>
      </div>
    </div>
  )
}
