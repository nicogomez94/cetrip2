import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import RichTextEditor from '../../components/admin/RichTextEditor';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import Toast from '../../components/common/Toast';
import useToast from '../../hooks/useToast';
import { SERVICIOS_DEFAULTS } from '../../constants/publicPageDefaults';
import { mapServiciosPage } from '../../utils/publicPageMappers';
import { buildServiceSlugs } from '../../utils/serviceContent';
import { ADMIN_PLAIN_TEXT_LIMIT, exceedsAdminPlainTextLimit } from '../../utils/adminTextLimit';
import {
  PAGE_SLUGS,
  ensureSection,
  fetchSectionsByPage,
  getSectionBlocks,
  replaceSectionBlocks,
} from '../../services/adminPageContent';
import api from '../../services/api';
import { useUpload } from '../../context/UploadContext';
import '../../styles/admin.css';
import '../../styles/forms.css';

const MIN_SERVICES = 3;
const MAX_SERVICES = 12;

const CTA_DEFAULT_TITLE = '¿Querés que evaluemos tu caso?';
const CTA_DEFAULT_TEXT = 'Podemos orientarte sobre el tratamiento más adecuado para tu hijo o hija.';

const createEmptyService = () => ({
  title: 'Nuevo consultorio externo',
  content: '',
  imageUrl: '',
});

const INITIAL_FORM = {
  bannerTitle: SERVICIOS_DEFAULTS.bannerTitle,
  bannerSubtitle: SERVICIOS_DEFAULTS.bannerSubtitle,
  introTitle: SERVICIOS_DEFAULTS.introTitle,
  introBody: SERVICIOS_DEFAULTS.introBody,
  workflowTitle: SERVICIOS_DEFAULTS.workflowTitle,
  workflow1Title: SERVICIOS_DEFAULTS.workflow[0].title,
  workflow1Content: SERVICIOS_DEFAULTS.workflow[0].content,
  workflow2Title: SERVICIOS_DEFAULTS.workflow[1].title,
  workflow2Content: SERVICIOS_DEFAULTS.workflow[1].content,
  workflow3Title: SERVICIOS_DEFAULTS.workflow[2].title,
  workflow3Content: SERVICIOS_DEFAULTS.workflow[2].content,
  ctaTitle: CTA_DEFAULT_TITLE,
  ctaText: CTA_DEFAULT_TEXT,
};
const SERVICES_RICH_TEXT_FIELDS = [
  'introBody',
  'workflow1Content',
  'workflow2Content',
  'workflow3Content',
  'ctaText',
];

function AdminServicios() {
  const [sections, setSections] = useState([]);
  const [services, setServices] = useState(SERVICIOS_DEFAULTS.services);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [errorField, setErrorField] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const { setIsUploading } = useUpload();
  const formActionsRef = useRef(null);
  const { toast, showToast, hideToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const pageSections = await fetchSectionsByPage('servicios');
      const mapped = mapServiciosPage(pageSections);

      const introSection = pageSections.find((section) => section.slug === PAGE_SLUGS.servicios.intro);
      const introBlocks = getSectionBlocks(pageSections, PAGE_SLUGS.servicios.intro);
      const servicesBlocks = getSectionBlocks(pageSections, PAGE_SLUGS.servicios.list).filter(
        (block) => block.type === 'CARD'
      );
      const workflowSection = pageSections.find((section) => section.slug === PAGE_SLUGS.servicios.workflow);
      const workflowBlocks = getSectionBlocks(pageSections, PAGE_SLUGS.servicios.workflow).filter(
        (block) => block.type === 'CARD' || block.type === 'TEXT'
      );
      const ctaSection = pageSections.find((section) => section.slug === PAGE_SLUGS.servicios.cta);

      const introText = introBlocks.find((block) => block.type === 'TEXT');
      const nextServices = servicesBlocks.length > 0 ? servicesBlocks : mapped.services;
      const nextWorkflow = [0, 1, 2].map((index) => workflowBlocks[index] || mapped.workflow[index]);

      setSections(pageSections);
      setServices(nextServices.map((service) => ({
        title: service.title || '',
        content: service.content || '',
        imageUrl: service.imageUrl || '',
      })));
      setForm({
        bannerTitle: mapped.bannerTitle,
        bannerSubtitle: mapped.bannerSubtitle,
        introTitle: introSection?.title || mapped.introTitle,
        introBody: introText?.content || mapped.introBody,
        workflowTitle: workflowSection?.title || mapped.workflowTitle,
        workflow1Title: nextWorkflow[0]?.title || SERVICIOS_DEFAULTS.workflow[0].title,
        workflow1Content: nextWorkflow[0]?.content || SERVICIOS_DEFAULTS.workflow[0].content,
        workflow2Title: nextWorkflow[1]?.title || SERVICIOS_DEFAULTS.workflow[1].title,
        workflow2Content: nextWorkflow[1]?.content || SERVICIOS_DEFAULTS.workflow[1].content,
        workflow3Title: nextWorkflow[2]?.title || SERVICIOS_DEFAULTS.workflow[2].title,
        workflow3Content: nextWorkflow[2]?.content || SERVICIOS_DEFAULTS.workflow[2].content,
        ctaTitle: ctaSection?.title || CTA_DEFAULT_TITLE,
        ctaText: ctaSection?.description || CTA_DEFAULT_TEXT,
      });
    } catch {
      setError('No se pudo cargar el editor de Consultorios Externos.');
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

  const handleFormChange = (event) => {
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

  const handleRichTextChange = (name, value) => {
    if (formError) {
      setFormError(null);
      setErrorField('');
    }
    setSaved(false);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (index, field, value) => {
    if (field !== 'content' && value.length > ADMIN_PLAIN_TEXT_LIMIT) {
      setErrorField(field === 'title' ? `service${index}Title` : `service${index}ImageUrl`);
      setFormError(`Este campo admite hasta ${ADMIN_PLAIN_TEXT_LIMIT} caracteres.`);
      return;
    }
    if (formError) {
      setFormError(null);
      setErrorField('');
    }

    setSaved(false);
    setServices((prev) =>
      prev.map((service, currentIndex) =>
        currentIndex === index ? { ...service, [field]: value } : service
      )
    );
  };

  const handleAddService = () => {
    if (services.length >= MAX_SERVICES) return;
    setSaved(false);
    setServices((prev) => [...prev, createEmptyService()]);
  };

  const handleRemoveService = (index) => {
    if (services.length <= MIN_SERVICES) return;
    setSaved(false);
    setServices((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleMoveService = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;
    setSaved(false);
    setServices((prev) => {
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleServiceImageUpload = async (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    setIsUploading(true);
    setFormError(null);
    setErrorField('');
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await api.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      handleServiceChange(index, 'imageUrl', res.data.url);
    } catch (err) {
      setErrorField(`service${index}ImageUrl`);
      setFormError(err.response?.data?.message || 'No se pudo subir la imagen del consultorio externo.');
    } finally {
      setUploadingIndex(null);
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (services.length < MIN_SERVICES || services.length > MAX_SERVICES) {
      setErrorField('');
      setFormError(`La lista de consultorios externos debe tener entre ${MIN_SERVICES} y ${MAX_SERVICES} ítems.`);
      return;
    }
    const firstInvalidFormField = Object.entries(form).find(
      ([name, value]) =>
        !SERVICES_RICH_TEXT_FIELDS.includes(name) && exceedsAdminPlainTextLimit(name, value)
    )?.[0];
    if (firstInvalidFormField) {
      setErrorField(firstInvalidFormField);
      setFormError(`Este campo admite hasta ${ADMIN_PLAIN_TEXT_LIMIT} caracteres.`);
      return;
    }
    const firstInvalidService = services.findIndex(
      (service) =>
        exceedsAdminPlainTextLimit('serviceTitle', service.title) ||
        exceedsAdminPlainTextLimit('serviceImageUrl', service.imageUrl)
    );
    if (firstInvalidService !== -1) {
      setErrorField(
        exceedsAdminPlainTextLimit('serviceTitle', services[firstInvalidService].title)
          ? `service${firstInvalidService}Title`
          : `service${firstInvalidService}ImageUrl`
      );
      setFormError(`Este campo admite hasta ${ADMIN_PLAIN_TEXT_LIMIT} caracteres.`);
      return;
    }

    setSaving(true);
    setFormError(null);
    setSaved(false);
    try {
      const serviceSlugs = buildServiceSlugs(services);

      const bannerSectionId = await ensureSection({
        sections,
        page: 'servicios',
        slug: PAGE_SLUGS.servicios.banner,
        title: form.bannerTitle,
        description: form.bannerSubtitle,
        order: 1,
      });
      const introSectionId = await ensureSection({
        sections,
        page: 'servicios',
        slug: PAGE_SLUGS.servicios.intro,
        title: form.introTitle,
        description: '',
        order: 2,
      });
      const servicesSectionId = await ensureSection({
        sections,
        page: 'servicios',
        slug: PAGE_SLUGS.servicios.list,
        title: 'Lista de consultorios externos',
        description: '',
        order: 3,
      });
      const workflowSectionId = await ensureSection({
        sections,
        page: 'servicios',
        slug: PAGE_SLUGS.servicios.workflow,
        title: form.workflowTitle,
        description: '',
        order: 4,
      });
      const ctaSectionId = await ensureSection({
        sections,
        page: 'servicios',
        slug: PAGE_SLUGS.servicios.cta,
        title: form.ctaTitle,
        description: form.ctaText,
        order: 5,
      });

      await replaceSectionBlocks(bannerSectionId, []);
      await replaceSectionBlocks(introSectionId, [
        { type: 'TEXT', content: form.introBody, order: 1 },
      ]);
      await replaceSectionBlocks(
        servicesSectionId,
        services.map((service, index) => ({
          type: 'CARD',
          title: service.title,
          content: service.content,
          imageUrl: service.imageUrl,
          linkUrl: serviceSlugs[index],
          order: index + 1,
        }))
      );
      await replaceSectionBlocks(workflowSectionId, [
        { type: 'CARD', title: form.workflow1Title, content: form.workflow1Content, order: 1 },
        { type: 'CARD', title: form.workflow2Title, content: form.workflow2Content, order: 2 },
        { type: 'CARD', title: form.workflow3Title, content: form.workflow3Content, order: 3 },
      ]);
      await replaceSectionBlocks(ctaSectionId, []);

      await loadData();
      setSaved(true);
    } catch (err) {
      setErrorField('');
      const message = err.response?.data?.message || 'No se pudo guardar Consultorios Externos.';
      setFormError(null);
      showToast('error', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Consultorios Externos">
        <Loader />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Consultorios Externos">
        <ErrorMessage message={error} onRetry={loadData} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Consultorios Externos">
      <Toast toast={toast} onClose={hideToast} />
      <div className="admin-page">
        <div className="admin-form-card">
          <h3>Contenido de la página</h3>
          <form className="form admin-home-form" onSubmit={handleSubmit}>

            {/* ── Banner ───────────────────────────────────────────── */}
            <div className="admin-section-block admin-section-block--hero">
              <div className="admin-section-block__header"><span>🖼️</span> Banner</div>
              <div className="form-row">
                <div className={`form-group${errorField === 'bannerTitle' ? ' form-group--error' : ''}`}>
                  <label>Título</label>
                  <input name="bannerTitle" value={form.bannerTitle} onChange={handleFormChange} />
                </div>
                <div className={`form-group${errorField === 'bannerSubtitle' ? ' form-group--error' : ''}`}>
                  <label>Subtítulo</label>
                  <input name="bannerSubtitle" value={form.bannerSubtitle} onChange={handleFormChange} />
                </div>
              </div>
            </div>

            {/* ── Introducción ─────────────────────────────────────── */}
            <div className="admin-section-block admin-section-block--about">
              <div className="admin-section-block__header"><span>📝</span> Introducción</div>
              <div className={`form-group${errorField === 'introTitle' ? ' form-group--error' : ''}`}>
                <label>Título</label>
                <input name="introTitle" value={form.introTitle} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label>Texto</label>
                <RichTextEditor
                  value={form.introBody}
                  onChange={(value) => handleRichTextChange('introBody', value)}
                />
              </div>
            </div>

            {/* ── Lista de consultorios externos ───────────────────── */}
            <div className="admin-section-block admin-section-block--services">
              <div className="admin-section-block__header"><span>🗂️</span> Lista de consultorios externos ({services.length}/{MAX_SERVICES})</div>
              <p className="form-note">
                Cada consultorio externo crea su página individual en <code>/servicios/:slug</code>. El campo texto
                corresponde al contenido completo de esa página.
              </p>
            <div className="repeatable-list">
              {services.map((service, index) => (
                <div key={`service-${index}`} className="repeatable-item">
                  <div className="repeatable-item__header">
                    <strong>Consultorio externo {index + 1}</strong>
                    <div className="repeatable-item__actions">
                      <button
                        type="button"
                        className="btn btn--sm btn--outline"
                        onClick={() => handleMoveService(index, 'up')}
                        disabled={index === 0}
                      >
                        ↑ Subir
                      </button>
                      <button
                        type="button"
                        className="btn btn--sm btn--outline"
                        onClick={() => handleMoveService(index, 'down')}
                        disabled={index === services.length - 1}
                      >
                        ↓ Bajar
                      </button>
                      <button
                        type="button"
                        className="btn btn--sm btn--danger"
                        onClick={() => handleRemoveService(index)}
                        disabled={services.length <= MIN_SERVICES}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  <div className={`form-group${errorField === `service${index}Title` ? ' form-group--error' : ''}`}>
                    <label>Título</label>
                    <input
                      value={service.title}
                      onChange={(event) => handleServiceChange(index, 'title', event.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Texto (contenido completo de la página detalle)</label>
                    <RichTextEditor
                      value={service.content}
                      onChange={(value) => handleServiceChange(index, 'content', value)}
                    />
                  </div>
                  <div className={`form-group${errorField === `service${index}ImageUrl` ? ' form-group--error' : ''}`}>
                    <label>Imagen (URL)</label>
                    <input
                      value={service.imageUrl}
                      onChange={(event) => handleServiceChange(index, 'imageUrl', event.target.value)}
                      placeholder="https://..."
                    />
                    <div className="form-upload">
                      <label className="btn btn--outline btn--sm">
                        {uploadingIndex === index ? 'Subiendo...' : '📎 Subir imagen'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => handleServiceImageUpload(index, event)}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {service.imageUrl && <img src={service.imageUrl} alt="Preview" className="upload-preview" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn btn--outline"
              onClick={handleAddService}
              disabled={services.length >= MAX_SERVICES}
            >
              + Agregar consultorio externo
            </button>
            </div>{/* end admin-section-block--services */}

            {/* ── Cómo trabajamos ──────────────────────────────────── */}
            <div className="admin-section-block admin-section-block--workflow">
              <div className="admin-section-block__header"><span>🔄</span> Cómo trabajamos (3 pasos fijos)</div>
              <div className={`form-group${errorField === 'workflowTitle' ? ' form-group--error' : ''}`}>
                <label>Título de sección</label>
                <input name="workflowTitle" value={form.workflowTitle} onChange={handleFormChange} />
              </div>
              <div className="admin-services-grid">
                {[1, 2, 3].map((n) => (
                  <div className="admin-service-card admin-service-card--workflow" key={`workflow-${n}`}>
                    <div className="admin-service-card__label">Paso {n}</div>
                    <div className={`form-group${errorField === `workflow${n}Title` ? ' form-group--error' : ''}`}>
                      <label>Título</label>
                      <input
                        name={`workflow${n}Title`}
                        value={form[`workflow${n}Title`]}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Texto</label>
                      <RichTextEditor
                        value={form[`workflow${n}Content`]}
                        onChange={(value) => handleRichTextChange(`workflow${n}Content`, value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>{/* end admin-section-block--workflow */}

            {/* ── CTA final ────────────────────────────────────────── */}
            <div className="admin-section-block admin-section-block--cta">
              <div className="admin-section-block__header"><span>📣</span> CTA final</div>
              <div className="form-row">
                <div className={`form-group${errorField === 'ctaTitle' ? ' form-group--error' : ''}`}>
                  <label>Título</label>
                  <input name="ctaTitle" value={form.ctaTitle} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Texto</label>
                  <RichTextEditor
                    value={form.ctaText}
                    onChange={(value) => handleRichTextChange('ctaText', value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions" ref={formActionsRef}>
              <button type="submit" className="btn btn--primary" disabled={saving || uploadingIndex !== null}>
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

export default AdminServicios;
