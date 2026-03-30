import { useMemo } from 'react';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import RichTextContent from '../../components/common/RichTextContent';
import usePublicSections from '../../hooks/usePublicSections';
import { mapSAIEPage } from '../../utils/publicPageMappers';
import '../../styles/pages.css';

function SAIE() {
  const { sections, loading, error, refetch } = usePublicSections('saie');
  const pageData = useMemo(() => mapSAIEPage(sections), [sections]);

  if (loading) return <Loader text="Cargando página..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="page-wrapper program-page">
      <section className="page-banner page-banner--saie">
        <div className="container">
          <h1>SAIE</h1>
          <p>Servicio de apoyo para fortalecer trayectorias de integración escolar.</p>
        </div>
      </section>

      <section className="program-highlight">
        <div className="container program-highlight__grid">
          <div className="program-highlight__media">
            <img src={pageData.highlightImage} alt="Imagen principal SAIE" />
          </div>
          <div className="program-highlight__content">
            <h2>Actividades de Servicio de Apoyo Integración Escolar</h2>
            <RichTextContent content={pageData.highlightText} className="rich-text-content" />
          </div>
        </div>
      </section>

      {pageData.gallery.length > 0 && (
        <section className="program-gallery">
          <div className="container">
            <h3>Recursos y acompañamiento</h3>
            <div className="program-gallery__grid">
              {pageData.gallery.map((url, index) => (
                <figure key={`${url}-${index}`} className="program-gallery__item">
                  <img src={url} alt={`Actividad SAIE ${index + 1}`} />
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default SAIE;

