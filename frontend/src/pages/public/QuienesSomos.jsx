import PageContent from '../../components/public/PageContent';
import '../../styles/pages.css';

function QuienesSomos() {
  return (
    <div className="page-wrapper">
      <div className="page-banner page-banner--quienes">
        <div className="container">
          <h1>Quiénes Somos</h1>
          <p>Conocé nuestra historia, misión y equipo de profesionales</p>
        </div>
      </div>
      <PageContent page="quienes-somos" />
    </div>
  );
}

export default QuienesSomos;
