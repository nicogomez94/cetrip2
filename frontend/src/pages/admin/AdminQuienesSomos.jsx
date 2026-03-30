import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import RichTextEditor from '../../components/admin/RichTextEditor';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import Toast from '../../components/common/Toast';
import useToast from '../../hooks/useToast';
import { QUIENES_DEFAULTS } from '../../constants/publicPageDefaults';
import { mapQuienesPage } from '../../utils/publicPageMappers';
import {
  ADMIN_PLAIN_TEXT_LIMIT,
  exceedsAdminPlainTextLimit,
  exceedsAdminRichTextLimit,
} from '../../utils/adminTextLimit';
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

const INITIAL_FORM = {
  bannerTitle: QUIENES_DEFAULTS.bannerTitle,
  bannerSubtitle: QUIENES_DEFAULTS.bannerSubtitle,
  introEyebrow: QUIENES_DEFAULTS.introEyebrow,
  introTitle: QUIENES_DEFAULTS.introTitle,
  introBody: QUIENES_DEFAULTS.introBody,
  mainImage: QUIENES_DEFAULTS.mainImage,
  identity1Title: QUIENES_DEFAULTS.identity[0].title,
  identity1Content: QUIENES_DEFAULTS.identity[0].content,
  identity2Title: QUIENES_DEFAULTS.identity[1].title,
  identity2Content: QUIENES_DEFAULTS.identity[1].content,
  identity3Title: QUIENES_DEFAULTS.identity[2].title,
  identity3Content: QUIENES_DEFAULTS.identity[2].content,
  trustTitle: QUIENES_DEFAULTS.trustTitle,
  trustBody: QUIENES_DEFAULTS.trustBody,
};

const QUIENES_RICH_TEXT_FIELDS = [
  'introBody',
  'identity1Content',
  'identity2Content',
  'identity3Content',
  'trustBody',
];

function AdminQuienesSomos() {
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [errorField, setErrorField] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { setIsUploading } = useUpload();
  const formActionsRef = useRef(null);
  const { toast, showToast, hideToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const pageSections = await fetchSectionsByPage('quienes-somos');
      const mapped = mapQuienesPage(pageSections);
      const introBlocks = getSectionBlocks(pageSections, PAGE_SLUGS.quienes.intro);
      const identityBlocks = getSectionBlocks(pageSections, PAGE_SLUGS.quienes.identity);
      const trustBlocks = getSectionBlocks(pageSections, PAGE_SLUGS.quienes.trust);

      const introTextBlock = introBlocks.find((block) => block.type === 'TEXT');
      const introImageBlock = introBlocks.find((block) => block.type === 'IMAGE');

      setSections(pageSections);
      setForm({
        bannerTitle: mapped.bannerTitle,
        bannerSubtitle: mapped.bannerSubtitle,
        introEyebrow: mapped.introEyebrow,
        introTitle: mapped.introTitle,
        introBody: introTextBlock?.content || mapped.introBody,
        mainImage: introImageBlock?.imageUrl || mapped.mainImage,
        identity1Title: identityBlocks[0]?.title || mapped.identity[0].title,
        identity1Content: identityBlocks[0]?.content || mapped.identity[0].content,
        identity2Title: identityBlocks[1]?.title || mapped.identity[1].title,
        identity2Content: identityBlocks[1]?.content || mapped.identity[1].content,
        identity3Title: identityBlocks[2]?.title || mapped.identity[2].title,
        identity3Content: identityBlocks[2]?.content || mapped.identity[2].content,
        trustTitle: mapped.trustTitle,
        trustBody: trustBlocks[0]?.content || mapped.trustBody,
      });
    } catch {
      setError('No se pudo cargar el editor de Quiénes Somos.');
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

  const handleRichTextChange = (name, value) => {
    if (exceedsAdminRichTextLimit(value)) {
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

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setIsUploading(true);
    setFormError(null);
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await api.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, mainImage: res.data.url }));
      setSaved(false);
      if (formError) {
        setFormError(null);
        setErrorField('');
      }
    } catch (err) {
      setErrorField('mainImage');
      setFormError(err.response?.data?.message || 'No se pudo subir la imagen.');
    } finally {
      setUploadingImage(false);
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const plainFieldsTooLong = Object.entries(form).some(
      ([name, value]) =>
        !QUIENES_RICH_TEXT_FIELDS.includes(name) && exceedsAdminPlainTextLimit(name, value)
    );
    if (plainFieldsTooLong) {
      const firstInvalidField = Object.entries(form).find(
        ([name, value]) =>
          !QUIENES_RICH_TEXT_FIELDS.includes(name) && exceedsAdminPlainTextLimit(name, value)
      )?.[0];
      setErrorField(firstInvalidField || '');
      setFormError(`Este campo admite hasta ${ADMIN_PLAIN_TEXT_LIMIT} caracteres.`);
      return;
    }
    const firstInvalidRichField = QUIENES_RICH_TEXT_FIELDS.find((fieldName) =>
      exceedsAdminRichTextLimit(form[fieldName])
    );
    if (firstInvalidRichField) {
      setErrorField(firstInvalidRichField);
      setFormError(`Este campo admite hasta ${ADMIN_PLAIN_TEXT_LIMIT} caracteres.`);
      return;
    }

    setSaving(true);
    setFormError(null);
    setSaved(false);
    try {
      const bannerSectionId = await ensureSection({
        sections,
        page: 'quienes-somos',
        slug: PAGE_SLUGS.quienes.banner,
        title: form.bannerTitle,
        description: form.bannerSubtitle,
        order: 1,
      });
      const introSectionId = await ensureSection({
        sections,
        page: 'quienes-somos',
        slug: PAGE_SLUGS.quienes.intro,
        title: form.introTitle,
        description: form.introEyebrow,
        order: 2,
      });
      const identitySectionId = await ensureSection({
        sections,
        page: 'quienes-somos',
        slug: PAGE_SLUGS.quienes.identity,
        title: 'Identidad',
        description: 'Misión, visión y enfoque',
        order: 3,
      });
      const trustSectionId = await ensureSection({
        sections,
        page: 'quienes-somos',
        slug: PAGE_SLUGS.quienes.trust,
        title: form.trustTitle,
        description: '',
        order: 4,
      });

      await replaceSectionBlocks(introSectionId, [
        { type: 'TEXT', content: form.introBody, order: 1 },
        { type: 'IMAGE', title: 'Imagen principal', imageUrl: form.mainImage, order: 2 },
      ]);

      await replaceSectionBlocks(identitySectionId, [
        { type: 'CARD', title: form.identity1Title, content: form.identity1Content, order: 1 },
        { type: 'CARD', title: form.identity2Title, content: form.identity2Content, order: 2 },
        { type: 'CARD', title: form.identity3Title, content: form.identity3Content, order: 3 },
      ]);

      await replaceSectionBlocks(trustSectionId, [
        { type: 'TEXT', content: form.trustBody, order: 1 },
      ]);

      // Banner section intentionally has no blocks.
      await replaceSectionBlocks(bannerSectionId, []);

      await loadData();
      setSaved(true);
    } catch (err) {
      setErrorField('');
      const message = err.response?.data?.message || 'No se pudo guardar Quiénes Somos.';
      setFormError(null);
      showToast('error', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Quiénes Somos">
        <Loader />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Quiénes Somos">
        <ErrorMessage message={error} onRetry={loadData} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Quiénes Somos">
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
                  <input name="bannerTitle" value={form.bannerTitle} onChange={handleChange} />
                </div>
                <div className={`form-group${errorField === 'bannerSubtitle' ? ' form-group--error' : ''}`}>
                  <label>Subtítulo</label>
                  <input name="bannerSubtitle" value={form.bannerSubtitle} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* ── Introducción ─────────────────────────────────────── */}
            <div className="admin-section-block admin-section-block--about">
              <div className="admin-section-block__header"><span>📝</span> Introducción</div>
              <div className="form-row">
                <div className={`form-group${errorField === 'introEyebrow' ? ' form-group--error' : ''}`}>
                  <label>Eyebrow</label>
                  <input name="introEyebrow" value={form.introEyebrow} onChange={handleChange} />
                </div>
                <div className={`form-group${errorField === 'introTitle' ? ' form-group--error' : ''}`}>
                  <label>Título</label>
                  <input name="introTitle" value={form.introTitle} onChange={handleChange} />
                </div>
              </div>
              <div className={`form-group${errorField === 'introBody' ? ' form-group--error' : ''}`}>
                <label>Texto</label>
                <RichTextEditor
                  value={form.introBody}
                  onChange={(value) => handleRichTextChange('introBody', value)}
                />
              </div>
              <div className={`form-group${errorField === 'mainImage' ? ' form-group--error' : ''}`}>
                <label>Imagen principal (URL)</label>
                <input name="mainImage" value={form.mainImage} onChange={handleChange} placeholder="https://..." />
                <div className="form-upload">
                  <label className="btn btn--outline btn--sm">
                    {uploadingImage ? 'Subiendo...' : '📎 Subir imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImage}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {form.mainImage && <img src={form.mainImage} alt="Preview" className="upload-preview" />}
                </div>
              </div>
            </div>

            {/* ── Identidad ────────────────────────────────────────── */}
            <div className="admin-section-block admin-section-block--services">
              <div className="admin-section-block__header"><span>🏛️</span> Identidad (3 bloques fijos)</div>
              <div className="admin-services-grid">
                {[1, 2, 3].map((n) => (
                  <div className="admin-service-card" key={`identity-${n}`}>
                    <div className="admin-service-card__label">Bloque {n}</div>
                    <div className={`form-group${errorField === `identity${n}Title` ? ' form-group--error' : ''}`}>
                      <label>Título</label>
                      <input
                        name={`identity${n}Title`}
                        value={form[`identity${n}Title`]}
                        onChange={handleChange}
                      />
                    </div>
                    <div className={`form-group${errorField === `identity${n}Content` ? ' form-group--error' : ''}`}>
                      <label>Texto</label>
                      <RichTextEditor
                        value={form[`identity${n}Content`]}
                        onChange={(value) => handleRichTextChange(`identity${n}Content`, value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CTA ──────────────────────────────────────────────── */}
            <div className="admin-section-block admin-section-block--cta">
              <div className="admin-section-block__header"><span>🤝</span> Franja de confianza (CTA)</div>
              <div className="form-row">
                <div className={`form-group${errorField === 'trustTitle' ? ' form-group--error' : ''}`}>
                  <label>Título</label>
                  <input name="trustTitle" value={form.trustTitle} onChange={handleChange} />
                </div>
                <div className={`form-group${errorField === 'trustBody' ? ' form-group--error' : ''}`}>
                  <label>Texto</label>
                  <RichTextEditor
                    value={form.trustBody}
                    onChange={(value) => handleRichTextChange('trustBody', value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions" ref={formActionsRef}>
              <button type="submit" className="btn btn--primary" disabled={saving || uploadingImage}>
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

export default AdminQuienesSomos;
