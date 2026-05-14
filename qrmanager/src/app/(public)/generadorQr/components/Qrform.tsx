// src/app/(public)/qr-generator/components/QrForm.tsx
'use client';

import { PRESET_COLORS, SIZE_OPTIONS, ERROR_CORRECTION_LABELS } from '../utils/qr';
import type { UseQrGeneratorReturn, ErrorCorrection } from '../hooks/useQrGenerator';
import styles from '../page.module.css';

interface Props {
  hook: UseQrGeneratorReturn;
}

export default function QrForm({ hook }: Props) {
  const {
    options,
    urlInput,
    urlError,
    setUrlInput,
    handleUrlBlur,
    setFgColor,
    setBgColor,
    setSize,
    setErrorCorrection,
    setIncludeMargin,
    setLogoUrl,
    setLogoSize,
    applyPreset,
  } = hook;

  return (
    <div className={styles.formPanel}>
      {/* URL */}
      <section className={styles.formSection}>
        <label className={styles.formLabel}>
          <span className={styles.formLabelText}>URL de destino</span>
          <span className={styles.formLabelRequired}>*</span>
        </label>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </span>
          <input
            type="url"
            className={`${styles.input} ${urlError ? styles.inputError : ''}`}
            placeholder="https://www.sucre.gob.bo"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onBlur={handleUrlBlur}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        {urlError && <p className={styles.inputErrorMsg}>{urlError}</p>}
        <p className={styles.inputHint}>El QR redirigirá a esta URL cuando se escanee.</p>
      </section>

      {/* Presets de color */}
      <section className={styles.formSection}>
        <label className={styles.formLabel}>
          <span className={styles.formLabelText}>Esquema de color</span>
        </label>
        <div className={styles.presetGrid}>
          {PRESET_COLORS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p.fg, p.bg)}
              className={`${styles.presetBtn} ${options.fgColor === p.fg && options.bgColor === p.bg ? styles.presetBtnActive : ''}`}
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
      </section>

      {/* Colores personalizados */}
      <section className={styles.formSection}>
        <label className={styles.formLabel}>
          <span className={styles.formLabelText}>Colores personalizados</span>
        </label>
        <div className={styles.colorRow}>
          <div className={styles.colorPicker}>
            <span className={styles.colorLabel}>Primer plano</span>
            <div className={styles.colorInputWrap}>
              <input
                type="color"
                value={options.fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className={styles.colorInput}
              />
              <span className={styles.colorHex}>{options.fgColor.toUpperCase()}</span>
            </div>
          </div>
          <div className={styles.colorPicker}>
            <span className={styles.colorLabel}>Fondo</span>
            <div className={styles.colorInputWrap}>
              <input
                type="color"
                value={options.bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className={styles.colorInput}
              />
              <span className={styles.colorHex}>{options.bgColor.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tamaño de exportación */}
      <section className={styles.formSection}>
        <label className={styles.formLabel}>
          <span className={styles.formLabelText}>Tamaño de exportación</span>
        </label>
        <div className={styles.sizeGrid}>
          {SIZE_OPTIONS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSize(s.value)}
              className={`${styles.sizeBtn} ${options.size === s.value ? styles.sizeBtnActive : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* Corrección de errores */}
      <section className={styles.formSection}>
        <label className={styles.formLabel}>
          <span className={styles.formLabelText}>Corrección de errores</span>
        </label>
        <p className={styles.inputHint} style={{ marginBottom: '10px' }}>
          Mayor corrección permite añadir logo sin perder escaneo.
        </p>
        <div className={styles.ecGrid}>
          {(Object.entries(ERROR_CORRECTION_LABELS) as [ErrorCorrection, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setErrorCorrection(key)}
              className={`${styles.ecBtn} ${options.errorCorrection === key ? styles.ecBtnActive : ''}`}
            >
              <span className={styles.ecKey}>{key}</span>
              <span className={styles.ecLabel}>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Logo */}
      <section className={styles.formSection}>
        <label className={styles.formLabel}>
          <span className={styles.formLabelText}>Logo central</span>
          <span className={styles.formLabelOptional}>opcional</span>
        </label>
        <input
          type="url"
          className={styles.input}
          placeholder="/sede.ico  (por defecto)"
          value={options.logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          spellCheck={false}
        />
        {options.logoUrl && (
          <div className={styles.sliderRow}>
            <span className={styles.sliderLabel}>Tamaño logo</span>
            <input
              type="range"
              min={8}
              max={30}
              value={options.logoSize}
              onChange={(e) => setLogoSize(Number(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.sliderValue}>{options.logoSize}%</span>
          </div>
        )}
      </section>

      {/* Opciones adicionales */}
      <section className={styles.formSection}>
        <label className={styles.formLabel}>
          <span className={styles.formLabelText}>Opciones adicionales</span>
        </label>

        {/* Margen */}
        <div className={styles.toggleRow}>
          <div>
            <p className={styles.toggleTitle}>Incluir margen (quiet zone)</p>
            <p className={styles.toggleDesc}>Espacio blanco alrededor del QR, recomendado para impresión.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={options.includeMargin}
            onClick={() => setIncludeMargin(!options.includeMargin)}
            className={`${styles.toggle} ${options.includeMargin ? styles.toggleOn : ''}`}
          >
            <span className={styles.toggleThumb} />
          </button>
        </div>
      </section>
    </div>
  );
}