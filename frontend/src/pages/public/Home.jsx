import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import RichTextContent from '../../components/common/RichTextContent';
import { HOME_DEFAULTS } from '../../constants/homeDefaults';
import '../../styles/home.css';

const sortByOrder = (items = []) => [...items].sort((a, b) => a.order - b.order);
const HERO_CAROUSEL_IMAGES = HOME_DEFAULTS.images.gallery.slice(0, 4);

function Home() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  const fetchSections = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/public/sections/home');
      setSections(res.data.data || []);
    } catch {
      setError('No se pudo cargar el contenido.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const homeData = useMemo(() => {
    const heroSection = sections.find((s) => s.slug === 'home-hero');
    const heroBlock = sortByOrder(heroSection?.blocks).find((b) => b.type === 'HERO');

    const infoSection = sections.find((s) => s.slug === 'home-info');
    const infoBlocks = sortByOrder(infoSection?.blocks).slice(0, 3);

    const bienvenidaSection = sections.find((s) => s.slug === 'home-bienvenida');
    const bienvenidaBlocks = sortByOrder(bienvenidaSection?.blocks).slice(0, 3);

    const services = HOME_DEFAULTS.services.map((item, index) => ({
      ...item,
      title: infoBlocks[index]?.title || item.title,
      content: infoBlocks[index]?.content || item.content,
      imageUrl: infoBlocks[index]?.imageUrl || item.imageUrl || '',
    }));

    return {
      hero: {
        title: heroBlock?.title || HOME_DEFAULTS.hero.title,
        subtitle: heroBlock?.subtitle || HOME_DEFAULTS.hero.subtitle,
        content: heroBlock?.content || HOME_DEFAULTS.hero.content,
        linkText: heroBlock?.linkText || HOME_DEFAULTS.hero.linkText,
        linkUrl: heroBlock?.linkUrl || '/admision',
        imageUrl: heroBlock?.imageUrl || '',
      },
      services,
      about: {
        ...HOME_DEFAULTS.about,
        eyebrow: bienvenidaSection?.description || HOME_DEFAULTS.about.eyebrow,
        title: bienvenidaSection?.title || HOME_DEFAULTS.about.title,
        paragraph: bienvenidaBlocks[0]?.content || HOME_DEFAULTS.about.paragraph,
        quote: bienvenidaBlocks[1]?.content || HOME_DEFAULTS.about.quote,
        extra: bienvenidaBlocks[2]?.content || HOME_DEFAULTS.about.extra,
      },
    };
  }, [sections]);

  const heroImages = useMemo(() => {
    const images = [homeData.hero.imageUrl, ...HERO_CAROUSEL_IMAGES]
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index)
      .slice(0, 4);

    return images.length === 4 ? images : HERO_CAROUSEL_IMAGES;
  }, [homeData.hero.imageUrl]);

  useEffect(() => {
    setHeroSlideIndex(0);
  }, [heroImages.length]);

  useEffect(() => {
    if (heroImages.length <= 1) return undefined;
    const intervalId = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroImages.length);
    }, 3100);
    return () => clearInterval(intervalId);
  }, [heroImages.length]);

  if (loading) return <Loader text="Cargando inicio..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchSections} />;

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__carousel">
            {heroImages.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className={`hero__slide ${index === heroSlideIndex ? 'is-active' : ''}`}
              >
                <div className="hero__slide-image">
                  <img src={src} alt={`Niños en terapia ${index + 1}`} />
                </div>
              </div>
            ))}
          </div>
          <div className="hero__overlay" />
        </div>
        <div className="hero__content">
          <p className="hero__eyebrow">Rehabilitación Infantil</p>
          <h1 className="hero__title">{homeData.hero.title}</h1>
          <p className="hero__subtitle">{homeData.hero.subtitle}</p>
          <RichTextContent content={homeData.hero.content} className="hero__text rich-text-content" />
          <div className="hero__actions">
            <Link to={homeData.hero.linkUrl} className="btn btn--primary btn--lg">
              {homeData.hero.linkText}
            </Link>
            <Link to="/quienes-somos" className="btn btn--ghost btn--lg">
              Quiénes somos
            </Link>
          </div>
        </div>
      </section>

      <section className="services-wrap">
        <div className="services">
          {homeData.services.map((service, index) => (
            <article key={`${service.title}-${index}`} className={`service ${service.className}`}>
              {service.imageUrl ? (
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="service__media"
                />
              ) : null}
              <h3>
                {!service.imageUrl && <span>{service.icon}</span>}
                {service.title}
              </h3>
              <RichTextContent content={service.content} className="service__content rich-text-content" />
            </article>
          ))}
        </div>
      </section>

      <section className="about">
        <div className="about-grid">
          <aside className="hours-card">
            <h4>{homeData.about.hoursTitle}</h4>
            {homeData.about.hoursLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <img src={HOME_DEFAULTS.images.hours} alt="Niño en terapia" />
          </aside>

          <div className="about-photo">
            <img src={HOME_DEFAULTS.images.about} alt="Sesión terapéutica" />
          </div>

          <div className="about-copy">
            <p className="about-copy__eyebrow">{homeData.about.eyebrow}</p>
            <h2>{homeData.about.title}</h2>
            <div className="tags">
              {homeData.about.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <RichTextContent content={homeData.about.paragraph} className="about-copy__text rich-text-content" />
            <blockquote>
              <RichTextContent content={homeData.about.quote} className="about-copy__quote rich-text-content" />
            </blockquote>
            <RichTextContent content={homeData.about.extra} className="about-copy__text rich-text-content" />
          </div>
        </div>
      </section>

      <section className="gallery">
        {HOME_DEFAULTS.images.gallery.map((src, index) => (
          <img key={src} src={src} alt={`Actividad terapéutica ${index + 1}`} />
        ))}
      </section>

    </div>
  );
}

export default Home;
