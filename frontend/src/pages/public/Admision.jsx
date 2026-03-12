import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import RichTextContent from '../../components/common/RichTextContent';
import usePublicSections from '../../hooks/usePublicSections';
import { mapAdmisionPage } from '../../utils/publicPageMappers';
import '../../styles/pages.css';

function Admision() {
  const { sections, loading, error, refetch } = usePublicSections('admision');
  const pageData = useMemo(() => mapAdmisionPage(sections), [sections]);

  if (loading) return <Loader text="Cargando admisión..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="page-wrapper admission-page">
      <section className="page-banner page-banner--admision">
        <div className="container">
          <h1>{pageData.bannerTitle}</h1>
          <p>{pageData.bannerSubtitle}</p>
        </div>
      </section>

      <section className="admission-intro">
        <div className="container">
          <h2>{pageData.introTitle}</h2>
          <RichTextContent content={pageData.introBody} className="rich-text-content" />
        </div>
      </section>

      <section className="admission-timeline">
        <div className="container">
          <h2>Pasos del proceso</h2>
          <div className="timeline-list">
            {pageData.steps.map((step, index) => (
              <article key={step.id || `${step.title}-${index}`} className="timeline-item">
                <span className="timeline-item__dot">{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <RichTextContent content={step.content} className="rich-text-content" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="admission-support">
        <div className="container admission-support__grid">
          <article className="support-card">
            <h3>{pageData.requirementsTitle}</h3>
            <ul>
              {pageData.requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="support-card">
            <h3>{pageData.faqTitle}</h3>
            <div className="faq-list">
              {pageData.faq.map((item) => (
                <div key={item.question} className="faq-item">
                  <h4>{item.question}</h4>
                  <p>{item.answer}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="page-cta">
        <div className="container page-cta__content">
          <h3>{pageData.ctaTitle}</h3>
          <p>{pageData.ctaText}</p>
          <div className="page-cta__actions">
            <Link to="/contacto" className="btn btn--primary">Iniciar contacto</Link>
            <Link to="/servicios" className="btn btn--outline">Ver servicios</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Admision;
