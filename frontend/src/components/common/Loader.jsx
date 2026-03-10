function Loader({ text = 'Cargando...' }) {
  return (
    <div className="loader-wrapper">
      <div className="loader-spinner" />
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
}

export default Loader;
