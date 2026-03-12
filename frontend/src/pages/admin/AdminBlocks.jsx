import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import RichTextEditor from '../../components/admin/RichTextEditor';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import api from '../../services/api';
import '../../styles/admin.css';
import '../../styles/forms.css';

const BLOCK_TYPES = ['HERO', 'TEXT', 'IMAGE', 'VIDEO', 'CARD', 'CTA'];

const EMPTY_FORM = {
  sectionId: '',
  type: 'TEXT',
  title: '',
  subtitle: '',
  content: '',
  imageUrl: '',
  videoUrl: '',
  linkUrl: '',
  linkText: '',
  order: '0',
  isActive: true,
};

function AdminBlocks() {
  const [blocks, setBlocks] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterSection, setFilterSection] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [blocksRes, sectionsRes] = await Promise.all([
        api.get(filterSection ? `/admin/blocks?sectionId=${filterSection}` : '/admin/blocks'),
        api.get('/admin/sections'),
      ]);
      const nonHomeSections = (sectionsRes.data.data || []).filter((section) => section.page !== 'home');
      const allowedSectionIds = new Set(nonHomeSections.map((section) => section.id));
      const nonHomeBlocks = (blocksRes.data.data || []).filter((block) => {
        if (block.section?.page) return block.section.page !== 'home';
        return allowedSectionIds.has(block.sectionId);
      });

      setBlocks(nonHomeBlocks);
      setSections(nonHomeSections);
    } catch {
      setError('No se pudo cargar el contenido.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterSection]);

  const handleEdit = (block) => {
    setEditing(block.id);
    setForm({
      sectionId: String(block.sectionId),
      type: block.type,
      title: block.title || '',
      subtitle: block.subtitle || '',
      content: block.content || '',
      imageUrl: block.imageUrl || '',
      videoUrl: block.videoUrl || '',
      linkUrl: block.linkUrl || '',
      linkText: block.linkText || '',
      order: String(block.order),
      isActive: block.isActive,
    });
    setFormError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sectionId: filterSection || '' });
    setFormError(null);
    setShowForm(true);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim()) {
      setShowForm(false);
      setEditing(null);
      setFormError(null);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/admin/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, imageUrl: res.data.url }));
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sectionId || !form.type) {
      setFormError('Sección y tipo son obligatorios.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      if (editing) {
        await api.put(`/admin/blocks/${editing}`, form);
      } else {
        await api.post('/admin/blocks', form);
      }
      setShowForm(false);
      setEditing(null);
      await fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al guardar el bloque.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/admin/blocks/${id}/toggle`);
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
      );
    } catch {
      alert('No se pudo cambiar el estado.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminás este bloque?')) return;
    try {
      await api.delete(`/admin/blocks/${id}`);
      setBlocks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert('No se pudo eliminar el bloque.');
    }
  };

  const needsImage = ['IMAGE', 'HERO', 'CARD'].includes(form.type);
  const needsVideo = form.type === 'VIDEO';
  const needsContent = ['TEXT', 'HERO', 'CARD', 'CTA'].includes(form.type);
  const needsLink = ['HERO', 'CARD', 'CTA'].includes(form.type);

  const filteredBlocks = search.trim()
    ? blocks.filter((b) => {
        const q = search.toLowerCase();
        return (
          b.title?.toLowerCase().includes(q) ||
          b.type?.toLowerCase().includes(q) ||
          b.section?.title?.toLowerCase().includes(q) ||
          b.section?.page?.toLowerCase().includes(q)
        );
      })
    : blocks;

  return (
    <AdminLayout title="Bloques de Contenido">
      <div className="admin-page">
        <div className="admin-toolbar">
          <select
            className="admin-select"
            value={filterSection}
            onChange={(e) => { setFilterSection(e.target.value); setSearch(''); }}
          >
            <option value="">Todas las secciones</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.page}] {s.title}
              </option>
            ))}
          </select>
          <input
            className="admin-search"
            type="search"
            placeholder="Buscar por título, tipo o sección…"
            value={search}
            onChange={handleSearchChange}
          />
          <button className="btn btn--primary" onClick={handleNew}>
            + Nuevo bloque
          </button>
        </div>

        {showForm && (
          <div className="admin-form-card">
            <h3>{editing ? 'Editar bloque' : 'Nuevo bloque'}</h3>
            {formError && <div className="form-alert form-alert--error">{formError}</div>}
            <form className="form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Sección *</label>
                  <select name="sectionId" value={form.sectionId} onChange={handleChange} required>
                    <option value="">Seleccioná una sección</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        [{s.page}] {s.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo *</label>
                  <select name="type" value={form.type} onChange={handleChange}>
                    {BLOCK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Título</label>
                  <input name="title" value={form.title} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Subtítulo</label>
                  <input name="subtitle" value={form.subtitle} onChange={handleChange} />
                </div>
              </div>
              {needsContent && (
                <div className="form-group">
                  <label>Contenido / Texto</label>
                  <RichTextEditor
                    value={form.content}
                    onChange={(content) => {
                      setForm((prev) => ({ ...prev, content }));
                    }}
                  />
                </div>
              )}
              {needsImage && (
                <div className="form-group">
                  <label>URL de imagen</label>
                  <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
                  <div className="form-upload">
                    <label className="btn btn--outline btn--sm">
                      {uploading ? 'Subiendo...' : '📎 Subir imagen'}
                      <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
                    </label>
                    {form.imageUrl && (
                      <img src={form.imageUrl} alt="Preview" className="upload-preview" />
                    )}
                  </div>
                </div>
              )}
              {needsVideo && (
                <div className="form-group">
                  <label>URL de video (embed)</label>
                  <input name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="https://www.youtube.com/embed/..." />
                </div>
              )}
              {needsLink && (
                <div className="form-row">
                  <div className="form-group">
                    <label>URL del enlace</label>
                    <input name="linkUrl" value={form.linkUrl} onChange={handleChange} placeholder="/admision" />
                  </div>
                  <div className="form-group">
                    <label>Texto del enlace</label>
                    <input name="linkText" value={form.linkText} onChange={handleChange} placeholder="Ver más" />
                  </div>
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label>Orden</label>
                  <input type="number" name="order" value={form.order} onChange={handleChange} min="0" />
                </div>
                <div className="form-group form-group--checkbox">
                  <label>
                    <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                    &nbsp;Activo
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn--primary" disabled={submitting || uploading}>
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" className="btn btn--outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchData} />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Sección</th>
                  <th>Título</th>
                  <th>Orden</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      {search ? 'No hay resultados para la búsqueda.' : 'No hay bloques.'}
                    </td>
                  </tr>
                ) : (
                  filteredBlocks.map((b) => (
                    <tr key={b.id}>
                      <td><span className="badge badge--type">{b.type}</span></td>
                      <td>{b.section?.title || '-'} <small className="text-muted">[{b.section?.page}]</small></td>
                      <td>{b.title || <em className="text-muted">sin título</em>}</td>
                      <td>{b.order}</td>
                      <td>
                        <span className={`badge ${b.isActive ? 'badge--active' : 'badge--inactive'}`}>
                          {b.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn--sm btn--outline" onClick={() => handleEdit(b)}>
                            Editar
                          </button>
                          <button
                            className={`btn btn--sm ${b.isActive ? 'btn--warning' : 'btn--success'}`}
                            onClick={() => handleToggle(b.id)}
                          >
                            {b.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                          <button className="btn btn--sm btn--danger" onClick={() => handleDelete(b.id)}>
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

export default AdminBlocks;
