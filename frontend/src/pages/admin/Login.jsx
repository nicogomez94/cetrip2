import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/forms.css';
import '../../styles/admin.css';

const DEBUG = import.meta.env.VITE_DEBUG === 'true';
const DEBUG_CREDS = { email: 'admin@cetrip.com', password: 'admin123' };

function Login() {
  const { login, isAuthenticated, loading, error } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(
    DEBUG ? DEBUG_CREDS : { email: '', password: '' }
  );

  useEffect(() => {
    if (isAuthenticated) navigate('/admin', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(form.email, form.password);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <span className="login-card__logo">🌱</span>
          <h1>CETRIP</h1>
          <p>Panel de Administración</p>
        </div>

        {DEBUG && (
          <div className="debug-badge debug-badge--center">
            🛠 Modo DEBUG activo – credenciales cargadas
          </div>
        )}

        <form className="form" onSubmit={handleSubmit} noValidate>
          {error && <div className="form-alert form-alert--error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@cetrip.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="login-card__back">
          <a href="/">← Volver al sitio</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
