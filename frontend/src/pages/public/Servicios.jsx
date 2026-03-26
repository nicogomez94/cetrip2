import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import RichTextContent from '../../components/common/RichTextContent';
import usePublicSections from '../../hooks/usePublicSections';
import { mapServiciosPage } from '../../utils/publicPageMappers';
import '../../styles/pages.css';

function Servicios() {
  const { sections, loading, error, refetch } = usePublicSections('servicios');
  const pageData = useMemo(() => mapServiciosPage(sections), [sections]);

  if (loading) return <Loader text="Cargando consultorios externos..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="page-wrapper services-page">
      <section className="page-banner page-banner--servicios">
        <div className="container">
          <h1>{pageData.bannerTitle}</h1>
          <p>{pageData.bannerSubtitle}</p>
        </div>
      </section>

      <section className="services-intro">
        <div className="container">
          <h2>{pageData.introTitle}</h2>
          <RichTextContent content={pageData.introBody} className="rich-text-content" />
        </div>
      </section>

      <section className="services-list">
        <div className="container">
          <div className="services-grid">
            {pageData.services.map((service, index) => (
              <Link
                key={service.id || service.slug || `${service.title}-${index}`}
                to={`/servicios/${service.slug}`}
                className="service-card-link"
              >
                <article className="service-card">
                  {service.imageUrl && (
                    <div className="service-card__media">
                      <img src={service.imageUrl} alt={service.title} />
                    </div>
                  )}
                  <div className="service-card__body">
                    <h3>{service.title}</h3>
                    <p className="service-card__summary">{service.summary}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="workflow">
        <div className="container">
          <h2>{pageData.workflowTitle}</h2>
          <div className="workflow-grid">
            {pageData.workflow.map((step, index) => (
              <article key={step.title} className="workflow-step">
                <span className="workflow-step__index">{index + 1}</span>
                <h3>{step.title}</h3>
                <RichTextContent content={step.content} className="rich-text-content" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-cta">
        <div className="container page-cta__content">
          <h3>{pageData.ctaTitle}</h3>
          <RichTextContent content={pageData.ctaText} className="rich-text-content" />
          <div className="page-cta__actions">
            <Link to="/admision" className="btn btn--primary">Ver admisión</Link>
            <Link to="/contacto" className="btn btn--outline">Contactarnos</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Servicios;
