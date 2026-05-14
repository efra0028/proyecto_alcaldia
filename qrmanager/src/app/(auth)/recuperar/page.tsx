'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRecuperar } from '../hooks/useAuth'
import AuthBackground from '../components/AuthBackground'
import styles from '../styles/auth.module.css'

// ── Paso 1 ───────────────────────────────────────────────────────────────────
function PasoEmail({ onEnviar, cargando, error }: {
  onEnviar: (e: string) => void; cargando: boolean; error: string
}) {
  const [email, setEmail] = useState('')
  const [err, setErr]     = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setErr('El correo es obligatorio'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setErr('Correo inválido'); return }
    setErr(''); onEnviar(email)
  }

  return (
    <>
      <div className={styles.cardTopTitle}>Recuperar acceso</div>
      <div className={styles.cardTopSub}>Te enviaremos un código de verificación</div>

      <div className={styles.cardBody}>
        {error && <div className={styles.alertError}><span>⚠️</span><span>{error}</span></div>}

        <div className={styles.demoHint}>
          <span>ℹ️</span>
          <span>Demo: usa cualquier correo válido para continuar</span>
        </div>

        <form onSubmit={submit} noValidate>
          <div className={styles.formGroup}>
            <label className={styles.label}>CORREO INSTITUCIONAL</label>
            <input
              type="email"
              className={`${styles.input} ${err ? styles.error : ''}`}
              placeholder="usuario@gams.gob.bo"
              value={email}
              autoComplete="email"
              onChange={e => { setEmail(e.target.value); setErr('') }}
            />
            {err && <div className={styles.errorMsg}>⚠ {err}</div>}
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={cargando}>
            {cargando && <div className={styles.spinner} />}
            {cargando ? 'Enviando...' : 'Enviar código de verificación'}
          </button>
        </form>

        <Link href="../login/" className={styles.btnSecondary}>
          ← Volver al inicio de sesión
        </Link>
      </div>
    </>
  )
}

// ── Paso 2 ───────────────────────────────────────────────────────────────────
function PasoCodigo({ onVerificar, cargando, error }: {
  onVerificar: (c: string) => void; cargando: boolean; error: string
}) {
  const [codigo, setCodigo] = useState('')
  const [err, setErr]       = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (codigo.length !== 6) { setErr('El código debe tener 6 dígitos'); return }
    setErr(''); onVerificar(codigo)
  }

  return (
    <>
      <div className={styles.cardTopTitle}>Revisa tu correo</div>
      <div className={styles.cardTopSub}>Ingresa el código de 6 dígitos que enviamos</div>

      <div className={styles.cardBody}>
        {error && <div className={styles.alertError}><span>⚠️</span><span>{error}</span></div>}

        <div className={styles.demoHint}>
          <span>ℹ️</span>
          <span>Demo: usa el código <strong>123456</strong></span>
        </div>

        <form onSubmit={submit} noValidate>
          <div className={styles.formGroup}>
            <label className={styles.label}>CÓDIGO DE VERIFICACIÓN</label>
            <input
              className={`${styles.input} ${styles.otpInput} ${err ? styles.error : ''}`}
              placeholder="000000"
              value={codigo}
              maxLength={6}
              inputMode="numeric"
              onChange={e => {
                setCodigo(e.target.value.replace(/\D/g, ''))
                setErr('')
              }}
            />
            {err && <div className={styles.errorMsg}>⚠ {err}</div>}
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={cargando}>
            {cargando && <div className={styles.spinner} />}
            {cargando ? 'Verificando...' : 'Verificar código'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 12.5, color: '#9B9992' }}>
          ¿No recibiste el código?{' '}
          <button className={styles.linkSmall}>Reenviar</button>
        </div>
      </div>
    </>
  )
}

// ── Paso 3 ───────────────────────────────────────────────────────────────────
function PasoNuevaPass({ onReset, cargando, error }: {
  onReset: (p: string) => void; cargando: boolean; error: string
}) {
  const [pass, setPass]     = useState('')
  const [conf, setConf]     = useState('')
  const [ver, setVer]       = useState(false)
  const [exito, setExito]   = useState(false)
  const [errores, setEr]    = useState<{ pass?: string; conf?: string }>({})

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err: typeof errores = {}
    if (!pass || pass.length < 8)     err.pass = 'Mínimo 8 caracteres'
    else if (!/[A-Z]/.test(pass))     err.pass = 'Debe incluir una mayúscula'
    else if (!/[0-9]/.test(pass))     err.pass = 'Debe incluir un número'
    if (conf !== pass)                err.conf = 'Las contraseñas no coinciden'
    setEr(err)
    if (Object.keys(err).length) return
    await onReset(pass)
    setExito(true)
  }

  if (exito) return (
    <>
      <div className={styles.cardTopTitle}>¡Contraseña actualizada!</div>
      <div className={styles.cardTopSub}>Tu cuenta está lista para acceder</div>
      <div className={styles.cardBody}>
        <div className={styles.successState}>
          <div className={styles.successIcon}>🎉</div>
          <div className={styles.successTitle}>Contraseña cambiada</div>
          <div className={styles.successDesc}>
            Tu contraseña fue actualizada exitosamente.<br />
            Ya puedes iniciar sesión con tus nuevas credenciales.
          </div>
          <Link href="/admin/login" className={styles.btnSubmit}
            style={{ textDecoration: 'none', display: 'flex' }}>
            Ir al inicio de sesión →
          </Link>
        </div>
      </div>
    </>
  )

  return (
    <>
      <div className={styles.cardTopTitle}>Nueva contraseña</div>
      <div className={styles.cardTopSub}>Elige una contraseña segura para tu cuenta</div>

      <div className={styles.cardBody}>
        {error && <div className={styles.alertError}><span>⚠️</span><span>{error}</span></div>}

        <form onSubmit={submit} noValidate>
          <div className={styles.formGroup}>
            <label className={styles.label}>NUEVA CONTRASEÑA</label>
            <div className={styles.inputWrap}>
              <input
                type={ver ? 'text' : 'password'}
                className={`${styles.input} ${errores.pass ? styles.error : ''}`}
                placeholder="Mín. 8 caracteres, mayúscula y número"
                value={pass}
                autoComplete="new-password"
                onChange={e => { setPass(e.target.value); setEr(p => ({ ...p, pass: '' })) }}
              />
              <button type="button" className={styles.inputIcon}
                onClick={() => setVer(v => !v)} tabIndex={-1}>
                {ver ? '🙈' : '👁️'}
              </button>
            </div>
            {errores.pass && <div className={styles.errorMsg}>⚠ {errores.pass}</div>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>CONFIRMAR CONTRASEÑA</label>
            <input
              type={ver ? 'text' : 'password'}
              className={`${styles.input} ${errores.conf ? styles.error : ''}`}
              placeholder="Repite la contraseña"
              value={conf}
              autoComplete="new-password"
              onChange={e => { setConf(e.target.value); setEr(p => ({ ...p, conf: '' })) }}
            />
            {errores.conf && <div className={styles.errorMsg}>⚠ {errores.conf}</div>}
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={cargando}
            style={{ marginTop: 4 }}>
            {cargando && <div className={styles.spinner} />}
            {cargando ? 'Guardando...' : 'Guardar nueva contraseña'}
          </button>
        </form>
      </div>
    </>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function RecuperarPage() {
  const { enviarEmail, verificarCodigo, resetPassword, cargando, error, paso } = useRecuperar()

  const pasos = [
    { n: 1, label: 'Correo' },
    { n: 2, label: 'Código' },
    { n: 3, label: 'Nueva contraseña' },
  ]

  return (
    <div className={styles.screen}>
      <AuthBackground />

      <div className={styles.card}>
        {/* Banda roja */}
        <div className={styles.cardTop}>
          <div className={styles.cardTopDeco1} />
          <div className={styles.cardTopDeco2} />

          {/* Logo */}
          <div className={styles.cardLogo}>
            <div className={styles.cardLogoIcon}>🏛️</div>
            <div className={styles.cardLogoText}>
              <div className={styles.cardLogoName}>QR-Manager · GAMS</div>
              <div className={styles.cardLogoSub}>Gobierno Autónomo Municipal de Sucre</div>
            </div>
          </div>

          {/* Indicador de pasos */}
          <div className={styles.stepBar}>
            {pasos.map((p, i) => (
              <>
                <div
                  key={p.n}
                  className={`${styles.stepItem} ${paso === p.n ? styles.active : ''} ${paso > p.n ? styles.done : ''}`}
                >
                  <div className={styles.stepCircle}>
                    {paso > p.n ? '✓' : p.n}
                  </div>
                  <span>{p.label}</span>
                </div>
                {i < pasos.length - 1 && (
                  <div
                    key={`c-${i}`}
                    className={`${styles.stepConnector} ${paso > p.n ? styles.done : ''}`}
                  />
                )}
              </>
            ))}
          </div>

          {/* Título dinámico según paso — lo renderiza cada sub-componente */}
        </div>

        {/* Pasos */}
        {paso === 1 && <PasoEmail      onEnviar={enviarEmail}        cargando={cargando} error={error} />}
        {paso === 2 && <PasoCodigo     onVerificar={verificarCodigo} cargando={cargando} error={error} />}
        {paso === 3 && <PasoNuevaPass  onReset={resetPassword}       cargando={cargando} error={error} />}
      </div>
    </div>
  )
}