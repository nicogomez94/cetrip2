import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import '../../styles/home.css';

function Home() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSections = async () => {
    setLoading(true);
    setError(null);
    try {
      const [heroRes] = await Promise.all([
        api.get('/public/sections/home'),
      ]);
      setSections(heroRes.data.data || []);
    } catch {
      setError('No se pudo cargar el contenido.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  if (loading) return <Loader text="Cargando inicio..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchSections} />;

  const heroSection = sections.find((s) => s.slug === 'home-hero');
  const heroBlock = heroSection?.blocks?.[0];
  const bienvenidaSection = sections.find((s) => s.slug === 'home-bienvenida');
  const bienvenidaBlocks = bienvenidaSection?.blocks?.filter((b) => b.isActive) || [];
  const infoSection = sections.find((s) => s.slug === 'home-info');
  const infoBlocks = infoSection?.blocks || [];

  return (
    <div className="home">
      {/* Hero */}
      {heroBlock ? (
        <section className="hero">
          <div
            className="hero__bg"
            style={
              heroBlock.imageUrl
                ? { backgroundImage: `url(${heroBlock.imageUrl})` }
                : {}
            }
          >
            <div className="hero__overlay" />
          </div>
          <div className="hero__content">
            <p className="hero__eyebrow">Rehabilitación Infantil</p>
            <h1 className="hero__title">{heroBlock.title}</h1>
            <p className="hero__subtitle">{heroBlock.subtitle}</p>
            <p className="hero__text">{heroBlock.content}</p>
            <div className="hero__actions">
              {heroBlock.linkUrl && (
                <Link to={heroBlock.linkUrl} className="btn btn--primary btn--lg">
                  {heroBlock.linkText || 'Conocé más'}
                </Link>
              )}
              <Link to="/quienes-somos" className="btn btn--ghost btn--lg">
                Quiénes somos
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="hero hero--default">
          <div className="hero__content">
            <p className="hero__eyebrow">Rehabilitación Infantil</p>
            <h1 className="hero__title">Centro de Rehabilitación Infantil</h1>
            <p className="hero__subtitle">
              Acompañamos el desarrollo de cada niño con amor y profesionalismo
            </p>
            <div className="hero__actions">
              <Link to="/admision" className="btn btn--primary btn--lg">
                Solicitar turno
              </Link>
              <Link to="/quienes-somos" className="btn btn--ghost btn--lg">
                Quiénes somos
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Bienvenida */}
      <section className="home-bienvenida">
        <div className="container">
          <h1 className="bienvenida__title">
            {bienvenidaSection?.title || 'Bienvenidos a CETRIP'}
          </h1>
          {bienvenidaBlocks.length > 0 ? (
            bienvenidaBlocks.map((block) => (
              <p key={block.id} className="bienvenida__text">
                {block.content}
              </p>
            ))
          ) : (
            <>
              <p className="bienvenida__text">
                En CETRIP acompañamos el desarrollo de niños, niñas y adolescentes a través de un abordaje interdisciplinario centrado en la persona y su entorno. Nuestro objetivo es favorecer la participación, el aprendizaje, la comunicación y el bienestar emocional, trabajando de manera articulada con las familias y las instituciones educativas.
              </p>
              <p className="bienvenida__text">
                Nuestro equipo está conformado por profesionales especializados en distintas áreas del desarrollo infantil, que trabajan de manera coordinada para ofrecer evaluaciones, tratamientos y acompañamientos adaptados a las necesidades de cada persona.
              </p>
              <p className="bienvenida__text">
                En CETRIP creemos en la importancia del trabajo conjunto entre profesionales, familias y escuela para favorecer el desarrollo integral y la inclusión en la vida cotidiana.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Info cards */}
      {infoBlocks.length > 0 && (
        <section className="home-info">
          <div className="container">
            <div className="section-header">
              <h2>{infoSection.title}</h2>
              {infoSection.description && <p>{infoSection.description}</p>}
            </div>
            <div className="cards-grid">
              {infoBlocks.map((block) => (
                <div key={block.id} className="feature-card">
                  {block.imageUrl && (
                    <img src={block.imageUrl} alt={block.title} className="feature-card__img" />
                  )}
                  <div className="feature-card__body">
                    {block.title && <h3 className="feature-card__title">{block.title}</h3>}
                    {block.content && <p className="feature-card__text">{block.content}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Render de otras secciones dinámicas */}
      {sections
        .filter((s) => !['home-hero', 'home-info'].includes(s.slug))
        .map((section) => (
          <section key={section.id} className="home-dynamic-section">
            <div className="container">
              <div className="section-header">
                <h2>{section.title}</h2>
                {section.description && <p>{section.description}</p>}
              </div>
              <div className="dynamic-blocks">
                {section.blocks.map((block) => renderBlock(block))}
              </div>
            </div>
          </section>
        ))}

      {/* CTA */}
      <section className="home-cta">
        <div className="container">
          <div className="cta-box">
            <h2>¿Querés saber más?</h2>
            <p>
              Comunicate con nosotros y te asesoramos sobre el proceso de admisión y los
              servicios disponibles.
            </p>
            <div className="cta-box__actions">
              <Link to="/contacto" className="btn btn--primary btn--lg">
                Contactanos
              </Link>
            &nbsp;
              <Link to="/admision" className="btn btn--outline-white btn--lg">
                Ver proceso de admisión
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function renderBlock(block) {
  switch (block.type) {
    case 'TEXT':
      return (
        <div key={block.id} className="block-text">
          {block.title && <h3>{block.title}</h3>}
          {block.content && <p>{block.content}</p>}
        </div>
      );
    case 'IMAGE':
      return (
        <div key={block.id} className="block-image">
          {block.title && <h3>{block.title}</h3>}
          {block.imageUrl && <img src={block.imageUrl} alt={block.title || ''} />}
        </div>
      );
    case 'VIDEO':
      return (
        <div key={block.id} className="block-video">
          {block.title && <h3>{block.title}</h3>}
          {block.videoUrl && (
            <div className="video-wrapper">
              <iframe
                src={block.videoUrl}
                title={block.title || 'Video'}
                allowFullScreen
                frameBorder="0"
              />
            </div>
          )}
        </div>
      );
    case 'CARD':
      return (
        <div key={block.id} className="feature-card">
          {block.imageUrl && (
            <img src={block.imageUrl} alt={block.title || ''} className="feature-card__img" />
          )}
          <div className="feature-card__body">
            {block.title && <h3 className="feature-card__title">{block.title}</h3>}
            {block.content && <p className="feature-card__text">{block.content}</p>}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default Home;
