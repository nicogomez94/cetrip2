import { useEffect } from 'react';

const TOAST_DURATION_MS = 4000;

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast.visible) return undefined;
    const timer = window.setTimeout(onClose, TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.visible, onClose]);

  if (!toast.visible) return null;

  const isError = toast.type === 'error';

  return (
    <div className="admin-toast-stack">
      <div
        className={`admin-toast ${isError ? 'admin-toast--error' : 'admin-toast--success'}`}
        role={isError ? 'alert' : 'status'}
        aria-live={isError ? 'assertive' : 'polite'}
      >
        <p className="admin-toast__message">{toast.message}</p>
        <button
          type="button"
          className="admin-toast__close"
          onClick={onClose}
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default Toast;
