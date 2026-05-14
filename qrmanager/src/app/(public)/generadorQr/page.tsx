// src/app/(public)/generadorQr/page.tsx
'use client';

import SiteFooter from '../components/SiteFooter';
import QrForm from '../generadorQr/components/Qrform';
import QrPreview from '../generadorQr/components/Qrpreview';
import QrSteps from '../generadorQr/components/Qrsteps';
import { useQrGenerator } from './hooks/useQrGenerator';
import styles from './page.module.css';

export default function QrGeneratorPage() {
  const hook = useQrGenerator();

  return (
    <>
      <main>
        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroEyebrow}>
              <span className={styles.heroEyebrowLine} />
              Generador de QR
              <span className={styles.heroEyebrowLine} />
            </div>
            <h1 className={styles.heroTitle}>
              Crea tu <em>código QR</em><br />en segundos
            </h1>
            <p className={styles.heroSub}>
              Genera QRs personalizados con los colores de la Alcaldía de Sucre,
              en alta resolución y listos para impresión. Sin registros ni costos.
            </p>
          </div>
        </section>

        {/* ── Builder ── */}
        <section className={styles.builder}>
          <div className={styles.builderInner}>
            {/* Columna formulario */}
            <QrForm hook={hook} />

            {/* Columna preview — sticky */}
            <div className={styles.previewColumn}>
              <QrPreview hook={hook} />
            </div>
          </div>
        </section>

        {/* ── Cómo funciona ── */}
        <QrSteps />

        {/* ── CTA banner ── */}
        <section className={styles.content}>
          <div className={styles.ctaBanner}>
            <div className={styles.ctaBannerText}>
              <h3>¿Necesitas QRs para un servicio municipal?</h3>
              <p>
                El sistema QR-Manager de GAMS permite vincular códigos con registros
                verificables del municipio. Contacta al área de sistemas.
              </p>
            </div>
            <a href="/servicios" className={styles.ctaBannerBtn}>
              Ver servicios municipales
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}