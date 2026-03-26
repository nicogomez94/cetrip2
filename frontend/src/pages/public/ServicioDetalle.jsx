import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import RichTextContent from '../../components/common/RichTextContent';
import usePublicSections from '../../hooks/usePublicSections';
import { mapServiciosPage } from '../../utils/publicPageMappers';
import '../../styles/pages.css';

function ServicioDetalle() {
  const { serviceSlug } = useParams();
  const { sections, loading, error, refetch } = usePublicSections('servicios');
  const pageData = useMemo(() => mapServiciosPage(sections), [sections]);
  const service = useMemo(
    () => pageData.services.find((item) => item.slug === serviceSlug),
    [pageData.services, serviceSlug]
  );

  if (loading) return <Loader text="Cargando servicio..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  if (!service) {
    return (
      <div className="page-wrapper service-detail-page">
        <section className="service-detail">
          <div className="container service-detail__content">
            <h1>Servicio no encontrado</h1>
            <p>Este servicio no existe o fue movido.</p>
            <Link to="/servicios" className="btn btn--outline">Volver a servicios</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-wrapper service-detail-page">
      <section className="service-detail">
        <div className="container service-detail__content">
          <Link to="/servicios" className="service-detail__back">← Volver a servicios</Link>
          {service.imageUrl && (
            <div className="service-detail__media">
              <img src={service.imageUrl} alt={service.title} />
            </div>
          )}
          <h1>{service.title}</h1>
          <RichTextContent content={service.content} className="rich-text-content" />
        </div>
      </section>
    </div>
  );
}

export default ServicioDetalle;
