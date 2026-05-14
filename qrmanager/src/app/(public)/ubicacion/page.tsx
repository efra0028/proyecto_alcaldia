// src/app/ubicacion/page.tsx
"use client";

import Link from "next/link";
import SiteFooter from "../components/SiteFooter";
import styles from "./page.module.css";
import { Office, OfficeHour, Transport } from "./types";
import { OfficeCard } from "./components/OfficeCard";
import { HoursTable } from "./components/HoursTable";
import { TransportCard } from "./components/TransportCard";

// ─── Datos (importados de services o definidos aquí) ──────────────────────────
// Estos deberían venir de ../../app/lib/services
const OFFICES: Office[] = [
  {
    id: 1,
    name: "Alcaldía Municipal de Sucre",
    dept: "Sede Central - Gobierno Autónomo Municipal",
    address: "Plaza 25 de Mayo N° 1",
    reference: "Frente a la Catedral Metropolitana",
    hours: "Lun a Vie: 08:00 - 15:00",
    phone: "591 4 644 2222",
    isMain: true,
  },
  {
    id: 2,
    name: "Oficina de Atención al Ciudadano",
    dept: "Dirección de Transparencia y Gestión",
    address: "Calle España N° 245",
    hours: "Lun a Vie: 08:30 - 16:30",
    phone: "591 4 644 2233",
  },
  {
    id: 3,
    name: "Dirección de Tránsito",
    dept: "Unidad de Movilidad Urbana",
    address: "Av. Hernando Siles N° 567",
    reference: "Esquina Calle Potosí",
    hours: "Lun a Vie: 08:00 - 14:00",
    phone: "591 4 644 2244",
  },
];

const OFFICE_HOURS: OfficeHour[] = [
  { day: "Lunes a Viernes", time: "08:00 - 15:00" },
  { day: "Sábado", time: "09:00 - 12:00" },
  { day: "Domingo", time: "Cerrado" },
];

const TRANSPORT: Transport[] = [
  {
    icon: "🚌",
    name: "Microbus / Trufi",
    desc: "Líneas que pasan por Plaza 25 de Mayo: 2, 5, 7, 9, 11, 14",
  },
  {
    icon: "🚕",
    name: "Taxi",
    desc: "Taxis registrados en el municipio disponibles en toda la ciudad",
  },
  {
    icon: "🚶",
    name: "A pie",
    desc: "La sede central está en el corazón del centro histórico, a pocas cuadras de todo",
  },
];

export default function UbicacionPage() {
  return (
    <>
      {/* PAGE HERO */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowLine} />
            Portal GAMS · Oficinas
          </div>
          <h1 className={styles.heroTitle}>
            <em>Dónde</em> encontrarnos
          </h1>
          <p className={styles.heroSub}>
            Las oficinas municipales de Sucre están distribuidas en el centro histórico de la ciudad.
            Aquí encontrarás direcciones, horarios y cómo llegar a cada una.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {/* — OFICINAS — */}
        <div style={{ marginBottom: "56px" }}>
          <div className={styles.sectionLabel}>Nuestras oficinas</div>
          <h2 className={styles.sectionHeading}>
            Puntos de <em>atención</em>
          </h2>
          <p className={styles.sectionDesc}>
            Todas las oficinas se encuentran en la ciudad de Sucre, Bolivia.
            La sede central es la Alcaldía Municipal en la Plaza 25 de Mayo.
          </p>

          <div className={styles.officesGrid}>
            {OFFICES.map((office) => (
              <OfficeCard key={office.id} office={office} />
            ))}
          </div>
        </div>

        {/* — MAPA — */}
        <div className={styles.mapSection}>
          <div className={styles.mapSectionHeader}>
            <div className={styles.sectionLabel}>Ubicación en el mapa</div>
            <h2 className={styles.sectionHeading}>
              Plaza 25 de Mayo — <em>Sede Central</em>
            </h2>
            <p className={styles.sectionDesc} style={{ marginBottom: "0" }}>
              La Alcaldía Municipal se encuentra en la Plaza 25 de Mayo, en el
              corazón del centro histórico de Sucre, frente a la Catedral Metropolitana.
            </p>
          </div>

          <div className={styles.mapWrapper}>
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-65.2668%2C-19.0490%2C-65.2568%2C-19.0415&layer=mapnik&marker=-19.04534%2C-65.25921"
              title="Mapa — Alcaldía de Sucre, Plaza 25 de Mayo"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className={styles.mapAttribution}>
            Datos del mapa ©{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
            >
              OpenStreetMap
            </a>{" "}
            colaboradores ·{" "}
            <a
              href="https://www.openstreetmap.org/?mlat=-19.04534&mlon=-65.25921#map=16/-19.04534/-65.25921"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver mapa completo →
            </a>
          </p>
        </div>

        {/* — HORARIOS — */}
        <HoursTable hours={OFFICE_HOURS} />

        {/* — CÓMO LLEGAR — */}
        <div style={{ marginBottom: "56px" }}>
          <div className={styles.sectionLabel}>Cómo llegar</div>
          <h2 className={styles.sectionHeading}>
            Medios de <em>transporte</em>
          </h2>
          <p className={styles.sectionDesc}>
            El centro histórico de Sucre es accesible desde cualquier punto de la ciudad.
          </p>
          <div className={styles.transportGrid}>
            {TRANSPORT.map((t, i) => (
              <TransportCard key={i} transport={t} />
            ))}
          </div>
        </div>

        {/* — CTA — */}
        <div className={styles.ctaBanner}>
          <div className={styles.ctaBannerText}>
            <h3>¿Necesitas verificar un servicio?</h3>
            <p>Puedes hacerlo desde aquí sin ir a las oficinas — solo necesitas internet.</p>
          </div>
          <Link href="/" className={styles.ctaBannerBtn}>
            Verificar ahora →
          </Link>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}