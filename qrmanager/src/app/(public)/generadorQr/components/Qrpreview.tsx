// src/app/(public)/qr-generator/components/QrPreview.tsx
'use client';

import { useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import type { UseQrGeneratorReturn } from '../hooks/useQrGenerator';
import type { QrFormat } from '../utils/qr';
import styles from '../page.module.css';

interface Props {
  hook: UseQrGeneratorReturn;
}

const PREVIEW_SIZE = 280;

export default function QrPreview({ hook }: Props) {
  const { options, isReady, registerCanvas, handleDownload, handleCopyUrl, copied } = hook;
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Registra el canvas del QR en el hook cuando cambia
  useEffect(() => {
    if (!wrapperRef.current) return;
    const canvas = wrapperRef.current.querySelector('canvas');
    registerCanvas(canvas);
    return () => registerCanvas(null);
  });

  const formats: { label: string; format: QrFormat; icon: string }[] = [
    { label: 'PNG', format: 'png', icon: '↓' },
    { label: 'JPEG', format: 'jpeg', icon: '↓' },
  ];

  return (
    <div className={styles.previewPanel}>
      {/* Badge */}
      <div className={styles.previewEyebrow}>
        <span className={styles.previewDot} />
        Vista previa del QR
      </div>

      {/* QR Box */}
      <div
        className={`${styles.qrBox} ${isReady ? styles.qrBoxReady : ''}`}
        style={{ background: options.bgColor }}
        ref={wrapperRef}
      >
        {isReady ? (
          <div className={styles.qrInner}>
            <QRCodeCanvas
              value={options.url}
              size={PREVIEW_SIZE}
              fgColor={options.fgColor}
              bgColor={options.bgColor}
              level={options.errorCorrection}
              includeMargin={options.includeMargin}
              imageSettings={
                options.logoUrl
                  ? {
                      src: options.logoUrl,
                      height: Math.round(PREVIEW_SIZE * (options.logoSize / 100)),
                      width: Math.round(PREVIEW_SIZE * (options.logoSize / 100)),
                      excavate: true,
                    }
                  : undefined
              }
            />
          </div>
        ) : (
          <div className={styles.qrPlaceholder}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <rect x="4" y="4" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.25"/>
              <rect x="9" y="9" width="14" height="14" rx="1" fill="currentColor" opacity="0.15"/>
              <rect x="36" y="4" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.25"/>
              <rect x="41" y="9" width="14" height="14" rx="1" fill="currentColor" opacity="0.15"/>
              <rect x="4" y="36" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.25"/>
              <rect x="9" y="41" width="14" height="14" rx="1" fill="currentColor" opacity="0.15"/>
              <rect x="36" y="40" width="4" height="4" rx="1" fill="currentColor" opacity="0.2"/>
              <rect x="44" y="40" width="4" height="4" rx="1" fill="currentColor" opacity="0.2"/>
              <rect x="52" y="40" width="8" height="4" rx="1" fill="currentColor" opacity="0.2"/>
              <rect x="36" y="48" width="8" height="4" rx="1" fill="currentColor" opacity="0.2"/>
              <rect x="48" y="48" width="4" height="4" rx="1" fill="currentColor" opacity="0.2"/>
              <rect x="36" y="56" width="4" height="4" rx="1" fill="currentColor" opacity="0.2"/>
              <rect x="44" y="56" width="12" height="4" rx="1" fill="currentColor" opacity="0.2"/>
            </svg>
            <p>Ingresa una URL para<br/>generar el QR</p>
          </div>
        )}
      </div>

      {/* Meta info cuando hay QR */}
      {isReady && (
        <div className={styles.previewMeta}>
          <div className={styles.previewMetaRow}>
            <span>Tamaño exportación</span>
            <strong>{options.size} × {options.size} px</strong>
          </div>
          <div className={styles.previewMetaRow}>
            <span>Corrección</span>
            <strong>Nivel {options.errorCorrection}</strong>
          </div>
          <div className={styles.previewMetaRow}>
            <span>Logo</span>
            <strong>{options.logoUrl ? 'Sí' : 'No'}</strong>
          </div>
        </div>
      )}

      {/* URL destino */}
      {isReady && (
        <div className={styles.previewUrl}>
          <span className={styles.previewUrlLabel}>URL destino</span>
          <div className={styles.previewUrlRow}>
            <code className={styles.previewUrlCode}>{options.url}</code>
            <button
              type="button"
              onClick={handleCopyUrl}
              className={styles.copyBtn}
              title="Copiar URL"
            >
              {copied ? '✓' : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Descargar */}
      <div className={styles.downloadSection}>
        <p className={styles.downloadLabel}>
          {isReady ? `Descargar a ${options.size}px` : 'Descarga disponible cuando ingreses una URL'}
        </p>
        <div className={styles.downloadBtns}>
          {formats.map(({ label, format }) => (
            <button
              key={format}
              type="button"
              disabled={!isReady}
              onClick={() => handleDownload(format)}
              className={`${styles.downloadBtn} ${label === 'PNG' ? styles.downloadBtnPrimary : styles.downloadBtnSecondary}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Nota */}
      <p className={styles.previewNote}>
        El QR se genera localmente en tu navegador. Ningún dato es enviado a servidores externos.
      </p>
    </div>
  );
}