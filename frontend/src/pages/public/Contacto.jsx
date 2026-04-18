import { useMemo, useState } from 'react';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import usePublicSections from '../../hooks/usePublicSections';
import { mapContactoPage } from '../../utils/publicPageMappers';
import {
  CONTACT_FORM_EMAIL_REGEX,
  submitContactForm,
  trimContactFormValues,
} from '../../services/contactForm';
import '../../styles/pages.css';
import '../../styles/forms.css';

const DEBUG = import.meta.env.VITE_DEBUG === 'true';

const DEBUG_DATA = {
  name: 'María González',
  email: 'maria@example.com',
  phone: '11-4567-8901',
  subject: 'Consulta sobre turnos',
  message: 'Hola, quisiera consultar sobre la disponibilidad para kinesiología para mi hijo de 5 años. Muchas gracias.',
};

const EMPTY_FORM = { name: '', email: '', phone: '', subject: '', message: '' };
const INITIAL_FORM = DEBUG ? DEBUG_DATA : EMPTY_FORM;

function Contacto() {
  const { sections, loading: loadingContent, error: contentError, refetch } = usePublicSections('contacto');
  const pageData = useMemo(() => mapContactoPage(sections), [sections]);

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const trimmedForm = trimContactFormValues(form);
    const errs = {};
    if (!trimmedForm.name) errs.name = 'El nombre es requerido.';
    if (!trimmedForm.email) {
      errs.email = 'El email es requerido.';
    } else if (!CONTACT_FORM_EMAIL_REGEX.test(trimmedForm.email)) {
      errs.email = 'El email no es válido.';
    }
    if (!trimmedForm.message) {
      errs.message = 'El mensaje es requerido.';
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

    setLoading(true);
    setErrors({});
    setServerError(null);
    try {
      const response = await submitContactForm(form, { to: pageData.contactFormTo });
      if (response?.success !== true) {
        throw new Error('unexpected_response');
      }
      setSuccess(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Error al enviar el mensaje. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingContent) return <Loader text="Cargando contacto..." />;
  if (contentError) return <ErrorMessage message={contentError} onRetry={refetch} />;

  return (
    <div className="page-wrapper contact-page">
      <section className="page-banner page-banner--contacto">
        <div className="container">
          <h1>{pageData.bannerTitle}</h1>
          <p>{pageData.bannerSubtitle}</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container contact-grid">
          <aside className="contact-info-panel">
            <h2>{pageData.infoTitle}</h2>
            <p className="contact-info-panel__lead">{pageData.infoSubtitle}</p>

            <div className="contact-info-list">
              <article className="contact-info-card">
                <span className="contact-info-card__icon">📍</span>
                <div>
                  <strong>Dirección</strong>
                  <p>{pageData.address}</p>
                </div>
              </article>
              <article className="contact-info-card">
                <span className="contact-info-card__icon">📞</span>
                <div>
                  <strong>Teléfono</strong>
                  <p>{pageData.phone}</p>
                </div>
              </article>
              <article className="contact-info-card">
                <span className="contact-info-card__icon">✉️</span>
                <div>
                  <strong>Email</strong>
                  <p>{pageData.email}</p>
                </div>
              </article>
              <article className="contact-info-card">
                <span className="contact-info-card__icon">🕐</span>
                <div>
                  <strong>Horario de atención</strong>
                  <p>{pageData.schedule}</p>
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
                    setForm(EMPTY_FORM);
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

                <button type="submit" className="btn btn--primary btn--lg" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contacto;
