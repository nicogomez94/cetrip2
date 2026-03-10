import PageContent from '../../components/public/PageContent';
import '../../styles/pages.css';

function Admision() {
  return (
    <div className="page-wrapper">
      <div className="page-banner page-banner--admision">
        <div className="container">
          <h1>Admisión</h1>
          <p>Conocé cómo iniciar el proceso para atenderte en CETRIP</p>
        </div>
      </div>
      <PageContent page="admision" />
    </div>
  );
}

export default Admision;
