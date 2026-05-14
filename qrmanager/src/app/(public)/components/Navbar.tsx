"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/mas-informacion", label: "Más información" },
  { href: "/generadorQr", label: "Generar QR" },
  { href: "/ubicacion", label: "Ubicación" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          {/* Brand */}
          <Link href="/" className="nav-brand" onClick={() => setMenuOpen(false)}>
            <div className="nav-shield">
              <Image
                src="/sede.ico"  // Ejemplo: si tu archivo se llama "mi-icono.png"
                alt="Icono aplicación"
                width={45}
                height={30}
                priority  
              />
            </div>
            <div>
              <div className="nav-name">QR-Manager · GAMS</div>
              <div className="nav-city">Gobierno Autónomo Municipal de Sucre</div>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="nav-links">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link${pathname === link.href ? " active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <Link href="/scan" className="nav-cta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <path d="M14 14h2v2h-2zM18 14h3M18 18v3M14 18h1M17 21h4"/>
            </svg>
            Escanear QR
          </Link>

          {/* Mobile hamburger */}
          <button
            className="nav-hamburger"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`nav-mobile-menu${menuOpen ? " open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-mobile-link${pathname === link.href ? " active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/scan" className="nav-mobile-cta" onClick={() => setMenuOpen(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <path d="M14 14h2v2h-2zM18 14h3M18 18v3M14 18h1M17 21h4"/>
          </svg>
          Escanear QR
        </Link>
      </div>
    </>
  );
}