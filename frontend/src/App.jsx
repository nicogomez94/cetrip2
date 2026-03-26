import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

import Home from './pages/public/Home';
import QuienesSomos from './pages/public/QuienesSomos';
import Admision from './pages/public/Admision';
import Servicios from './pages/public/Servicios';
import ServicioDetalle from './pages/public/ServicioDetalle';
import CET from './pages/public/CET';
import SAIE from './pages/public/SAIE';
import Contacto from './pages/public/Contacto';

import Login from './pages/admin/Login';
import AdminHome from './pages/admin/AdminHome';
import AdminQuienesSomos from './pages/admin/AdminQuienesSomos';
import AdminServicios from './pages/admin/AdminServicios';
import AdminAdmision from './pages/admin/AdminAdmision';
import AdminContacto from './pages/admin/AdminContacto';
import AdminMessages from './pages/admin/AdminMessages';

function PublicLayout({ children, showFooter = true }) {
  const location = useLocation();

  useEffect(() => {
    const main = document.querySelector('.public-site .main-content');
    if (!main) return undefined;

    const revealSelector = '.home > section, .home > footer, .page-wrapper > section';

    const revealAll = () => {
      const elements = main.querySelectorAll(revealSelector);
      elements.forEach((el) => {
        el.classList.add('reveal-ready', 'is-visible');
      });
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      revealAll();
      return undefined;
    }

    let observer;
    let mutationObserver;

    const observeReveals = () => {
      const elements = main.querySelectorAll(revealSelector);
      elements.forEach((el, index) => {
        el.classList.add('reveal-ready');
        if (!el.style.getPropertyValue('--reveal-delay')) {
          const delay = Math.min(index * 90, 460);
          el.style.setProperty('--reveal-delay', `${delay}ms`);
        }
        if (!el.classList.contains('is-visible')) {
          observer.observe(el);
        }
      });
    };

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    observeReveals();

    mutationObserver = new MutationObserver(() => {
      observeReveals();
    });

    mutationObserver.observe(main, { childList: true, subtree: true });

    return () => {
      if (observer) observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, [location.pathname]);

  return (
    <div className="public-site">
      <Navbar />
      <main className="main-content">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/quienes-somos" element={<PublicLayout><QuienesSomos /></PublicLayout>} />
          <Route path="/admision" element={<PublicLayout><Admision /></PublicLayout>} />
          <Route path="/servicios" element={<PublicLayout><Servicios /></PublicLayout>} />
          <Route path="/servicios/:serviceSlug" element={<PublicLayout><ServicioDetalle /></PublicLayout>} />
          <Route path="/cet" element={<PublicLayout><CET /></PublicLayout>} />
          <Route path="/saie" element={<PublicLayout><SAIE /></PublicLayout>} />
          <Route path="/contacto" element={<PublicLayout><Contacto /></PublicLayout>} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><Navigate to="/admin/home" replace /></ProtectedRoute>} />
          <Route path="/admin/home" element={<ProtectedRoute><AdminHome /></ProtectedRoute>} />
          <Route path="/admin/quienes-somos" element={<ProtectedRoute><AdminQuienesSomos /></ProtectedRoute>} />
          <Route path="/admin/servicios" element={<ProtectedRoute><AdminServicios /></ProtectedRoute>} />
          <Route path="/admin/admision" element={<ProtectedRoute><AdminAdmision /></ProtectedRoute>} />
          <Route path="/admin/contacto" element={<ProtectedRoute><AdminContacto /></ProtectedRoute>} />
          <Route path="/admin/mensajes" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
