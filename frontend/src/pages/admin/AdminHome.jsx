import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import api from '../../services/api';
import { HOME_DEFAULTS } from '../../constants/homeDefaults';
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
  serviceImageUrls: ['', '', ''],
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

function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState(null);
  const [ids, setIds] = useState(EMPTY_IDS);
  const [form, setForm] = useState(DEFAULT_FORM);

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
          serviceBlocks[0]?.imageUrl || '',
          serviceBlocks[1]?.imageUrl || '',
          serviceBlocks[2]?.imageUrl || '',
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSaved(false);
    setForm((prev) => ({ ...prev, [name]: value }));
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
    setSaving(true);
    setFormError(null);
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
      setFormError(err.response?.data?.message || 'No se pudo guardar Home.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Home (solo texto)">
        <Loader />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Home (solo texto)">
        <ErrorMessage message={error} onRetry={fetchHome} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Home (solo texto)">
      <div className="admin-page">
        {formError && <div className="form-alert form-alert--error">{formError}</div>}
        {saved && <div className="form-alert form-alert--success">Cambios guardados.</div>}

        <div className="admin-form-card">
          <h3>Contenido Home</h3>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Hero - Título</label>
              <input name="heroTitle" value={form.heroTitle} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Hero - Subtítulo</label>
              <input name="heroSubtitle" value={form.heroSubtitle} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Hero - Texto</label>
              <textarea name="heroContent" rows={3} value={form.heroContent} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Hero - Texto del botón</label>
              <input name="heroLinkText" value={form.heroLinkText} onChange={handleChange} />
            </div>

            <h3>Servicios</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Servicio 1 - Título</label>
                <input name="service1Title" value={form.service1Title} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Servicio 2 - Título</label>
                <input name="service2Title" value={form.service2Title} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Servicio 1 - Texto</label>
                <textarea name="service1Content" rows={3} value={form.service1Content} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Servicio 2 - Texto</label>
                <textarea name="service2Content" rows={3} value={form.service2Content} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Servicio 3 - Título</label>
                <input name="service3Title" value={form.service3Title} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Servicio 3 - Texto</label>
                <textarea name="service3Content" rows={3} value={form.service3Content} onChange={handleChange} />
              </div>
            </div>

            <h3>Sección Sobre Nosotros</h3>
            <div className="form-group">
              <label>Eyebrow</label>
              <input name="aboutEyebrow" value={form.aboutEyebrow} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Título</label>
              <input name="aboutTitle" value={form.aboutTitle} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Párrafo principal</label>
              <textarea name="aboutParagraph" rows={4} value={form.aboutParagraph} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Cita destacada</label>
              <textarea name="aboutQuote" rows={3} value={form.aboutQuote} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Párrafo secundario</label>
              <textarea name="aboutExtra" rows={3} value={form.aboutExtra} onChange={handleChange} />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminHome;
