import '../../styles/pages.css';

const SAIE_PARAGRAPHS = [
  'Actividades de Servicio de Apoyo Integración Escolar.',
  'El SAIE acompaña a estudiantes que requieren apoyos específicos para sostener su participación en la escuela, articulando con docentes, directivos y equipos institucionales.',
  'Se diseñan estrategias individualizadas para favorecer la comunicación, la organización en el aula, la autonomía y los vínculos con pares dentro de contextos educativos inclusivos.',
  'Nuestro equipo realiza seguimiento continuo con las familias y con la institución escolar para ajustar objetivos y recursos, garantizando intervenciones respetuosas y efectivas.',
  'Este trabajo busca fortalecer trayectorias escolares posibles, promoviendo aprendizajes significativos y una inclusión real en la vida cotidiana de cada niño y niña.',
];

const SAIE_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1588072432904-843af37f03ed?auto=format&fit=crop&w=1400&q=80',
    alt: 'Acompañamiento pedagógico en contexto escolar inclusivo',
  },
  {
    src: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=1400&q=80',
    alt: 'Trabajo en equipo entre escuela y profesionales de apoyo',
  },
  {
    src: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1400&q=80',
    alt: 'Apoyo individual para fortalecer trayectoria escolar',
  },
];

function SAIE() {
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
            <img src={SAIE_IMAGES[0].src} alt={SAIE_IMAGES[0].alt} />
          </div>
          <div className="program-highlight__content">
            <h2>Actividades de Servicio de Apoyo Integración Escolar</h2>
            {SAIE_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="program-gallery">
        <div className="container">
          <h3>Recursos y acompañamiento</h3>
          <div className="program-gallery__grid">
            {SAIE_IMAGES.map((image, index) => (
              <figure key={`${image.src}-${index}`} className="program-gallery__item">
                <img src={image.src} alt={image.alt} />
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default SAIE;
