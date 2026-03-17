import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import RichTextContent from '../../components/common/RichTextContent';
import usePublicSections from '../../hooks/usePublicSections';
import { mapQuienesPage } from '../../utils/publicPageMappers';
import '../../styles/pages.css';

function QuienesSomos() {
  const { sections, loading, error, refetch } = usePublicSections('quienes-somos');
  const pageData = useMemo(() => mapQuienesPage(sections), [sections]);

  if (loading) return <Loader text="Cargando página..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="page-wrapper about-page">
      <section className="page-banner page-banner--quienes">
        <div className="container">
          <h1>{pageData.bannerTitle}</h1>
          <p>{pageData.bannerSubtitle}</p>
        </div>
      </section>

      <section className="about-main">
        <div className="container about-main__grid">
          <div className="about-main__content">
            <p className="section-eyebrow">{pageData.introEyebrow}</p>
            <h2>{pageData.introTitle}</h2>
            <RichTextContent content={pageData.introBody} className="rich-text-content about-main__text" />
          </div>
          <div className="about-main__media">
            <img src={pageData.mainImage} alt="Equipo de CETRIP" />
          </div>
        </div>
      </section>

      <section className="about-identity">
        <div className="container">
          <div className="identity-grid">
            {pageData.identity.map((item) => (
              <article key={item.title} className="identity-card">
                <h3>{item.title}</h3>
                <RichTextContent content={item.content} className="rich-text-content" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-strip__content">
          <div>
            <h3>{pageData.trustTitle}</h3>
            <RichTextContent content={pageData.trustBody} className="rich-text-content" />
          </div>
          <div className="trust-strip__actions">
            <Link to="/admision" className="btn btn--primary">Iniciar admisión</Link>
            <Link to="/contacto" className="btn btn--outline">Hablar con CETRIP</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default QuienesSomos;
