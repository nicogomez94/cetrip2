import { Link } from 'react-router-dom';
import { CONTACTO_DEFAULTS } from '../../constants/publicPageDefaults';
import usePublicSections from '../../hooks/usePublicSections';
import { mapContactoPage } from '../../utils/publicPageMappers';
import '../../styles/footer.css';

function Footer() {
  const year = new Date().getFullYear();
  const { sections } = usePublicSections('contacto');
  const contacto = mapContactoPage(sections);

  const address = contacto.address || CONTACTO_DEFAULTS.address;
  const phone = contacto.phone || CONTACTO_DEFAULTS.phone;
  const email = contacto.email || CONTACTO_DEFAULTS.email;
  const schedule = contacto.schedule || CONTACTO_DEFAULTS.schedule;

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
            <li><Link to="/servicios">Consultorios Externos</Link></li>
            <li><Link to="/admision">Admisión</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>

        <div className="footer__contact">
          <h4>Contacto</h4>
          <p>📍 {address}</p>
          <p>📞 {phone}</p>
          <p>✉️ {email}</p>
          <p>🕐 {schedule}</p>
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
