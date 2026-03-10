function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-box">
      <span className="error-box__icon">⚠️</span>
      <p>{message || 'Ocurrió un error inesperado.'}</p>
      {onRetry && (
        <button className="btn btn--outline" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
