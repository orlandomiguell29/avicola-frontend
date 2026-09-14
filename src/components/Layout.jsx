import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

function Logo() {
  return (
    <svg viewBox="0 0 160 44" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto" fill="currentColor">
      <ellipse cx="20" cy="26" rx="8" ry="6" /><circle cx="29" cy="18" r="4.5" />
      <path d="M28 13 Q30 8 32 11 Q31 7 34 9 Q32 7 33 13 Z" />
      <path d="M33 18 L37 17 L33 20 Z" fill="#b45309" />
      <path d="M12 23 Q6 18 9 25 Q5 20 8 28 Q10 23 12 27 Z" />
      <line x1="18" y1="32" x2="17" y2="38" strokeWidth="1.4" stroke="currentColor" />
      <line x1="22" y1="32" x2="23" y2="38" strokeWidth="1.4" stroke="currentColor" />
      <circle cx="30.5" cy="17" r="1" fill="white" />
      <text x="42" y="24" fontSize="10" fontWeight="bold" fontFamily="Arial,sans-serif" letterSpacing="0.5">LOS FLAMENCOS</text>
      <text x="42" y="34" fontSize="7" fontFamily="Arial,sans-serif" letterSpacing="0.3">Avícola y Miscelánea</text>
    </svg>
  );
}

export default function Layout({ children, header }) {
  const { user, logout, flash } = useAuth();
  const loc = useLocation();
  const [menu, setMenu] = useState(false);
  const nav = href => loc.pathname === href
    ? 'text-blue-900 font-bold border-b-2 border-blue-900'
    : 'text-gray-600 hover:text-gray-900';

  return (
    <div className="min-h-screen bg-gray-100">
      {flash && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-bold ${flash.tipo === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {flash.tipo === 'success' ? '✅' : '❌'} {flash.msg}
        </div>
      )}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4 overflow-x-auto">
            <Link to="/"><Logo /></Link>
            <div className="hidden md:flex items-center gap-3 text-xs whitespace-nowrap">
              <Link to="/" className={nav('/')}>📊 Dashboard</Link>
              <Link to="/caja" className={nav('/caja')}>💵 Caja</Link>
              <Link to="/proveedores" className={nav('/proveedores')}>📇 Proveedores</Link>
              <Link to="/facturas" className={nav('/facturas')}>🚚 Facturas</Link>
              <Link to="/empleados" className={nav('/empleados')}>🧑‍💼 Empleados</Link>
              <Link to="/nomina" className={nav('/nomina')}>👥 Nómina</Link>
              {user?.es_admin && <>
                <Link to="/settings" className={nav('/settings')}>⚙️ Tarifas</Link>
                <Link to="/empresa" className={nav('/empresa')}>🏢 Empresa</Link>
                <Link to="/auditoria" className={nav('/auditoria')}>🛡️ Auditoría</Link>
                <Link to="/usuarios" className={nav('/usuarios')}>👤 Usuarios</Link>
              </>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:block">{user?.name}</span>
            <Link to="/perfil" className="text-xs text-blue-700 hover:underline hidden sm:block">Perfil</Link>
            <button onClick={logout} className="bg-gray-100 hover:bg-gray-200 text-xs font-bold px-3 py-1.5 rounded transition">Salir</button>
            <button onClick={() => setMenu(!menu)} className="md:hidden p-2 text-gray-500">☰</button>
          </div>
        </div>
        {menu && (
          <div className="md:hidden bg-white border-t px-4 py-3 space-y-2 text-sm">
            {[['/', '📊 Dashboard'], ['/caja', '💵 Caja'], ['/proveedores', '📇 Proveedores'],
              ['/facturas', '🚚 Facturas'], ['/empleados', '🧑‍💼 Empleados'], ['/nomina', '👥 Nómina']
            ].map(([h, l]) => <Link key={h} to={h} onClick={() => setMenu(false)} className="block py-1 text-gray-700">{l}</Link>)}
            {user?.es_admin && [
              ['/settings', '⚙️ Tarifas'], ['/empresa', '🏢 Empresa'],
              ['/auditoria', '🛡️ Auditoría'], ['/usuarios', '👤 Usuarios']
            ].map(([h, l]) => <Link key={h} to={h} onClick={() => setMenu(false)} className="block py-1 text-gray-700">{l}</Link>)}
            <Link to="/perfil" onClick={() => setMenu(false)} className="block py-1 text-gray-700">Mi Perfil</Link>
          </div>
        )}
      </nav>
      {header && <header className="bg-white shadow"><div className="max-w-7xl mx-auto px-4 py-4">{header}</div></header>}
      <main>{children}</main>
    </div>
  );
}
