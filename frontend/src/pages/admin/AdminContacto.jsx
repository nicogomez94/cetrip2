import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import Toast from '../../components/common/Toast';
import useToast from '../../hooks/useToast';
import { CONTACTO_DEFAULTS } from '../../constants/publicPageDefaults';
import { mapContactoPage } from '../../utils/publicPageMappers';
import { ADMIN_PLAIN_TEXT_LIMIT, exceedsAdminPlainTextLimit } from '../../utils/adminTextLimit';
import {
  PAGE_SLUGS,
  ensureSection,
  fetchSectionsByPage,
  getSectionBlocks,
  replaceSectionBlocks,
} from '../../services/adminPageContent';
import '../../styles/admin.css';
import '../../styles/forms.css';

const INITIAL_FORM = {
  bannerTitle: CONTACTO_DEFAULTS.bannerTitle,
  bannerSubtitle: CONTACTO_DEFAULTS.bannerSubtitle,
  infoTitle: CONTACTO_DEFAULTS.infoTitle,
  infoSubtitle: CONTACTO_DEFAULTS.infoSubtitle,
  address: CONTACTO_DEFAULTS.address,
  phone: CONTACTO_DEFAULTS.phone,
  email: CONTACTO_DEFAULTS.email,
  schedule: CONTACTO_DEFAULTS.schedule,
};

function AdminContacto() {
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [errorField, setErrorField] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const formActionsRef = useRef(null);
  const { toast, showToast, hideToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const pageSections = await fetchSectionsByPage('contacto');
      const mapped = mapContactoPage(pageSections);
      const infoSection = pageSections.find((section) => section.slug === PAGE_SLUGS.contacto.info);
      const infoBlocks = getSectionBlocks(pageSections, PAGE_SLUGS.contacto.info).filter(
        (block) => block.type === 'TEXT'
      );

      const getInfoValue = (key, fallback) => {
        const match = infoBlocks.find((block) => block.title === key);
        return match?.content || fallback;
      };

      setSections(pageSections);
      setForm({
        bannerTitle: mapped.bannerTitle,
        bannerSubtitle: mapped.bannerSubtitle,
        infoTitle: infoSection?.title || mapped.infoTitle,
        infoSubtitle: infoSection?.description || mapped.infoSubtitle,
        address: getInfoValue('address', mapped.address),
        phone: getInfoValue('phone', mapped.phone),
        email: getInfoValue('email', mapped.email),
        schedule: getInfoValue('schedule', mapped.schedule),
      });
    } catch {
      setError('No se pudo cargar el editor de Contacto.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!formError) return;
    formActionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [formError]);

  useEffect(() => {
    if (!saved) return;
    showToast('success', 'Cambios guardados.');
    setSaved(false);
  }, [saved, showToast]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (exceedsAdminPlainTextLimit(name, value)) {
      setErrorField(name);
      setFormError(`Este campo admite hasta ${ADMIN_PLAIN_TEXT_LIMIT} caracteres.`);
      return;
    }
    if (formError) {
      setFormError(null);
      setErrorField('');
    }
    setSaved(false);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const firstInvalidField = Object.entries(form).find(([, value]) =>
      exceedsAdminPlainTextLimit('contactField', value)
    )?.[0];
    if (firstInvalidField) {
      setErrorField(firstInvalidField);
      setFormError(`Este campo admite hasta ${ADMIN_PLAIN_TEXT_LIMIT} caracteres.`);
      return;
    }

    setSaving(true);
    setFormError(null);
    setSaved(false);
    try {
      const bannerSectionId = await ensureSection({
        sections,
        page: 'contacto',
        slug: PAGE_SLUGS.contacto.banner,
        title: form.bannerTitle,
        description: form.bannerSubtitle,
        order: 1,
      });
      const infoSectionId = await ensureSection({
        sections,
        page: 'contacto',
        slug: PAGE_SLUGS.contacto.info,
        title: form.infoTitle,
        description: form.infoSubtitle,
        order: 2,
      });

      await replaceSectionBlocks(bannerSectionId, []);
      await replaceSectionBlocks(infoSectionId, [
        { type: 'TEXT', title: 'address', content: form.address, order: 1 },
        { type: 'TEXT', title: 'phone', content: form.phone, order: 2 },
        { type: 'TEXT', title: 'email', content: form.email, order: 3 },
        { type: 'TEXT', title: 'schedule', content: form.schedule, order: 4 },
      ]);

      await loadData();
      setSaved(true);
    } catch (err) {
      setErrorField('');
      const message = err.response?.data?.message || 'No se pudo guardar Contacto.';
      setFormError(null);
      showToast('error', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Contacto">
        <Loader />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Contacto">
        <ErrorMessage message={error} onRetry={loadData} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Contacto">
      <Toast toast={toast} onClose={hideToast} />
      <div className="admin-page">
        <div className="admin-form-card">
          <h3>Contenido de la página</h3>
          <form className="form" onSubmit={handleSubmit}>
            <h3>Banner</h3>
            <div className="form-row">
              <div className={`form-group${errorField === 'bannerTitle' ? ' form-group--error' : ''}`}>
                <label>Título</label>
                <input name="bannerTitle" value={form.bannerTitle} onChange={handleChange} />
              </div>
              <div className={`form-group${errorField === 'bannerSubtitle' ? ' form-group--error' : ''}`}>
                <label>Subtítulo</label>
                <input name="bannerSubtitle" value={form.bannerSubtitle} onChange={handleChange} />
              </div>
            </div>

            <h3>Panel de información</h3>
            <div className={`form-group${errorField === 'infoTitle' ? ' form-group--error' : ''}`}>
              <label>Título</label>
              <input name="infoTitle" value={form.infoTitle} onChange={handleChange} />
            </div>
            <div className={`form-group${errorField === 'infoSubtitle' ? ' form-group--error' : ''}`}>
              <label>Subtítulo</label>
              <textarea name="infoSubtitle" rows={3} value={form.infoSubtitle} onChange={handleChange} />
            </div>
            <div className={`form-group${errorField === 'address' ? ' form-group--error' : ''}`}>
              <label>Dirección</label>
              <input name="address" value={form.address} onChange={handleChange} />
            </div>
            <div className={`form-group${errorField === 'phone' ? ' form-group--error' : ''}`}>
              <label>Teléfono</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className={`form-group${errorField === 'email' ? ' form-group--error' : ''}`}>
              <label>Email</label>
              <input name="email" value={form.email} onChange={handleChange} />
            </div>
            <div className={`form-group${errorField === 'schedule' ? ' form-group--error' : ''}`}>
              <label>Horario</label>
              <input name="schedule" value={form.schedule} onChange={handleChange} />
            </div>

            <div className="form-actions" ref={formActionsRef}>
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              {formError && <span className="form-inline-error">{formError}</span>}
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminContacto;
