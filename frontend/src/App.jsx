import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import Dashboard from './pages/admin/Dashboard';
import AdminSections from './pages/admin/AdminSections';
import AdminBlocks from './pages/admin/AdminBlocks';
import AdminMessages from './pages/admin/AdminMessages';

function PublicLayout({ children }) {
  return (
    <div className="public-site">
      <Navbar />
      <main className="main-content">{children}</main>
      <Footer />
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
          <Route path="/contacto" element={<PublicLayout><Contacto /></PublicLayout>} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/secciones" element={<ProtectedRoute><AdminSections /></ProtectedRoute>} />
          <Route path="/admin/bloques" element={<ProtectedRoute><AdminBlocks /></ProtectedRoute>} />
          <Route path="/admin/mensajes" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
