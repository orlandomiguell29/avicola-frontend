import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Caja from './pages/Caja.jsx';
import Facturas from './pages/Facturas.jsx';
import Proveedores from './pages/Proveedores.jsx';
import Empleados from './pages/Empleados.jsx';
import Nomina from './pages/Nomina.jsx';
import Comprobante from './pages/Comprobante.jsx';
import Settings from './pages/Settings.jsx';
import Empresa from './pages/Empresa.jsx';
import Usuarios from './pages/Usuarios.jsx';
import Auditoria from './pages/Auditoria.jsx';
import Perfil from './pages/Perfil.jsx';

function Privada({ children, admin = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<Privada><Dashboard /></Privada>} />
      <Route path="/caja" element={<Privada><Caja /></Privada>} />
      <Route path="/facturas" element={<Privada><Facturas /></Privada>} />
      <Route path="/proveedores" element={<Privada><Proveedores /></Privada>} />
      <Route path="/empleados" element={<Privada><Empleados /></Privada>} />
      <Route path="/nomina" element={<Privada><Nomina /></Privada>} />
      <Route path="/nomina/:id/comprobante" element={<Privada><Comprobante /></Privada>} />
      <Route path="/settings" element={<Privada admin><Settings /></Privada>} />
      <Route path="/empresa" element={<Privada admin><Empresa /></Privada>} />
      <Route path="/usuarios" element={<Privada admin><Usuarios /></Privada>} />
      <Route path="/auditoria" element={<Privada admin><Auditoria /></Privada>} />
      <Route path="/perfil" element={<Privada><Perfil /></Privada>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AuthProvider><BrowserRouter><AppRoutes /></BrowserRouter></AuthProvider>;
}
