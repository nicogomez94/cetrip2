import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import '../../styles/navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/quienes-somos', label: 'Quiénes Somos' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/admision', label: 'Admisión' },
  { to: '/contacto', label: 'Contacto' },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <header className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo" onClick={() => setOpen(false)}>
          <img src="/sinnombre.png" alt="CETRIP" className="navbar__logo-img" />
          <span className="navbar__logo-text">
            <strong>CETRIP</strong>
            <small>Centro de Rehabilitación Infantil</small>
          </span>
        </Link>

        <nav className={`navbar__nav ${open ? 'navbar__nav--open' : ''}`}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''}`
              }
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/contacto" className="navbar__cta" onClick={() => setOpen(false)}>
            Pedir turno
          </Link>
        </nav>

        <button
          className={`navbar__burger ${open ? 'navbar__burger--open' : ''}`}
          onClick={() => setOpen(!open)}
          aria-label="Menú"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {open && <div className="navbar__overlay" onClick={() => setOpen(false)} />}
    </header>
  );
}

export default Navbar;
