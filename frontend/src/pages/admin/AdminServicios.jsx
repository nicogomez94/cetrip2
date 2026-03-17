import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import RichTextEditor from '../../components/admin/RichTextEditor';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import { SERVICIOS_DEFAULTS } from '../../constants/publicPageDefaults';
import { mapServiciosPage } from '../../utils/publicPageMappers';
import {
  PAGE_SLUGS,
  ensureSection,
  fetchSectionsByPage,
  getSectionBlocks,
  replaceSectionBlocks,
} from '../../services/adminPageContent';
import api from '../../services/api';
import '../../styles/admin.css';
import '../../styles/forms.css';

const MIN_SERVICES = 3;
const MAX_SERVICES = 12;

const CTA_DEFAULT_TITLE = '¿Querés que evaluemos tu caso?';
const CTA_DEFAULT_TEXT = 'Podemos orientarte sobre el tratamiento más adecuado para tu hijo o hija.';

const createEmptyService = () => ({
  title: 'Nuevo servicio',
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

function AdminServicios() {
  const [sections, setSections] = useState([]);
  const [services, setServices] = useState(SERVICIOS_DEFAULTS.services);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);

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
      setError('No se pudo cargar el editor de Servicios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setSaved(false);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRichTextChange = (name, value) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (index, field, value) => {
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
    setFormError(null);
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await api.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      handleServiceChange(index, 'imageUrl', res.data.url);
    } catch (err) {
      setFormError(err.response?.data?.message || 'No se pudo subir la imagen del servicio.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (services.length < MIN_SERVICES || services.length > MAX_SERVICES) {
      setFormError(`La lista de servicios debe tener entre ${MIN_SERVICES} y ${MAX_SERVICES} ítems.`);
      return;
    }

    setSaving(true);
    setFormError(null);
    setSaved(false);
    try {
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
        title: 'Lista de servicios',
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
      setFormError(err.response?.data?.message || 'No se pudo guardar Servicios.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Servicios">
        <Loader />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Servicios">
        <ErrorMessage message={error} onRetry={loadData} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Servicios">
      <div className="admin-page">
        {formError && <div className="form-alert form-alert--error">{formError}</div>}
        {saved && <div className="form-alert form-alert--success">Cambios guardados.</div>}

        <div className="admin-form-card">
          <h3>Contenido de la página</h3>
          <form className="form" onSubmit={handleSubmit}>
            <h3>Banner</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Título</label>
                <input name="bannerTitle" value={form.bannerTitle} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label>Subtítulo</label>
                <input name="bannerSubtitle" value={form.bannerSubtitle} onChange={handleFormChange} />
              </div>
            </div>

            <h3>Introducción</h3>
            <div className="form-group">
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

            <h3>Lista de servicios ({services.length}/{MAX_SERVICES})</h3>
            <div className="repeatable-list">
              {services.map((service, index) => (
                <div key={`service-${index}`} className="repeatable-item">
                  <div className="repeatable-item__header">
                    <strong>Servicio {index + 1}</strong>
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

                  <div className="form-group">
                    <label>Título</label>
                    <input
                      value={service.title}
                      onChange={(event) => handleServiceChange(index, 'title', event.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Texto</label>
                    <RichTextEditor
                      value={service.content}
                      onChange={(value) => handleServiceChange(index, 'content', value)}
                    />
                  </div>
                  <div className="form-group">
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
              + Agregar servicio
            </button>

            <h3>Cómo trabajamos (3 pasos fijos)</h3>
            <div className="form-group">
              <label>Título de sección</label>
              <input name="workflowTitle" value={form.workflowTitle} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label>Paso 1 - Título</label>
              <input name="workflow1Title" value={form.workflow1Title} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label>Paso 1 - Texto</label>
              <RichTextEditor
                value={form.workflow1Content}
                onChange={(value) => handleRichTextChange('workflow1Content', value)}
              />
            </div>
            <div className="form-group">
              <label>Paso 2 - Título</label>
              <input name="workflow2Title" value={form.workflow2Title} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label>Paso 2 - Texto</label>
              <RichTextEditor
                value={form.workflow2Content}
                onChange={(value) => handleRichTextChange('workflow2Content', value)}
              />
            </div>
            <div className="form-group">
              <label>Paso 3 - Título</label>
              <input name="workflow3Title" value={form.workflow3Title} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label>Paso 3 - Texto</label>
              <RichTextEditor
                value={form.workflow3Content}
                onChange={(value) => handleRichTextChange('workflow3Content', value)}
              />
            </div>

            <h3>CTA final</h3>
            <div className="form-group">
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

            <div className="form-actions">
              <button type="submit" className="btn btn--primary" disabled={saving || uploadingIndex !== null}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminServicios;
