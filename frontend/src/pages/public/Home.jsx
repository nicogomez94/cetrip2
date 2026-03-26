import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import RichTextContent from '../../components/common/RichTextContent';
import usePublicSections from '../../hooks/usePublicSections';
import { mapContactoPage } from '../../utils/publicPageMappers';
import { HOME_DEFAULTS } from '../../constants/homeDefaults';
import '../../styles/home.css';
import '../../styles/pages.css';
import '../../styles/forms.css';

const sortByOrder = (items = []) => [...items].sort((a, b) => a.order - b.order);
const HERO_CAROUSEL_LIMIT = 4;
const DEFAULT_HERO_CAROUSEL_IMAGES = HOME_DEFAULTS.images.gallery.slice(0, HERO_CAROUSEL_LIMIT);
const DEBUG = import.meta.env.VITE_DEBUG === 'true';
const DEBUG_DATA = {
  name: 'María González',
  email: 'maria@example.com',
  phone: '11-4567-8901',
  subject: 'Consulta sobre turnos',
  message: 'Hola, quisiera consultar sobre la disponibilidad para kinesiología para mi hijo de 5 años. Muchas gracias.',
};
const INITIAL_FORM = DEBUG
  ? DEBUG_DATA
  : { name: '', email: '', phone: '', subject: '', message: '' };

function Home() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const { sections: contactSections } = usePublicSections('contacto');
  const contactData = useMemo(() => mapContactoPage(contactSections), [contactSections]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

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

    const carouselSection = sections.find((s) => s.slug === 'home-carrusel');
    const carouselBlocks = sortByOrder(carouselSection?.blocks)
      .filter((b) => b.type === 'IMAGE')
      .slice(0, HERO_CAROUSEL_LIMIT);
    const carouselImages = carouselBlocks
      .map((block) => block.imageUrl)
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index)
      .slice(0, HERO_CAROUSEL_LIMIT);
    const legacyCarouselImages = [heroBlock?.imageUrl, ...DEFAULT_HERO_CAROUSEL_IMAGES]
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index)
      .slice(0, HERO_CAROUSEL_LIMIT);

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
        carouselImages: carouselImages.length > 0 ? carouselImages : legacyCarouselImages,
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
    const images = homeData.hero.carouselImages
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index)
      .slice(0, HERO_CAROUSEL_LIMIT);

    return images.length > 0 ? images : DEFAULT_HERO_CAROUSEL_IMAGES;
  }, [homeData.hero.carouselImages]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'El nombre es requerido.';
    if (!form.email.trim()) {
      errs.email = 'El email es requerido.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'El email no es válido.';
    }
    if (!form.subject.trim()) errs.subject = 'El asunto es requerido.';
    if (!form.message.trim()) {
      errs.message = 'El mensaje es requerido.';
    } else if (form.message.trim().length < 10) {
      errs.message = 'El mensaje debe tener al menos 10 caracteres.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setFormLoading(true);
    setServerError(null);
    try {
      await api.post('/public/contact', form);
      setSuccess(true);
      setForm(INITIAL_FORM);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const mapped = {};
        apiErrors.forEach((item) => (mapped[item.field] = item.message));
        setErrors(mapped);
      } else {
        setServerError(err.response?.data?.message || 'Error al enviar el mensaje. Intente nuevamente.');
      }
    } finally {
      setFormLoading(false);
    }
  };

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
        <div className="services-wrap__actions">
          <Link to="/servicios" className="btn btn--outline">
            Ver mas
          </Link>
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

      <section className="contact-section home-contact-section">
        <div className="container home-contact-cta">
          <p className="home-contact-cta__eyebrow">Contacto</p>
          <h2>Estamos para ayudarte</h2>
          <p>Contanos tu consulta y te respondemos a la brevedad.</p>
        </div>
        <div className="container contact-grid">
          <aside className="contact-info-panel">
            <h2>{contactData.infoTitle}</h2>
            <p className="contact-info-panel__lead">{contactData.infoSubtitle}</p>

            <div className="contact-info-list">
              <article className="contact-info-card">
                <span className="contact-info-card__icon">📍</span>
                <div>
                  <strong>Dirección</strong>
                  <p>{contactData.address}</p>
                </div>
              </article>
              <article className="contact-info-card">
                <span className="contact-info-card__icon">📞</span>
                <div>
                  <strong>Teléfono</strong>
                  <p>{contactData.phone}</p>
                </div>
              </article>
              <article className="contact-info-card">
                <span className="contact-info-card__icon">✉️</span>
                <div>
                  <strong>Email</strong>
                  <p>{contactData.email}</p>
                </div>
              </article>
              <article className="contact-info-card">
                <span className="contact-info-card__icon">🕐</span>
                <div>
                  <strong>Horario de atención</strong>
                  <p>{contactData.schedule}</p>
                </div>
              </article>
            </div>

            {DEBUG && <div className="debug-badge">🛠 MODO DEBUG – formulario autocompletado</div>}
          </aside>

          <div className="contact-form-wrapper">
            {success ? (
              <div className="form-success">
                <span className="form-success__icon">✅</span>
                <h3>¡Mensaje enviado!</h3>
                <p>Gracias por contactarnos. Te responderemos a la brevedad.</p>
                <button
                  className="btn btn--primary"
                  onClick={() => {
                    setSuccess(false);
                    setForm(INITIAL_FORM);
                  }}
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form className="form" onSubmit={handleSubmit} noValidate>
                <h2>Envianos un mensaje</h2>

                {serverError && <div className="form-alert form-alert--error">{serverError}</div>}

                <div className="form-row">
                  <div className={`form-group ${errors.name ? 'form-group--error' : ''}`}>
                    <label htmlFor="name">Nombre completo *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      autoComplete="name"
                    />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>

                  <div className={`form-group ${errors.email ? 'form-group--error' : ''}`}>
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      autoComplete="email"
                    />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Teléfono (opcional)</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="11-XXXX-XXXX"
                      autoComplete="tel"
                    />
                  </div>

                  <div className={`form-group ${errors.subject ? 'form-group--error' : ''}`}>
                    <label htmlFor="subject">Asunto *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="¿En qué podemos ayudarte?"
                    />
                    {errors.subject && <span className="form-error">{errors.subject}</span>}
                  </div>
                </div>

                <div className={`form-group ${errors.message ? 'form-group--error' : ''}`}>
                  <label htmlFor="message">Mensaje *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describí tu consulta..."
                  />
                  {errors.message && <span className="form-error">{errors.message}</span>}
                </div>

                <button type="submit" className="btn btn--primary btn--lg" disabled={formLoading}>
                  {formLoading ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
