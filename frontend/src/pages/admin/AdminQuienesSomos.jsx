import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import { QUIENES_DEFAULTS } from '../../constants/publicPageDefaults';
import { mapQuienesPage } from '../../utils/publicPageMappers';
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

function AdminQuienesSomos() {
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSaved(false);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError(null);
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await api.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, mainImage: res.data.url }));
      setSaved(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'No se pudo subir la imagen.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      setFormError(err.response?.data?.message || 'No se pudo guardar Quiénes Somos.');
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
                <input name="bannerTitle" value={form.bannerTitle} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Subtítulo</label>
                <input name="bannerSubtitle" value={form.bannerSubtitle} onChange={handleChange} />
              </div>
            </div>

            <h3>Introducción</h3>
            <div className="form-group">
              <label>Eyebrow</label>
              <input name="introEyebrow" value={form.introEyebrow} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Título</label>
              <input name="introTitle" value={form.introTitle} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Texto</label>
              <textarea name="introBody" rows={4} value={form.introBody} onChange={handleChange} />
            </div>
            <div className="form-group">
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

            <h3>Identidad (3 bloques fijos)</h3>
            <div className="form-group">
              <label>Bloque 1 - Título</label>
              <input name="identity1Title" value={form.identity1Title} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Bloque 1 - Texto</label>
              <textarea name="identity1Content" rows={3} value={form.identity1Content} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Bloque 2 - Título</label>
              <input name="identity2Title" value={form.identity2Title} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Bloque 2 - Texto</label>
              <textarea name="identity2Content" rows={3} value={form.identity2Content} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Bloque 3 - Título</label>
              <input name="identity3Title" value={form.identity3Title} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Bloque 3 - Texto</label>
              <textarea name="identity3Content" rows={3} value={form.identity3Content} onChange={handleChange} />
            </div>

            <h3>Franja de confianza (CTA)</h3>
            <div className="form-group">
              <label>Título</label>
              <input name="trustTitle" value={form.trustTitle} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Texto</label>
              <textarea name="trustBody" rows={3} value={form.trustBody} onChange={handleChange} />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary" disabled={saving || uploadingImage}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminQuienesSomos;
