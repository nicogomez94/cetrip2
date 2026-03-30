import { useMemo } from 'react';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import RichTextContent from '../../components/common/RichTextContent';
import usePublicSections from '../../hooks/usePublicSections';
import { mapCETPage } from '../../utils/publicPageMappers';
import '../../styles/pages.css';

function CET() {
  const { sections, loading, error, refetch } = usePublicSections('cet');
  const pageData = useMemo(() => mapCETPage(sections), [sections]);

  if (loading) return <Loader text="Cargando página..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="page-wrapper program-page">
      <section className="page-banner page-banner--cet">
        <div className="container">
          <h1>Centro Terapéutico - CET</h1>
          <p>
            Un espacio interdisciplinario para acompañar el desarrollo integral, con propuestas
            individualizadas y trabajo articulado con cada familia.
          </p>
        </div>
      </section>

      <section className="program-highlight">
        <div className="container program-highlight__grid">
          <div className="program-highlight__media">
            <img src={pageData.highlightImage} alt="Imagen principal CET" />
          </div>
          <div className="program-highlight__content">
            <h2>Cómo trabajamos en CET</h2>
            <RichTextContent content={pageData.highlightText} className="rich-text-content" />
          </div>
        </div>
      </section>

      {pageData.gallery.length > 0 && (
        <section className="program-gallery">
          <div className="container">
            <h3>Actividades y espacios del centro</h3>
            <div className="program-gallery__grid">
              {pageData.gallery.map((url, index) => (
                <figure key={`${url}-${index}`} className="program-gallery__item">
                  <img src={url} alt={`Actividad CET ${index + 1}`} />
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default CET;

