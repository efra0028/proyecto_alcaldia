// src/app/(public)/qr-generator/components/QrSteps.tsx
import styles from '../page.module.css';

const STEPS = [
  {
    number: '01',
    title: 'Ingresa tu URL',
    desc: 'Pega el enlace al que quieres que el QR redirija. Puede ser cualquier dirección web válida.',
  },
  {
    number: '02',
    title: 'Personaliza el diseño',
    desc: 'Elige colores, agrega tu logo y ajusta el tamaño para obtener el QR que necesitas.',
  },
  {
    number: '03',
    title: 'Descarga en alta resolución',
    desc: 'Exporta en PNG o JPEG hasta 2048 px, listo para impresión digital o física.',
  },
];

export default function QrSteps() {
  return (
    <section className={styles.stepsSection}>
      <div className={styles.stepsHeader}>
        <p className={styles.sectionLabel}>¿Cómo funciona?</p>
        <h2 className={styles.sectionHeading}>
          Tres pasos para tu <em>QR profesional</em>
        </h2>
        <p className={styles.sectionDesc}>
          Sin registros ni cuentas. Genera QRs de alta calidad directamente en tu navegador.
        </p>
      </div>
      <div className={styles.stepsGrid}>
        {STEPS.map((step) => (
          <div key={step.number} className={styles.stepCard}>
            <span className={styles.stepNumber}>{step.number}</span>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDesc}>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}