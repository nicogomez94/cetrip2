import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import RichTextEditor from '../../components/admin/RichTextEditor';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import { ADMISION_DEFAULTS } from '../../constants/publicPageDefaults';
import { mapAdmisionPage } from '../../utils/publicPageMappers';
import {
  PAGE_SLUGS,
  ensureSection,
  fetchSectionsByPage,
  getSectionBlocks,
  replaceSectionBlocks,
} from '../../services/adminPageContent';
import '../../styles/admin.css';
import '../../styles/forms.css';

const MIN_STEPS = 3;
const MAX_STEPS = 10;
const REQUIREMENTS_COUNT = 4;
const FAQ_COUNT = 3;

const CTA_DEFAULT_TITLE = '¿Listos para empezar?';
const CTA_DEFAULT_TEXT = 'Escribinos y coordinamos la primera entrevista para orientar el proceso.';

const createEmptyStep = () => ({
  title: `Paso ${Date.now()}`,
  content: '',
});

const INITIAL_FORM = {
  bannerTitle: ADMISION_DEFAULTS.bannerTitle,
  bannerSubtitle: ADMISION_DEFAULTS.bannerSubtitle,
  introTitle: ADMISION_DEFAULTS.introTitle,
  introBody: ADMISION_DEFAULTS.introBody,
  requirementsTitle: ADMISION_DEFAULTS.requirementsTitle,
  requirement1: ADMISION_DEFAULTS.requirements[0],
  requirement2: ADMISION_DEFAULTS.requirements[1],
  requirement3: ADMISION_DEFAULTS.requirements[2],
  requirement4: ADMISION_DEFAULTS.requirements[3],
  faqTitle: ADMISION_DEFAULTS.faqTitle,
  faq1Question: ADMISION_DEFAULTS.faq[0].question,
  faq1Answer: ADMISION_DEFAULTS.faq[0].answer,
  faq2Question: ADMISION_DEFAULTS.faq[1].question,
  faq2Answer: ADMISION_DEFAULTS.faq[1].answer,
  faq3Question: ADMISION_DEFAULTS.faq[2].question,
  faq3Answer: ADMISION_DEFAULTS.faq[2].answer,
  ctaTitle: CTA_DEFAULT_TITLE,
  ctaText: CTA_DEFAULT_TEXT,
};

function AdminAdmision() {
  const [sections, setSections] = useState([]);
  const [steps, setSteps] = useState(ADMISION_DEFAULTS.steps);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const pageSections = await fetchSectionsByPage('admision');
      const mapped = mapAdmisionPage(pageSections);

      const introSection = pageSections.find((section) => section.slug === PAGE_SLUGS.admision.intro);
      const introBlocks = getSectionBlocks(pageSections, PAGE_SLUGS.admision.intro);
      const stepsBlocks = getSectionBlocks(pageSections, PAGE_SLUGS.admision.steps).filter(
        (block) => block.type === 'CARD'
      );
      const requirementsSection = pageSections.find(
        (section) => section.slug === PAGE_SLUGS.admision.requirements
      );
      const requirementsBlocks = getSectionBlocks(pageSections, PAGE_SLUGS.admision.requirements).filter(
        (block) => block.type === 'TEXT'
      );
      const faqSection = pageSections.find((section) => section.slug === PAGE_SLUGS.admision.faq);
      const faqBlocks = getSectionBlocks(pageSections, PAGE_SLUGS.admision.faq).filter(
        (block) => block.type === 'CARD'
      );
      const ctaSection = pageSections.find((section) => section.slug === PAGE_SLUGS.admision.cta);

      const introText = introBlocks.find((block) => block.type === 'TEXT');
      const nextSteps = stepsBlocks.length > 0 ? stepsBlocks : mapped.steps;
      const requirements = Array.from({ length: REQUIREMENTS_COUNT }).map((_, index) =>
        requirementsBlocks[index]?.content || mapped.requirements[index] || ''
      );
      const faq = Array.from({ length: FAQ_COUNT }).map((_, index) => ({
        question: faqBlocks[index]?.title || mapped.faq[index]?.question || '',
        answer: faqBlocks[index]?.content || mapped.faq[index]?.answer || '',
      }));

      setSections(pageSections);
      setSteps(
        nextSteps.map((step) => ({
          title: step.title || '',
          content: step.content || '',
        }))
      );
      setForm({
        bannerTitle: mapped.bannerTitle,
        bannerSubtitle: mapped.bannerSubtitle,
        introTitle: introSection?.title || mapped.introTitle,
        introBody: introText?.content || mapped.introBody,
        requirementsTitle: requirementsSection?.title || mapped.requirementsTitle,
        requirement1: requirements[0],
        requirement2: requirements[1],
        requirement3: requirements[2],
        requirement4: requirements[3],
        faqTitle: faqSection?.title || mapped.faqTitle,
        faq1Question: faq[0].question,
        faq1Answer: faq[0].answer,
        faq2Question: faq[1].question,
        faq2Answer: faq[1].answer,
        faq3Question: faq[2].question,
        faq3Answer: faq[2].answer,
        ctaTitle: ctaSection?.title || CTA_DEFAULT_TITLE,
        ctaText: ctaSection?.description || CTA_DEFAULT_TEXT,
      });
    } catch {
      setError('No se pudo cargar el editor de Admisión.');
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

  const handleStepChange = (index, field, value) => {
    setSaved(false);
    setSteps((prev) =>
      prev.map((step, currentIndex) =>
        currentIndex === index ? { ...step, [field]: value } : step
      )
    );
  };

  const handleAddStep = () => {
    if (steps.length >= MAX_STEPS) return;
    setSaved(false);
    setSteps((prev) => [...prev, createEmptyStep()]);
  };

  const handleRemoveStep = (index) => {
    if (steps.length <= MIN_STEPS) return;
    setSaved(false);
    setSteps((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleMoveStep = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    setSaved(false);
    setSteps((prev) => {
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (steps.length < MIN_STEPS || steps.length > MAX_STEPS) {
      setFormError(`Los pasos deben mantenerse entre ${MIN_STEPS} y ${MAX_STEPS}.`);
      return;
    }

    setSaving(true);
    setFormError(null);
    setSaved(false);
    try {
      const bannerSectionId = await ensureSection({
        sections,
        page: 'admision',
        slug: PAGE_SLUGS.admision.banner,
        title: form.bannerTitle,
        description: form.bannerSubtitle,
        order: 1,
      });
      const introSectionId = await ensureSection({
        sections,
        page: 'admision',
        slug: PAGE_SLUGS.admision.intro,
        title: form.introTitle,
        description: '',
        order: 2,
      });
      const stepsSectionId = await ensureSection({
        sections,
        page: 'admision',
        slug: PAGE_SLUGS.admision.steps,
        title: 'Pasos del proceso',
        description: '',
        order: 3,
      });
      const requirementsSectionId = await ensureSection({
        sections,
        page: 'admision',
        slug: PAGE_SLUGS.admision.requirements,
        title: form.requirementsTitle,
        description: '',
        order: 4,
      });
      const faqSectionId = await ensureSection({
        sections,
        page: 'admision',
        slug: PAGE_SLUGS.admision.faq,
        title: form.faqTitle,
        description: '',
        order: 5,
      });
      const ctaSectionId = await ensureSection({
        sections,
        page: 'admision',
        slug: PAGE_SLUGS.admision.cta,
        title: form.ctaTitle,
        description: form.ctaText,
        order: 6,
      });

      await replaceSectionBlocks(bannerSectionId, []);
      await replaceSectionBlocks(introSectionId, [{ type: 'TEXT', content: form.introBody, order: 1 }]);
      await replaceSectionBlocks(
        stepsSectionId,
        steps.map((step, index) => ({
          type: 'CARD',
          title: step.title,
          content: step.content,
          order: index + 1,
        }))
      );
      await replaceSectionBlocks(requirementsSectionId, [
        { type: 'TEXT', content: form.requirement1, order: 1 },
        { type: 'TEXT', content: form.requirement2, order: 2 },
        { type: 'TEXT', content: form.requirement3, order: 3 },
        { type: 'TEXT', content: form.requirement4, order: 4 },
      ]);
      await replaceSectionBlocks(faqSectionId, [
        { type: 'CARD', title: form.faq1Question, content: form.faq1Answer, order: 1 },
        { type: 'CARD', title: form.faq2Question, content: form.faq2Answer, order: 2 },
        { type: 'CARD', title: form.faq3Question, content: form.faq3Answer, order: 3 },
      ]);
      await replaceSectionBlocks(ctaSectionId, []);

      await loadData();
      setSaved(true);
    } catch (err) {
      setFormError(err.response?.data?.message || 'No se pudo guardar Admisión.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Admisión">
        <Loader />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Admisión">
        <ErrorMessage message={error} onRetry={loadData} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admisión">
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

            <h3>Pasos del proceso ({steps.length}/{MAX_STEPS})</h3>
            <div className="repeatable-list">
              {steps.map((step, index) => (
                <div key={`step-${index}`} className="repeatable-item">
                  <div className="repeatable-item__header">
                    <strong>Paso {index + 1}</strong>
                    <div className="repeatable-item__actions">
                      <button
                        type="button"
                        className="btn btn--sm btn--outline"
                        onClick={() => handleMoveStep(index, 'up')}
                        disabled={index === 0}
                      >
                        ↑ Subir
                      </button>
                      <button
                        type="button"
                        className="btn btn--sm btn--outline"
                        onClick={() => handleMoveStep(index, 'down')}
                        disabled={index === steps.length - 1}
                      >
                        ↓ Bajar
                      </button>
                      <button
                        type="button"
                        className="btn btn--sm btn--danger"
                        onClick={() => handleRemoveStep(index)}
                        disabled={steps.length <= MIN_STEPS}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Título</label>
                    <input
                      value={step.title}
                      onChange={(event) => handleStepChange(index, 'title', event.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Texto</label>
                    <RichTextEditor
                      value={step.content}
                      onChange={(value) => handleStepChange(index, 'content', value)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn--outline"
              onClick={handleAddStep}
              disabled={steps.length >= MAX_STEPS}
            >
              + Agregar paso
            </button>

            <h3>Requisitos (4 campos fijos)</h3>
            <div className="form-group">
              <label>Título de sección</label>
              <input name="requirementsTitle" value={form.requirementsTitle} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label>Requisito 1</label>
              <input name="requirement1" value={form.requirement1} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label>Requisito 2</label>
              <input name="requirement2" value={form.requirement2} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label>Requisito 3</label>
              <input name="requirement3" value={form.requirement3} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label>Requisito 4</label>
              <input name="requirement4" value={form.requirement4} onChange={handleFormChange} />
            </div>

            <h3>Preguntas frecuentes (3 ítems fijos)</h3>
            <div className="form-group">
              <label>Título de sección</label>
              <input name="faqTitle" value={form.faqTitle} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label>FAQ 1 - Pregunta</label>
              <input name="faq1Question" value={form.faq1Question} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label>FAQ 1 - Respuesta</label>
              <textarea name="faq1Answer" rows={3} value={form.faq1Answer} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label>FAQ 2 - Pregunta</label>
              <input name="faq2Question" value={form.faq2Question} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label>FAQ 2 - Respuesta</label>
              <textarea name="faq2Answer" rows={3} value={form.faq2Answer} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label>FAQ 3 - Pregunta</label>
              <input name="faq3Question" value={form.faq3Question} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label>FAQ 3 - Respuesta</label>
              <textarea name="faq3Answer" rows={3} value={form.faq3Answer} onChange={handleFormChange} />
            </div>

            <h3>CTA final</h3>
            <div className="form-group">
              <label>Título</label>
              <input name="ctaTitle" value={form.ctaTitle} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label>Texto</label>
              <RichTextEditor value={form.ctaText} onChange={(value) => handleRichTextChange('ctaText', value)} />
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

export default AdminAdmision;
