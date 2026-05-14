import styles from '../styles/auth.module.css'

// Fondo visual reutilizable en todas las páginas de auth
export default function AuthBackground() {
  return (
    <div className={styles.bg}>
      <div className={styles.bgGradient} />
      <div className={styles.bgCircle1} />
      <div className={styles.bgCircle2} />
      <div className={styles.bgCircle3} />
      <div className={styles.bgDots} />
      <div className={styles.bgLines} />
      <div className={styles.bgNoise} />
      <div className={styles.bgShield}>🏛️</div>
    </div>
  )
}