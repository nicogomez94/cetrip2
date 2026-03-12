import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import '../../styles/admin.css';

function StatCard({ icon, value, label, to }) {
  return (
    <Link to={to} className="dash-stat">
      <span className="dash-stat__icon">{icon}</span>
      <div>
        <p className="dash-stat__value">{value}</p>
        <p className="dash-stat__label">{label}</p>
      </div>
    </Link>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sectionsRes, blocksRes, messagesRes] = await Promise.all([
          api.get('/admin/sections'),
          api.get('/admin/blocks'),
          api.get('/admin/messages'),
        ]);
        setStats({
          sections: sectionsRes.data.data?.length || 0,
          blocks: blocksRes.data.data?.length || 0,
          messages: messagesRes.data.data?.length || 0,
          unread: messagesRes.data.unreadCount || 0,
          recentMessages: messagesRes.data.data?.slice(0, 5) || [],
        });
      } catch {
        setStats({ sections: 0, blocks: 0, messages: 0, unread: 0, recentMessages: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <Loader />
      ) : (
        <div className="dashboard">
          <div className="dash-stats-grid">
            <StatCard
              icon="🗂️"
              value={stats.sections}
              label="Secciones"
              to="/admin/secciones"
            />
            <StatCard
              icon="🧩"
              value={stats.blocks}
              label="Bloques de contenido"
              to="/admin/bloques"
            />
            <StatCard
              icon="✉️"
              value={stats.messages}
              label="Mensajes totales"
              to="/admin/mensajes"
            />
            <StatCard
              icon="🔔"
              value={stats.unread}
              label="Mensajes sin leer"
              to="/admin/mensajes"
            />
          </div>

          <div className="dash-recent">
            <div className="dash-recent__header">
              <h3>Mensajes recientes</h3>
              <Link to="/admin/mensajes" className="btn btn--outline btn--sm">
                Ver todos
              </Link>
            </div>

            {stats.recentMessages.length === 0 ? (
              <p className="empty-state">No hay mensajes aún.</p>
            ) : (
              <div className="messages-list">
                {stats.recentMessages.map((msg) => (
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
              <Link to="/admin/secciones" className="quick-link">
                <span>🗂️</span> Gestionar secciones
              </Link>
              <Link to="/admin/bloques" className="quick-link">
                <span>🧩</span> Gestionar bloques
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
