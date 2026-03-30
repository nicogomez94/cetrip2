import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import RichTextEditor from '../../components/admin/RichTextEditor';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import Toast from '../../components/common/Toast';
import useToast from '../../hooks/useToast';
import api from '../../services/api';
import { useUpload } from '../../context/UploadContext';
import { HOME_DEFAULTS } from '../../constants/homeDefaults';
import {
  ADMIN_PLAIN_TEXT_LIMIT,
  ADMIN_RICH_TEXT_LIMIT,
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
  carousel: {
    slug: 'home-carrusel',
    title: 'Carrusel del Hero',
    description: 'Imágenes rotativas del encabezado de Home',
    order: 2,
  },
  services: {
    slug: 'home-info',
    title: 'Consultorios Externos Home',
    description: 'Consultorios externos principales de la portada',
    order: 3,
  },
  about: {
    slug: 'home-bienvenida',
    title: 'Sobre nuestro centro',
    description: 'Textos institucionales de la portada',
    order: 4,
  },
};

const HERO_CAROUSEL_LIMIT = 4;
const DEFAULT_HERO_CAROUSEL_IMAGES = Array.from(
  { length: HERO_CAROUSEL_LIMIT },
  (_, index) => HOME_DEFAULTS.images.gallery[index] || ''
);

const EMPTY_IDS = {
  heroSectionId: null,
  heroBlockId: null,
  heroImageUrl: '',
  heroLinkUrl: '/admision',
  carouselSectionId: null,
  carouselBlockIds: [null, null, null, null],
  carouselImageUrls: DEFAULT_HERO_CAROUSEL_IMAGES,
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
  const [uploadingCarouselIndex, setUploadingCarouselIndex] = useState(null);
  const { setIsUploading } = useUpload();
  const formActionsRef = useRef(null);
  const { toast, showToast, hideToast } = useToast();

  const fetchHome = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/sections?page=home');
      const homeSections = res.data.data || [];

      const heroSection = homeSections.find((s) => s.slug === SECTION_META.hero.slug);
      const heroBlock = byOrder(heroSection?.blocks).find((b) => b.type === 'HERO');

      const carouselSection = homeSections.find((s) => s.slug === SECTION_META.carousel.slug);
      const carouselBlocks = byOrder(carouselSection?.blocks)
        .filter((b) => b.type === 'IMAGE')
        .slice(0, HERO_CAROUSEL_LIMIT);

      const servicesSection = homeSections.find((s) => s.slug === SECTION_META.services.slug);
      const serviceBlocks = byOrder(servicesSection?.blocks).slice(0, 3);

      const aboutSection = homeSections.find((s) => s.slug === SECTION_META.about.slug);
      const aboutBlocks = byOrder(aboutSection?.blocks).slice(0, 3);

      setIds({
        heroSectionId: heroSection?.id || null,
        heroBlockId: heroBlock?.id || null,
        heroImageUrl: heroBlock?.imageUrl || '',
        heroLinkUrl: heroBlock?.linkUrl || '/admision',
        carouselSectionId: carouselSection?.id || null,
        carouselBlockIds: Array.from(
          { length: HERO_CAROUSEL_LIMIT },
          (_, index) => carouselBlocks[index]?.id || null
        ),
        carouselImageUrls: Array.from(
          { length: HERO_CAROUSEL_LIMIT },
          (_, index) => carouselBlocks[index]?.imageUrl || DEFAULT_HERO_CAROUSEL_IMAGES[index]
        ),
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
      setFormError(`Este campo admite hasta ${ADMIN_RICH_TEXT_LIMIT} caracteres.`);
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
    setIsUploading(true);
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
      setFormError(err.response?.data?.message || 'No se pudo subir la imagen del consultorio externo.');
    } finally {
      setUploadingServiceIndex(null);
      setIsUploading(false);
    }
  };

  const handleCarouselImageChange = (index, value) => {
    if (exceedsAdminPlainTextLimit(`carouselImageUrl${index}`, value)) {
      setErrorField(`carouselImageUrl${index}`);
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
      carouselImageUrls: prev.carouselImageUrls.map((url, currentIndex) =>
        currentIndex === index ? value : url
      ),
    }));
  };

  const handleCarouselImageUpload = async (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingCarouselIndex(index);
    setIsUploading(true);
    setFormError(null);
    setErrorField('');
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await api.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      handleCarouselImageChange(index, res.data.url);
    } catch (err) {
      setErrorField(`carouselImageUrl${index}`);
      setFormError(err.response?.data?.message || 'No se pudo subir la imagen del carrusel.');
    } finally {
      setUploadingCarouselIndex(null);
      setIsUploading(false);
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
      setFormError(`Este campo admite hasta ${ADMIN_RICH_TEXT_LIMIT} caracteres.`);
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
    const firstInvalidCarouselImage = ids.carouselImageUrls.findIndex((value) =>
      exceedsAdminPlainTextLimit('carouselImageUrl', value)
    );
    if (firstInvalidCarouselImage !== -1) {
      setErrorField(`carouselImageUrl${firstInvalidCarouselImage}`);
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

      const carouselSectionId = await ensureSection(ids.carouselSectionId, SECTION_META.carousel);
      const nextCarouselBlockIds = [];
      for (let i = 0; i < HERO_CAROUSEL_LIMIT; i += 1) {
        const blockId = await ensureBlock(ids.carouselBlockIds[i], {
          sectionId: carouselSectionId,
          type: 'IMAGE',
          title: `Slide ${i + 1}`,
          imageUrl: ids.carouselImageUrls[i],
          order: i + 1,
          isActive: true,
        });
        nextCarouselBlockIds.push(blockId);
      }

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
        carouselSectionId,
        carouselBlockIds: nextCarouselBlockIds,
        servicesSectionId,
        serviceBlockIds: nextServiceIds,
        aboutSectionId,
        aboutBlockIds: nextAboutIds,
      }));
      setSaved(true);
    } catch (err) {
      setErrorField('');
      const message = err.response?.data?.message || 'No se pudo guardar Home.';
      setFormError(null);
      showToast('error', message);
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
      <Toast toast={toast} onClose={hideToast} />
      <div className="admin-page">
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

            {/* ── Carrusel ────────────────────────────────────────── */}
            <div className="admin-section-block admin-section-block--carousel">
              <div className="admin-section-block__header">
                <span>🎞️</span> Carrusel Hero
              </div>
              <p className="form-note">
                Editá los 4 slides que se muestran en el encabezado de Inicio.
              </p>
              <div className="admin-carousel-grid">
                {Array.from({ length: HERO_CAROUSEL_LIMIT }, (_, index) => (
                  <div className="admin-service-card admin-service-card--carousel" key={`carousel-slide-${index}`}>
                    <div className="admin-service-card__label">Slide {index + 1}</div>
                    <div className={`form-group${errorField === `carouselImageUrl${index}` ? ' form-group--error' : ''}`}>
                      <label>Imagen (URL)</label>
                      <input
                        value={ids.carouselImageUrls[index] || ''}
                        onChange={(event) => handleCarouselImageChange(index, event.target.value)}
                        placeholder="https://..."
                      />
                      <div className="form-upload">
                        <label className="btn btn--outline btn--sm">
                          {uploadingCarouselIndex === index ? 'Subiendo...' : '📎 Subir imagen'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => handleCarouselImageUpload(index, event)}
                            style={{ display: 'none' }}
                          />
                        </label>
                        {ids.carouselImageUrls[index] && (
                          <img
                            src={ids.carouselImageUrls[index]}
                            alt={`Preview slide ${index + 1}`}
                            className="upload-preview"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Consultorios Externos ───────────────────────────── */}
            <div className="admin-section-block admin-section-block--services">
              <div className="admin-section-block__header">
                <span>🗂️</span> Consultorios Externos
              </div>
              <div className="admin-services-grid">
                {[0, 1, 2].map((index) => {
                  const number = index + 1;
                  return (
                    <div className="admin-service-card" key={`service-card-${index}`}>
                      <div className="admin-service-card__label">Consultorio externo {number}</div>
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
                              alt={`Preview consultorio externo ${number}`}
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
              <button
                type="submit"
                className="btn btn--primary"
                disabled={saving || uploadingServiceIndex !== null || uploadingCarouselIndex !== null}
              >
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
