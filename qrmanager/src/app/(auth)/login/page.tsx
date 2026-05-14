'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLogin } from '../hooks/useAuth'
import AuthBackground from '../components/AuthBackground'
import styles from '../styles/auth.module.css'

export default function LoginPage() {
  const { login, cargando, error } = useLogin()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [verPass, setVerPass]   = useState(false)
  const [recordar, setRecordar] = useState(false)
  const [errores, setErrores]   = useState<{ email?: string; password?: string }>({})

  const validar = () => {
    const e: typeof errores = {}
    if (!email)                            e.email    = 'El correo es obligatorio'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Correo inválido'
    if (!password)                         e.password = 'La contraseña es obligatoria'
    else if (password.length < 6)          e.password = 'Mínimo 6 caracteres'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validar()) login(email, password)
  }

  return (
    <div className={styles.screen}>
      <AuthBackground />

      <div className={styles.card}>
        {/* ── Banda roja superior ── */}
        <div className={styles.cardTop}>
          <div className={styles.cardTopDeco1} />
          <div className={styles.cardTopDeco2} />

          <div className={styles.cardLogo}>
            <div className={styles.cardLogoIcon}>🏛️</div>
            <div className={styles.cardLogoText}>
              <div className={styles.cardLogoName}>QR-Manager · GAMS</div>
              <div className={styles.cardLogoSub}>Gobierno Autónomo Municipal de Sucre</div>
            </div>
          </div>

          <div className={styles.cardTopTitle}>Bienvenido de vuelta</div>
          <div className={styles.cardTopSub}>Acceso exclusivo para personal autorizado</div>
        </div>

        {/* ── Cuerpo ── */}
        <div className={styles.cardBody}>

          {error && (
            <div className={styles.alertError}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Demo hint — quitar en producción */}
          <div className={styles.demoHint}>
            <span>🔑</span>
            <span><strong>Demo:</strong> admin@gams.gob.bo · Admin2024</span>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.label}>CORREO INSTITUCIONAL</label>
              <div className={styles.inputWrap}>
                <input
                  type="email"
                  className={`${styles.input} ${errores.email ? styles.error : ''}`}
                  placeholder="usuario@gams.gob.bo"
                  value={email}
                  autoComplete="email"
                  onChange={e => {
                    setEmail(e.target.value)
                    setErrores(p => ({ ...p, email: '' }))
                  }}
                />
              </div>
              {errores.email && <div className={styles.errorMsg}>⚠ {errores.email}</div>}
            </div>

            {/* Contraseña */}
            <div className={styles.formGroup}>
              <label className={styles.label}>CONTRASEÑA</label>
              <div className={styles.inputWrap}>
                <input
                  type={verPass ? 'text' : 'password'}
                  className={`${styles.input} ${errores.password ? styles.error : ''}`}
                  placeholder="••••••••"
                  value={password}
                  autoComplete="current-password"
                  onChange={e => {
                    setPassword(e.target.value)
                    setErrores(p => ({ ...p, password: '' }))
                  }}
                />
                <button
                  type="button"
                  className={styles.inputIcon}
                  onClick={() => setVerPass(v => !v)}
                  tabIndex={-1}
                >
                  {verPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errores.password && <div className={styles.errorMsg}>⚠ {errores.password}</div>}
            </div>

            {/* Recordarme / olvidé */}
            <div className={styles.rowExtra}>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={recordar}
                  onChange={e => setRecordar(e.target.checked)}
                />
                Recordar sesión
              </label>
              <Link href="../recuperar/" className={styles.linkSmall}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" className={styles.btnSubmit} disabled={cargando}>
              {cargando && <div className={styles.spinner} />}
              {cargando ? 'Verificando credenciales...' : 'Ingresar al panel →'}
            </button>
          </form>

          <div className={styles.cardFooter}>
            Portal de uso exclusivo · Personal GAMS<br />
            Problemas de acceso: <strong>soporte@gams.gob.bo</strong>
          </div>
        </div>
      </div>
    </div>
  )
}