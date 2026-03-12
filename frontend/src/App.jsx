import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

import Home from './pages/public/Home';
import QuienesSomos from './pages/public/QuienesSomos';
import Admision from './pages/public/Admision';
import Servicios from './pages/public/Servicios';
import Contacto from './pages/public/Contacto';

import Login from './pages/admin/Login';
import AdminHome from './pages/admin/AdminHome';
import AdminQuienesSomos from './pages/admin/AdminQuienesSomos';
import AdminServicios from './pages/admin/AdminServicios';
import AdminAdmision from './pages/admin/AdminAdmision';
import AdminContacto from './pages/admin/AdminContacto';
import AdminMessages from './pages/admin/AdminMessages';

function PublicLayout({ children, showFooter = true }) {
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
          <Route path="/" element={<PublicLayout showFooter={false}><Home /></PublicLayout>} />
          <Route path="/quienes-somos" element={<PublicLayout><QuienesSomos /></PublicLayout>} />
          <Route path="/admision" element={<PublicLayout><Admision /></PublicLayout>} />
          <Route path="/servicios" element={<PublicLayout><Servicios /></PublicLayout>} />
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
