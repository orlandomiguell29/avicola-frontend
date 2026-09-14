import { useState, useEffect } from 'react';
import api from '../api/client.js';
import Layout from '../components/Layout.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Empresa() {
  const { showFlash } = useAuth();
  const [form, setForm] = useState({ nombre_empresa: '', nit: '', telefono: '', email: '', ciudad: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/empresa')
      .then(r => { setForm(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const submit = async e => {
    e.preventDefault();
    try {
      await api.put('/empresa', form);
      showFlash('Datos de empresa actualizados correctamente');
    } catch (ex) {
      showFlash(ex.response?.data?.error || 'Error al guardar', 'error');
    }
  };

  const campos = [
    { label: 'Nombre de la Empresa *', campo: 'nombre_empresa', placeholder: 'Avícola y Miscelánea Los Flamencos' },
    { label: 'NIT / Identificación', campo: 'nit', placeholder: 'Ej: 900.123.456-7' },
    { label: 'Teléfono', campo: 'telefono', placeholder: 'Ej: 310 123 4567' },
    { label: 'Correo electrónico', campo: 'email', placeholder: 'info@empresa.com', type: 'email' },
    { label: 'Ciudad', campo: 'ciudad', placeholder: 'Ej: Manizales, Caldas' },
  ];

  return (
    <Layout header={<h2 className="font-bold text-xl text-gray-800">🏢 Datos de la Empresa</h2>}>
      <div className="py-6 max-w-xl mx-auto px-4 space-y-5">

        <div className="bg-white p-6 rounded-xl shadow border-2 border-blue-100">
          <p className="text-xs text-gray-500 mb-5 bg-blue-50 p-3 rounded-lg">
            ℹ️ Esta información se guardará para referencia interna y podrá integrarse
            en colillas de pago y otros documentos en versiones futuras del sistema.
          </p>

          {loading ? (
            <p className="text-center text-gray-400 py-8">Cargando...</p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {campos.map(({ label, campo, placeholder, type = 'text' }) => (
                <div key={campo}>
                  <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[campo] || ''}
                    onChange={e => setForm({ ...form, [campo]: e.target.value })}
                    placeholder={placeholder}
                    required={campo === 'nombre_empresa'}
                    className="w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
              <div className="pt-2 text-right">
                <button type="submit" className="bg-blue-900 hover:bg-blue-950 text-white font-bold py-2.5 px-8 rounded-lg text-sm transition">
                  💾 Guardar Datos
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Vista previa */}
        {form.nombre_empresa && (
          <div className="bg-white border rounded-xl p-5 shadow">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Vista previa del encabezado de documentos</h3>
            <div className="border-b-2 border-blue-900 pb-3 mb-3">
              <p className="font-black text-lg text-blue-900">{form.nombre_empresa}</p>
              {form.nit && <p className="text-xs text-gray-600 mt-0.5">NIT: {form.nit}</p>}
              {form.ciudad && <p className="text-xs text-gray-600">📍 {form.ciudad}</p>}
              {form.telefono && <p className="text-xs text-gray-600">📞 {form.telefono}</p>}
              {form.email && <p className="text-xs text-gray-600">✉️ {form.email}</p>}
            </div>
            <p className="text-2xs text-gray-400 italic">Así aparecerá en documentos generados por el sistema.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
