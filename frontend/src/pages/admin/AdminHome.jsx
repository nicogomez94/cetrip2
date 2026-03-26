import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import RichTextEditor from '../../components/admin/RichTextEditor';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import api from '../../services/api';
import { HOME_DEFAULTS } from '../../constants/homeDefaults';
import {
  ADMIN_PLAIN_TEXT_LIMIT,
  exceedsAdminPlainTextLimit,
  exceedsAdminRichTextLimit,
} from '../../utils/adminTextLimit';
import '../../styles/admin.css';
import '../../styles/forms.css';

const SECTION_META = {
  hero: {
    slug: 'home-hero',
    title: 'Hero Principal',
    description: 'Bloque principal de bienvenida de la página de inicio',
    order: 1,
  },
  services: {
    slug: 'home-info',
    title: 'Servicios Home',
    description: 'Servicios principales de la portada',
    order: 2,
  },
  about: {
    slug: 'home-bienvenida',
    title: 'Sobre nuestro centro',
    description: 'Textos institucionales de la portada',
    order: 3,
  },
};

const EMPTY_IDS = {
  heroSectionId: null,
  heroBlockId: null,
  heroImageUrl: '',
  heroLinkUrl: '/admision',
  servicesSectionId: null,
  serviceBlockIds: [null, null, null],
  serviceImageUrls: [
    HOME_DEFAULTS.services[0]?.imageUrl || '',
    HOME_DEFAULTS.services[1]?.imageUrl || '',
    HOME_DEFAULTS.services[2]?.imageUrl || '',
  ],
  aboutSectionId: null,
  aboutBlockIds: [null, null, null],
};

const DEFAULT_FORM = {
  heroTitle: HOME_DEFAULTS.hero.title,
  heroSubtitle: HOME_DEFAULTS.hero.subtitle,
  heroContent: HOME_DEFAULTS.hero.content,
  heroLinkText: HOME_DEFAULTS.hero.linkText,
  service1Title: HOME_DEFAULTS.services[0].title,
  service1Content: HOME_DEFAULTS.services[0].content,
  service2Title: HOME_DEFAULTS.services[1].title,
  service2Content: HOME_DEFAULTS.services[1].content,
  service3Title: HOME_DEFAULTS.services[2].title,
  service3Content: HOME_DEFAULTS.services[2].content,
  aboutEyebrow: HOME_DEFAULTS.about.eyebrow,
  aboutTitle: HOME_DEFAULTS.about.title,
  aboutParagraph: HOME_DEFAULTS.about.paragraph,
  aboutQuote: HOME_DEFAULTS.about.quote,
  aboutExtra: HOME_DEFAULTS.about.extra,
};

const byOrder = (items = []) => [...items].sort((a, b) => a.order - b.order);
const HOME_RICH_TEXT_FIELDS = ['heroContent', 'service1Content', 'service2Content', 'service3Content'];

function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState(null);
  const [errorField, setErrorField] = useState('');
  const [ids, setIds] = useState(EMPTY_IDS);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [uploadingServiceIndex, setUploadingServiceIndex] = useState(null);
  const formActionsRef = useRef(null);

  const fetchHome = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/sections?page=home');
      const homeSections = res.data.data || [];

      const heroSection = homeSections.find((s) => s.slug === SECTION_META.hero.slug);
      const heroBlock = byOrder(heroSection?.blocks).find((b) => b.type === 'HERO');

      const servicesSection = homeSections.find((s) => s.slug === SECTION_META.services.slug);
      const serviceBlocks = byOrder(servicesSection?.blocks).slice(0, 3);

      const aboutSection = homeSections.find((s) => s.slug === SECTION_META.about.slug);
      const aboutBlocks = byOrder(aboutSection?.blocks).slice(0, 3);

      setIds({
        heroSectionId: heroSection?.id || null,
        heroBlockId: heroBlock?.id || null,
        heroImageUrl: heroBlock?.imageUrl || '',
        heroLinkUrl: heroBlock?.linkUrl || '/admision',
        servicesSectionId: servicesSection?.id || null,
        serviceBlockIds: [serviceBlocks[0]?.id || null, serviceBlocks[1]?.id || null, serviceBlocks[2]?.id || null],
        serviceImageUrls: [
          serviceBlocks[0]?.imageUrl || HOME_DEFAULTS.services[0]?.imageUrl || '',
          serviceBlocks[1]?.imageUrl || HOME_DEFAULTS.services[1]?.imageUrl || '',
          serviceBlocks[2]?.imageUrl || HOME_DEFAULTS.services[2]?.imageUrl || '',
        ],
        aboutSectionId: aboutSection?.id || null,
        aboutBlockIds: [aboutBlocks[0]?.id || null, aboutBlocks[1]?.id || null, aboutBlocks[2]?.id || null],
      });

      setForm({
        heroTitle: heroBlock?.title || DEFAULT_FORM.heroTitle,
        heroSubtitle: heroBlock?.subtitle || DEFAULT_FORM.heroSubtitle,
        heroContent: heroBlock?.content || DEFAULT_FORM.heroContent,
        heroLinkText: heroBlock?.linkText || DEFAULT_FORM.heroLinkText,
        service1Title: serviceBlocks[0]?.title || DEFAULT_FORM.service1Title,
        service1Content: serviceBlocks[0]?.content || DEFAULT_FORM.service1Content,
        service2Title: serviceBlocks[1]?.title || DEFAULT_FORM.service2Title,
        service2Content: serviceBlocks[1]?.content || DEFAULT_FORM.service2Content,
        service3Title: serviceBlocks[2]?.title || DEFAULT_FORM.service3Title,
        service3Content: serviceBlocks[2]?.content || DEFAULT_FORM.service3Content,
        aboutEyebrow: aboutSection?.description || DEFAULT_FORM.aboutEyebrow,
        aboutTitle: aboutSection?.title || DEFAULT_FORM.aboutTitle,
        aboutParagraph: aboutBlocks[0]?.content || DEFAULT_FORM.aboutParagraph,
        aboutQuote: aboutBlocks[1]?.content || DEFAULT_FORM.aboutQuote,
        aboutExtra: aboutBlocks[2]?.content || DEFAULT_FORM.aboutExtra,
      });
    } catch {
      setError('No se pudo cargar el contenido de Home.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHome();
  }, []);

  useEffect(() => {
    if (!formError) return;
    formActionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [formError]);

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

  const handleServiceImageChange = (index, value) => {
    if (exceedsAdminPlainTextLimit(`serviceImageUrl${index}`, value)) {
      setErrorField(`serviceImageUrl${index}`);
      setFormError(`Este campo admite hasta ${ADMIN_PLAIN_TEXT_LIMIT} caracteres.`);
      return;
    }
    if (formError) {
      setFormError(null);
      setErrorField('');
    }
    setSaved(false);
    setIds((prev) => ({
      ...prev,
      serviceImageUrls: prev.serviceImageUrls.map((url, currentIndex) =>
        currentIndex === index ? value : url
      ),
    }));
  };

  const handleServiceImageUpload = async (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingServiceIndex(index);
    setFormError(null);
    setErrorField('');
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await api.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      handleServiceImageChange(index, res.data.url);
    } catch (err) {
      setErrorField(`serviceImageUrl${index}`);
      setFormError(err.response?.data?.message || 'No se pudo subir la imagen del servicio.');
    } finally {
      setUploadingServiceIndex(null);
    }
  };

  const ensureSection = async (existingId, meta, sectionData = {}) => {
    if (existingId) {
      await api.put(`/admin/sections/${existingId}`, {
        title: sectionData.title ?? meta.title,
        description: sectionData.description ?? meta.description,
        page: 'home',
        order: meta.order,
        isActive: true,
      });
      return existingId;
    }

    const res = await api.post('/admin/sections', {
      slug: meta.slug,
      title: sectionData.title ?? meta.title,
      description: sectionData.description ?? meta.description,
      page: 'home',
      order: meta.order,
      isActive: true,
    });
    return res.data.data.id;
  };

  const ensureBlock = async (existingId, blockData) => {
    if (existingId) {
      await api.put(`/admin/blocks/${existingId}`, blockData);
      return existingId;
    }
    const res = await api.post('/admin/blocks', blockData);
    return res.data.data.id;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const firstInvalidPlainField = Object.entries(form).find(
      ([name, value]) =>
        !HOME_RICH_TEXT_FIELDS.includes(name) && exceedsAdminPlainTextLimit(name, value)
    )?.[0];
    if (firstInvalidPlainField) {
      setErrorField(firstInvalidPlainField);
      setFormError(`Este campo admite hasta ${ADMIN_PLAIN_TEXT_LIMIT} caracteres.`);
      return;
    }
    const firstInvalidRichField = HOME_RICH_TEXT_FIELDS.find((fieldName) =>
      exceedsAdminRichTextLimit(form[fieldName])
    );
    if (firstInvalidRichField) {
      setErrorField(firstInvalidRichField);
      setFormError(`Este campo admite hasta ${ADMIN_PLAIN_TEXT_LIMIT} caracteres.`);
      return;
    }
    const firstInvalidServiceImage = ids.serviceImageUrls.findIndex((value) =>
      exceedsAdminPlainTextLimit('serviceImageUrl', value)
    );
    if (firstInvalidServiceImage !== -1) {
      setErrorField(`serviceImageUrl${firstInvalidServiceImage}`);
      setFormError(`Este campo admite hasta ${ADMIN_PLAIN_TEXT_LIMIT} caracteres.`);
      return;
    }

    setSaving(true);
    setFormError(null);
    setErrorField('');
    setSaved(false);

    try {
      const heroSectionId = await ensureSection(ids.heroSectionId, SECTION_META.hero);
      const heroBlockId = await ensureBlock(ids.heroBlockId, {
        sectionId: heroSectionId,
        type: 'HERO',
        title: form.heroTitle,
        subtitle: form.heroSubtitle,
        content: form.heroContent,
        imageUrl: ids.heroImageUrl,
        linkUrl: ids.heroLinkUrl || '/admision',
        linkText: form.heroLinkText,
        order: 1,
        isActive: true,
      });

      const servicesSectionId = await ensureSection(ids.servicesSectionId, SECTION_META.services);
      const nextServiceIds = [];
      for (let i = 0; i < 3; i += 1) {
        const number = i + 1;
        const blockId = await ensureBlock(ids.serviceBlockIds[i], {
          sectionId: servicesSectionId,
          type: 'CARD',
          title: form[`service${number}Title`],
          content: form[`service${number}Content`],
          imageUrl: ids.serviceImageUrls[i],
          order: number,
          isActive: true,
        });
        nextServiceIds.push(blockId);
      }

      const aboutSectionId = await ensureSection(ids.aboutSectionId, SECTION_META.about, {
        title: form.aboutTitle,
        description: form.aboutEyebrow,
      });

      const aboutValues = [form.aboutParagraph, form.aboutQuote, form.aboutExtra];
      const nextAboutIds = [];
      for (let i = 0; i < 3; i += 1) {
        const blockId = await ensureBlock(ids.aboutBlockIds[i], {
          sectionId: aboutSectionId,
          type: 'TEXT',
          content: aboutValues[i],
          order: i + 1,
          isActive: true,
        });
        nextAboutIds.push(blockId);
      }

      setIds((prev) => ({
        ...prev,
        heroSectionId,
        heroBlockId,
        servicesSectionId,
        serviceBlockIds: nextServiceIds,
        aboutSectionId,
        aboutBlockIds: nextAboutIds,
      }));
      setSaved(true);
    } catch (err) {
      setErrorField('');
      setFormError(err.response?.data?.message || 'No se pudo guardar Home.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Home">
        <Loader />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Home">
        <ErrorMessage message={error} onRetry={fetchHome} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Home">
      <div className="admin-page">
        {saved && <div className="form-alert form-alert--success">Cambios guardados.</div>}

        <div className="admin-form-card">
          <h3>Contenido Home</h3>
          <form className="form admin-home-form" onSubmit={handleSubmit}>

            {/* ── Hero ─────────────────────────────────────────────── */}
            <div className="admin-section-block admin-section-block--hero">
              <div className="admin-section-block__header">
                <span>🏠</span> Hero Principal
              </div>
              <div className="form-row">
                <div className={`form-group${errorField === 'heroTitle' ? ' form-group--error' : ''}`}>
                  <label>Título</label>
                  <input name="heroTitle" value={form.heroTitle} onChange={handleChange} />
                </div>
                <div className={`form-group${errorField === 'heroSubtitle' ? ' form-group--error' : ''}`}>
                  <label>Subtítulo</label>
                  <input name="heroSubtitle" value={form.heroSubtitle} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className={`form-group${errorField === 'heroContent' ? ' form-group--error' : ''}`}>
                  <label>Texto</label>
                  <RichTextEditor
                    value={form.heroContent}
                    onChange={(value) => handleRichTextChange('heroContent', value)}
                  />
                </div>
                <div className={`form-group${errorField === 'heroLinkText' ? ' form-group--error' : ''}`}>
                  <label>Texto del botón</label>
                  <input name="heroLinkText" value={form.heroLinkText} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* ── Servicios ────────────────────────────────────────── */}
            <div className="admin-section-block admin-section-block--services">
              <div className="admin-section-block__header">
                <span>🗂️</span> Servicios
              </div>
              <div className="admin-services-grid">
                {[0, 1, 2].map((index) => {
                  const number = index + 1;
                  return (
                    <div className="admin-service-card" key={`service-card-${index}`}>
                      <div className="admin-service-card__label">Servicio {number}</div>
                      <div className={`form-group${errorField === `service${number}Title` ? ' form-group--error' : ''}`}>
                        <label>Título</label>
                        <input
                          name={`service${number}Title`}
                          value={form[`service${number}Title`]}
                          onChange={handleChange}
                        />
                      </div>
                      <div className={`form-group${errorField === `service${number}Content` ? ' form-group--error' : ''}`}>
                        <label>Texto</label>
                        <RichTextEditor
                          value={form[`service${number}Content`]}
                          onChange={(value) => handleRichTextChange(`service${number}Content`, value)}
                        />
                      </div>
                      <div className={`form-group${errorField === `serviceImageUrl${index}` ? ' form-group--error' : ''}`}>
                        <label>Imagen (URL)</label>
                        <input
                          value={ids.serviceImageUrls[index] || ''}
                          onChange={(event) => handleServiceImageChange(index, event.target.value)}
                          placeholder="https://..."
                        />
                        <div className="form-upload">
                          <label className="btn btn--outline btn--sm">
                            {uploadingServiceIndex === index ? 'Subiendo...' : '📎 Subir imagen'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) => handleServiceImageUpload(index, event)}
                              style={{ display: 'none' }}
                            />
                          </label>
                          {ids.serviceImageUrls[index] && (
                            <img
                              src={ids.serviceImageUrls[index]}
                              alt={`Preview servicio ${number}`}
                              className="upload-preview"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Sobre Nosotros ───────────────────────────────────── */}
            <div className="admin-section-block admin-section-block--about">
              <div className="admin-section-block__header">
                <span>ℹ️</span> Sección Sobre Nosotros
              </div>
              <div className="form-row">
                <div className={`form-group${errorField === 'aboutEyebrow' ? ' form-group--error' : ''}`}>
                  <label>Eyebrow</label>
                  <input name="aboutEyebrow" value={form.aboutEyebrow} onChange={handleChange} />
                </div>
                <div className={`form-group${errorField === 'aboutTitle' ? ' form-group--error' : ''}`}>
                  <label>Título</label>
                  <input name="aboutTitle" value={form.aboutTitle} onChange={handleChange} />
                </div>
              </div>
              <div className={`form-group${errorField === 'aboutParagraph' ? ' form-group--error' : ''}`}>
                <label>Párrafo principal</label>
                <textarea name="aboutParagraph" rows={4} value={form.aboutParagraph} onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className={`form-group${errorField === 'aboutQuote' ? ' form-group--error' : ''}`}>
                  <label>Cita destacada</label>
                  <textarea name="aboutQuote" rows={3} value={form.aboutQuote} onChange={handleChange} />
                </div>
                <div className={`form-group${errorField === 'aboutExtra' ? ' form-group--error' : ''}`}>
                  <label>Párrafo secundario</label>
                  <textarea name="aboutExtra" rows={3} value={form.aboutExtra} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="form-actions" ref={formActionsRef}>
              <button type="submit" className="btn btn--primary" disabled={saving || uploadingServiceIndex !== null}>
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

export default AdminHome;
