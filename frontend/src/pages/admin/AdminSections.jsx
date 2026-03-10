import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import useApi from '../../hooks/useApi';
import api from '../../services/api';
import '../../styles/admin.css';
import '../../styles/forms.css';

const PAGES = ['home', 'quienes-somos', 'admision', 'servicios', 'contacto'];

const EMPTY_FORM = {
  slug: '',
  title: '',
  description: '',
  page: 'home',
  order: '0',
  isActive: true,
};

function AdminSections() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPage, setFilterPage] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null); // section id
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchSections = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filterPage ? `?page=${filterPage}` : '';
      const res = await api.get(`/admin/sections${params}`);
      setSections(res.data.data || []);
    } catch {
      setError('No se pudieron cargar las secciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [filterPage]);

  const handleEdit = (section) => {
    setEditing(section.id);
    setForm({
      slug: section.slug,
      title: section.title,
      description: section.description || '',
      page: section.page,
      order: String(section.order),
      isActive: section.isActive,
    });
    setFormError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      setFormError('Título y slug son obligatorios.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      if (editing) {
        await api.put(`/admin/sections/${editing}`, form);
      } else {
        await api.post('/admin/sections', form);
      }
      setShowForm(false);
      setEditing(null);
      await fetchSections();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al guardar la sección.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/admin/sections/${id}/toggle`);
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
      );
    } catch {
      alert('No se pudo cambiar el estado.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminás esta sección y todos sus bloques?')) return;
    try {
      await api.delete(`/admin/sections/${id}`);
      setSections((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert('No se pudo eliminar la sección.');
    }
  };

  const filteredSections = search.trim()
    ? sections.filter((s) => {
        const q = search.toLowerCase();
        return (
          s.title?.toLowerCase().includes(q) ||
          s.slug?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q)
        );
      })
    : sections;

  return (
    <AdminLayout title="Secciones">
      <div className="admin-page">
        {/* Toolbar */}
        <div className="admin-toolbar">
          <select
            className="admin-select"
            value={filterPage}
            onChange={(e) => { setFilterPage(e.target.value); setSearch(''); }}
          >
            <option value="">Todas las páginas</option>
            {PAGES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <input
            className="admin-search"
            type="search"
            placeholder="Buscar por título, slug o descripción…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn--primary" onClick={handleNew}>
            + Nueva sección
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="admin-form-card">
            <h3>{editing ? 'Editar sección' : 'Nueva sección'}</h3>
            {formError && <div className="form-alert form-alert--error">{formError}</div>}
            <form className="form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Título *</label>
                  <input name="title" value={form.title} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Slug *</label>
                  <input name="slug" value={form.slug} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Página *</label>
                  <select name="page" value={form.page} onChange={handleChange}>
                    {PAGES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Orden</label>
                  <input type="number" name="order" value={form.order} onChange={handleChange} min="0" />
                </div>
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <input name="description" value={form.description} onChange={handleChange} />
              </div>
              <div className="form-group form-group--checkbox">
                <label>
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                  &nbsp;Activa
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" className="btn btn--outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla */}
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchSections} />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Página</th>
                  <th>Título</th>
                  <th>Slug</th>
                  <th>Orden</th>
                  <th>Bloques</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSections.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      {search ? 'No hay resultados para la búsqueda.' : 'No hay secciones.'}
                    </td>
                  </tr>
                ) : (
                  filteredSections.map((s) => (
                    <tr key={s.id}>
                      <td><span className="badge badge--page">{s.page}</span></td>
                      <td>{s.title}</td>
                      <td className="td-mono">{s.slug}</td>
                      <td>{s.order}</td>
                      <td>{s._count?.blocks ?? s.blocks?.length ?? 0}</td>
                      <td>
                        <span className={`badge ${s.isActive ? 'badge--active' : 'badge--inactive'}`}>
                          {s.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn--sm btn--outline" onClick={() => handleEdit(s)}>
                            Editar
                          </button>
                          <button
                            className={`btn btn--sm ${s.isActive ? 'btn--warning' : 'btn--success'}`}
                            onClick={() => handleToggle(s.id)}
                          >
                            {s.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                          <button className="btn btn--sm btn--danger" onClick={() => handleDelete(s.id)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminSections;
