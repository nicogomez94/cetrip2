import '../../styles/pages.css';

const CET_PARAGRAPHS = [
  'Nuestro Centro Terapéutico (CET) está destinado a niñas y niños de hasta 14 años, conformando grupos reducidos para acompañar de manera personalizada cada proceso.',
  'El abordaje se sostiene en un Proyecto Educativo Individualizado (P.E.I.) con evaluaciones permanentes. Se trabajan áreas como comunicación, socialización, autonomía personal y habilidades cognitivas funcionales.',
  'Este dispositivo brinda una respuesta para personas con discapacidad que, por su modalidad y tiempos de aprendizaje, requieren una propuesta específica para avanzar en sus trayectorias.',
  'El objetivo principal es fortalecer herramientas concretas para favorecer la inclusión y la participación activa tanto en espacios educativos comunes como especiales.',
];

const CET_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1400&q=80',
    alt: 'Profesional acompañando actividad terapéutica infantil',
  },
  {
    src: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1400&q=80',
    alt: 'Niños participando de una actividad educativa guiada',
  },
  {
    src: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1400&q=80',
    alt: 'Espacio de apoyo al desarrollo con materiales didácticos',
  },
];

function CET() {
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
            <img src={CET_IMAGES[0].src} alt={CET_IMAGES[0].alt} />
          </div>
          <div className="program-highlight__content">
            <h2>Cómo trabajamos en CET</h2>
            {CET_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="program-gallery">
        <div className="container">
          <h3>Actividades y espacios del centro</h3>
          <div className="program-gallery__grid">
            {CET_IMAGES.map((image, index) => (
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

export default CET;
