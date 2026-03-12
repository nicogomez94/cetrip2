import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin.css';

const MENU = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/home', label: 'Home', icon: '🏠' },
  { to: '/admin/quienes-somos', label: 'Quiénes Somos', icon: '🧭' },
  { to: '/admin/servicios', label: 'Servicios', icon: '🩺' },
  { to: '/admin/admision', label: 'Admisión', icon: '🗓️' },
  { to: '/admin/contacto', label: 'Contacto', icon: '📞' },
  { to: '/admin/mensajes', label: 'Mensajes', icon: '✉️' },
];

function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__header">
          <span className="admin-sidebar__logo">🌱 CETRIP</span>
          <button
            className="admin-sidebar__close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {MENU.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">{user?.name?.charAt(0) || 'A'}</div>
            <div>
              <p className="admin-sidebar__user-name">{user?.name}</p>
              <p className="admin-sidebar__user-email">{user?.email}</p>
            </div>
          </div>
          <button className="admin-sidebar__logout" onClick={handleLogout}>
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-topbar__burger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <h1 className="admin-topbar__title">{title}</h1>
          <a href="/" target="_blank" rel="noreferrer" className="admin-topbar__site-link">
            Ver sitio ↗
          </a>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
