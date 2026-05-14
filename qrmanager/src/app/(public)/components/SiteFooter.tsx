// components/SiteFooter.tsx
export default function SiteFooter() {
  return (
    <>
      <div className="site-info">
        <div className="site-info-inner">
          <div>
            <div className="info-label">Soporte técnico</div>
            <div className="info-val">
              <a href="tel:+59146456789">+591 4 645-6789</a>
              <br />Lunes a viernes, 8:00 – 17:00
            </div>
          </div>
          <div>
            <div className="info-label">Oficinas GAMS</div>
            <div className="info-val">
              Plaza 25 de Mayo s/n<br />Sucre, Bolivia
            </div>
          </div>
          <div>
            <div className="info-label">Acerca del sistema</div>
            <div className="info-val">
              QR-Manager es la plataforma centralizada de verificación del Gobierno Autónomo Municipal de Sucre.
            </div>
          </div>
        </div>
      </div>
      <footer className="site-footer">
        <div className="site-footer-inner">
          <span className="footer-copy">
            <b>GAMS</b> · Gobierno Autónomo Municipal de Sucre · QR-Manager v1.0
          </span>
          <span className="footer-badge">
            <span className="footer-badge-dot" />
            En línea
          </span>
        </div>
      </footer>
    </>
  );
}
