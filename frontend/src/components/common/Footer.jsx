import { Link } from 'react-router-dom';
import '../../styles/footer.css';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand">
          <span className="footer__logo">🌱 CETRIP</span>
          <p>Centro de Rehabilitación Infantil</p>
          <p className="footer__tagline">
            Acompañamos el desarrollo de cada niño con amor y profesionalismo.
          </p>
        </div>

        <div className="footer__links">
          <h4>Navegación</h4>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/quienes-somos">Quiénes Somos</Link></li>
            <li><Link to="/servicios">Servicios</Link></li>
            <li><Link to="/admision">Admisión</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>

        <div className="footer__contact">
          <h4>Contacto</h4>
          <p>📍 Av. Ejemplo 1234, Buenos Aires</p>
          <p>📞 (011) 4567-8901</p>
          <p>✉️ info@cetrip.com</p>
          <p>🕐 Lun–Vie: 8:00 – 18:00</p>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {year} CETRIP – Centro de Rehabilitación Infantil. Todos los derechos reservados.</p>
        <Link to="/admin/login" className="footer__admin-link">
          Panel Admin
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
