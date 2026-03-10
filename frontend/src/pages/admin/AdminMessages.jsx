import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import api from '../../services/api';
import '../../styles/admin.css';

function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filter !== '' ? `?isRead=${filter}` : '';
      const res = await api.get(`/admin/messages${params}`);
      setMessages(res.data.data || []);
    } catch {
      setError('No se pudieron cargar los mensajes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/admin/messages/${id}/read`);
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, isRead: true } : m));
      if (selected?.id === id) setSelected((prev) => ({ ...prev, isRead: true }));
    } catch {
      alert('No se pudo actualizar el mensaje.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminás este mensaje?')) return;
    try {
      await api.delete(`/admin/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {
      alert('No se pudo eliminar el mensaje.');
    }
  };

  const handleSelect = async (msg) => {
    setSelected(msg);
    if (!msg.isRead) await handleMarkRead(msg.id);
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <AdminLayout title="Mensajes de Contacto">
      <div className="admin-page">
        <div className="admin-toolbar">
          <div className="toolbar-info">
            <span className="badge badge--new">{unreadCount} sin leer</span>
          </div>
          <select
            className="admin-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="false">Sin leer</option>
            <option value="true">Leídos</option>
          </select>
          <button className="btn btn--outline" onClick={fetchMessages}>
            🔄 Actualizar
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchMessages} />
        ) : (
          <div className="messages-panel">
            {/* Lista */}
            <div className="messages-panel__list">
              {messages.length === 0 ? (
                <p className="empty-state">No hay mensajes.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`msg-row ${!msg.isRead ? 'msg-row--unread' : ''} ${selected?.id === msg.id ? 'msg-row--selected' : ''}`}
                    onClick={() => handleSelect(msg)}
                  >
                    <div className="msg-row__header">
                      <strong>{msg.name}</strong>
                      <span className="msg-row__date">
                        {new Date(msg.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <p className="msg-row__subject">{msg.subject}</p>
                    <p className="msg-row__preview">
                      {msg.message.substring(0, 80)}
                      {msg.message.length > 80 ? '...' : ''}
                    </p>
                    {!msg.isRead && <span className="badge badge--new">Nuevo</span>}
                  </div>
                ))
              )}
            </div>

            {/* Detalle */}
            <div className="messages-panel__detail">
              {!selected ? (
                <div className="msg-empty-detail">
                  <span>✉️</span>
                  <p>Seleccioná un mensaje para verlo</p>
                </div>
              ) : (
                <div className="msg-detail">
                  <div className="msg-detail__header">
                    <div>
                      <h3>{selected.subject}</h3>
                      <p className="msg-detail__meta">
                        De: <strong>{selected.name}</strong> ({selected.email})
                        {selected.phone && ` · 📞 ${selected.phone}`}
                      </p>
                      <p className="msg-detail__date">
                        {new Date(selected.createdAt).toLocaleString('es-AR')}
                      </p>
                    </div>
                    <div className="msg-detail__actions">
                      {!selected.isRead && (
                        <button
                          className="btn btn--sm btn--outline"
                          onClick={() => handleMarkRead(selected.id)}
                        >
                          Marcar como leído
                        </button>
                      )}
                      <button
                        className="btn btn--sm btn--danger"
                        onClick={() => handleDelete(selected.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="msg-detail__body">
                    <p>{selected.message}</p>
                  </div>
                  <div className="msg-detail__reply">
                    <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="btn btn--primary">
                      ✉️ Responder por email
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminMessages;
