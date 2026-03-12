import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import { PAGE_SLUGS } from '../../services/adminPageContent';
import '../../styles/admin.css';

const PAGE_STATUS_CONFIG = [
  {
    key: 'home',
    label: 'Home',
    icon: '🏠',
    to: '/admin/home',
    evaluate: (sections) => {
      const hero = sections.find((section) => section.slug === PAGE_SLUGS.home.hero);
      const services = sections.find((section) => section.slug === PAGE_SLUGS.home.services);
      const about = sections.find((section) => section.slug === PAGE_SLUGS.home.about);
      return Boolean(
        hero?.blocks?.length >= 1 &&
        services?.blocks?.length >= 3 &&
        about?.blocks?.length >= 3
      );
    },
  },
  {
    key: 'quienes-somos',
    label: 'Quiénes Somos',
    icon: '🧭',
    to: '/admin/quienes-somos',
    evaluate: (sections) => {
      const banner = sections.find((section) => section.slug === PAGE_SLUGS.quienes.banner);
      const intro = sections.find((section) => section.slug === PAGE_SLUGS.quienes.intro);
      const identity = sections.find((section) => section.slug === PAGE_SLUGS.quienes.identity);
      const trust = sections.find((section) => section.slug === PAGE_SLUGS.quienes.trust);
      return Boolean(
        banner &&
        intro?.blocks?.length >= 2 &&
        identity?.blocks?.length >= 3 &&
        trust?.blocks?.length >= 1
      );
    },
  },
  {
    key: 'servicios',
    label: 'Servicios',
    icon: '🩺',
    to: '/admin/servicios',
    evaluate: (sections) => {
      const banner = sections.find((section) => section.slug === PAGE_SLUGS.servicios.banner);
      const intro = sections.find((section) => section.slug === PAGE_SLUGS.servicios.intro);
      const list = sections.find((section) => section.slug === PAGE_SLUGS.servicios.list);
      const workflow = sections.find((section) => section.slug === PAGE_SLUGS.servicios.workflow);
      const cta = sections.find((section) => section.slug === PAGE_SLUGS.servicios.cta);
      const servicesCount = list?.blocks?.length || 0;
      return Boolean(
        banner &&
        intro?.blocks?.length >= 1 &&
        servicesCount >= 3 &&
        servicesCount <= 12 &&
        workflow?.blocks?.length >= 3 &&
        cta
      );
    },
  },
  {
    key: 'admision',
    label: 'Admisión',
    icon: '🗓️',
    to: '/admin/admision',
    evaluate: (sections) => {
      const banner = sections.find((section) => section.slug === PAGE_SLUGS.admision.banner);
      const intro = sections.find((section) => section.slug === PAGE_SLUGS.admision.intro);
      const steps = sections.find((section) => section.slug === PAGE_SLUGS.admision.steps);
      const requirements = sections.find((section) => section.slug === PAGE_SLUGS.admision.requirements);
      const faq = sections.find((section) => section.slug === PAGE_SLUGS.admision.faq);
      const cta = sections.find((section) => section.slug === PAGE_SLUGS.admision.cta);
      const stepsCount = steps?.blocks?.length || 0;
      return Boolean(
        banner &&
        intro?.blocks?.length >= 1 &&
        stepsCount >= 3 &&
        stepsCount <= 10 &&
        requirements?.blocks?.length >= 4 &&
        faq?.blocks?.length >= 3 &&
        cta
      );
    },
  },
  {
    key: 'contacto',
    label: 'Contacto',
    icon: '📞',
    to: '/admin/contacto',
    evaluate: (sections) => {
      const banner = sections.find((section) => section.slug === PAGE_SLUGS.contacto.banner);
      const info = sections.find((section) => section.slug === PAGE_SLUGS.contacto.info);
      return Boolean(banner && info?.blocks?.length >= 4);
    },
  },
];

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectionsRes, messagesRes] = await Promise.all([
          api.get('/admin/sections'),
          api.get('/admin/messages'),
        ]);

        const allSections = sectionsRes.data.data || [];
        const pageStatus = PAGE_STATUS_CONFIG.map((config) => {
          const pageSections = allSections.filter((section) => section.page === config.key);
          return {
            ...config,
            complete: config.evaluate(pageSections),
          };
        });

        const completedCount = pageStatus.filter((item) => item.complete).length;

        setData({
          pageStatus,
          completedCount,
          recentMessages: messagesRes.data.data?.slice(0, 5) || [],
          unread: messagesRes.data.unreadCount || 0,
          messages: messagesRes.data.data?.length || 0,
        });
      } catch {
        setData({
          pageStatus: PAGE_STATUS_CONFIG.map((config) => ({ ...config, complete: false })),
          completedCount: 0,
          recentMessages: [],
          unread: 0,
          messages: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <Loader />
      ) : (
        <div className="dashboard">
          <div className="dash-summary-grid">
            <div className="dash-summary-card">
              <p className="dash-summary-card__label">Páginas completas</p>
              <p className="dash-summary-card__value">{data.completedCount}/5</p>
            </div>
            <div className="dash-summary-card">
              <p className="dash-summary-card__label">Mensajes totales</p>
              <p className="dash-summary-card__value">{data.messages}</p>
            </div>
            <div className="dash-summary-card">
              <p className="dash-summary-card__label">Mensajes sin leer</p>
              <p className="dash-summary-card__value">{data.unread}</p>
            </div>
          </div>

          <div className="page-status-grid">
            {data.pageStatus.map((item) => (
              <Link key={item.key} to={item.to} className="page-status-card">
                <div className="page-status-card__top">
                  <span className="page-status-card__icon">{item.icon}</span>
                  <span className={`badge ${item.complete ? 'badge--active' : 'badge--inactive'}`}>
                    {item.complete ? 'Completa' : 'Incompleta'}
                  </span>
                </div>
                <h3>{item.label}</h3>
              </Link>
            ))}
          </div>

          <div className="dash-recent">
            <div className="dash-recent__header">
              <h3>Mensajes recientes</h3>
              <Link to="/admin/mensajes" className="btn btn--outline btn--sm">
                Ver todos
              </Link>
            </div>

            {data.recentMessages.length === 0 ? (
              <p className="empty-state">No hay mensajes aún.</p>
            ) : (
              <div className="messages-list">
                {data.recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-item ${!msg.isRead ? 'message-item--unread' : ''}`}
                  >
                    <div className="message-item__info">
                      <strong>{msg.name}</strong>
                      <span className="message-item__subject">{msg.subject}</span>
                    </div>
                    <div className="message-item__meta">
                      <span>{new Date(msg.createdAt).toLocaleDateString('es-AR')}</span>
                      {!msg.isRead && <span className="badge badge--new">Nuevo</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dash-quick-links">
            <h3>Acciones rápidas</h3>
            <div className="quick-links-grid">
              <Link to="/admin/home" className="quick-link">
                <span>🏠</span> Editar Home
              </Link>
              <Link to="/admin/quienes-somos" className="quick-link">
                <span>🧭</span> Editar Quiénes
              </Link>
              <Link to="/admin/servicios" className="quick-link">
                <span>🩺</span> Editar Servicios
              </Link>
              <Link to="/admin/admision" className="quick-link">
                <span>🗓️</span> Editar Admisión
              </Link>
              <Link to="/admin/contacto" className="quick-link">
                <span>📞</span> Editar Contacto
              </Link>
              <Link to="/admin/mensajes" className="quick-link">
                <span>✉️</span> Ver mensajes
              </Link>
              <a href="/" target="_blank" rel="noreferrer" className="quick-link">
                <span>🌐</span> Ver sitio público
              </a>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Dashboard;
