import PageContent from '../../components/public/PageContent';
import '../../styles/pages.css';

function Servicios() {
  return (
    <div className="page-wrapper">
      <div className="page-banner page-banner--servicios">
        <div className="container">
          <h1>Nuestros Servicios</h1>
          <p>Atención integral e interdisciplinaria para el desarrollo de tu hijo</p>
        </div>
      </div>
      <PageContent page="servicios" />
    </div>
  );
}

export default Servicios;
