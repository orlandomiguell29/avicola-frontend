import { useState, useEffect, useCallback } from 'react';

import api from '../api/client.js';
import Layout from '../components/Layout.jsx';
import Paginador from '../components/Paginador.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { fmtFecha, soloFecha } from '../utils/fecha.js';
import { fmt } from '../utils/formato.js';

const BASES = ['Hora', 'Turno', 'Dia', 'Semana', 'Quincena', 'Mes'];
const vacio = { nombre: '', cedula: '', telefono: '', email: '', direccion: '', tipo: 'FIJO', base_periodo: 'Dia', tarifa_base: '', fecha_ingreso: '', observaciones: '' };
// Cantidad sin decimales
const fmtQ = n => Number.isInteger(Number(n)) ? Math.round(Number(n)) : Number(n);

export default function Empleados() {
  const { user, showFlash } = useAuth();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [textoBusq, setTextoBusq] = useState('');
  const [form, setForm] = useState({ ...vacio });
  const [edit, setEdit] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async (p = 1, b = '') => {
    const { data } = await api.get('/empleados', { params: { page: p, busqueda: b } });
    setRows(data.data); setTotal(data.total); setPage(data.page); setPages(data.pages);
  }, []);

  useEffect(() => { cargar(1, busqueda); }, [busqueda]);

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/empleados', form); showFlash('Empleado registrado'); setForm({ ...vacio }); cargar(1, busqueda); }
    catch (ex) { showFlash(ex.response?.data?.error || 'Error', 'error'); }
    finally { setSaving(false); }
  };

  const guardar = async id => {
    setSaving(true);
    try { await api.put(`/empleados/${id}`, editData); showFlash('Actualizado'); setEdit(null); cargar(page, busqueda); }
    catch (ex) { showFlash(ex.response?.data?.error || 'Error', 'error'); }
    finally { setSaving(false); }
  };

  const inactivar = async id => {
    if (!confirm('¿Inactivar este empleado? Sus pagos históricos quedan intactos.')) return;
    try { await api.delete(`/empleados/${id}`); showFlash('Inactivado'); cargar(page, busqueda); }
    catch (ex) { showFlash(ex.response?.data?.error || 'Error', 'error'); }
  };

  return (
    <Layout header={<h2 className="font-bold text-xl text-gray-800">🧑‍💼 Gestión de Empleados</h2>}>
      <div className="py-6 max-w-6xl mx-auto px-4 space-y-6">

        {/* FORMULARIO */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Registrar nuevo empleado</h3>
          <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { l: 'Nombre Completo *', c: 'nombre', p: 'Juan Pérez' },
              { l: 'Cédula', c: 'cedula', p: '1234567890' },
              { l: 'Teléfono', c: 'telefono', p: '310 123 4567' },
              { l: 'Correo', c: 'email', p: 'correo@dominio.com', t: 'email' },
              { l: 'Fecha Ingreso', c: 'fecha_ingreso', t: 'date' },
              { l: 'Tarifa Base ($) *', c: 'tarifa_base', t: 'number', p: '0' },
            ].map(({ l, c, p = '', t = 'text' }) => (
              <div key={c}>
                <label className="block text-xs font-bold text-gray-600 mb-1">{l}</label>
                <input type={t} value={form[c]} onChange={e => setForm({ ...form, [c]: e.target.value })}
                  placeholder={p} required={c === 'nombre' || c === 'tarifa_base'}
                  className="w-full p-2 border rounded text-sm" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Tipo</label>
              <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="w-full p-2 border rounded text-sm">
                <option value="FIJO">Fijo (planta)</option>
                <option value="POR_TURNO">Variable (turnos)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Base de Pago</label>
              <select value={form.base_periodo} onChange={e => setForm({ ...form, base_periodo: e.target.value })} className="w-full p-2 border rounded text-sm">
                {BASES.map(b => <option key={b} value={b}>Por {b}</option>)}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-600 mb-1">Dirección</label>
              <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} placeholder="Dirección de residencia" className="w-full p-2 border rounded text-sm" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-600 mb-1">Observaciones</label>
              <textarea value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} rows={2} className="w-full p-2 border rounded text-sm" placeholder="Notas adicionales..." />
            </div>
            <div className="md:col-span-3 text-right">
              <button type="submit" disabled={saving} className="bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold py-2 px-6 rounded disabled:opacity-50">+ Registrar Empleado</button>
            </div>
          </form>
        </div>

        {/* BUSCADOR */}
        <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-3 items-center">
          <span className="text-xs font-bold text-gray-600">🔍 Buscar:</span>
          <input type="text" value={textoBusq} onChange={e => setTextoBusq(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setBusqueda(textoBusq)}
            placeholder="Nombre, cédula o correo..." className="border rounded p-2 text-sm flex-1 max-w-sm" />
          <button onClick={() => setBusqueda(textoBusq)} className="bg-blue-900 text-white text-xs font-bold py-2 px-4 rounded hover:bg-blue-950">Buscar</button>
          {busqueda && <button onClick={() => { setTextoBusq(''); setBusqueda(''); }} className="bg-gray-200 text-gray-700 text-xs font-bold py-2 px-3 rounded">✕ Limpiar</button>}
          <span className="text-xs text-gray-400">{total} empleado(s)</span>
        </div>

        {/* TABLA */}
        <div className="bg-white p-5 rounded-xl shadow overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-600 uppercase font-bold">
              <tr>
                <th className="p-2">Nombre</th><th className="p-2">Cédula</th><th className="p-2">Teléfono</th>
                <th className="p-2">Correo</th><th className="p-2">Tipo</th><th className="p-2">Base</th>
                <th className="p-2 text-right">Tarifa</th><th className="p-2 text-right">Total Pagado</th>
                <th className="p-2">Ingreso</th><th className="p-2 text-center">Estado</th><th className="p-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(emp => edit === emp.id ? (
                <tr key={emp.id} className="border-b bg-blue-50 align-top">
                  <td className="p-1"><input value={editData.nombre || ''} onChange={e => setEditData({ ...editData, nombre: e.target.value })} className="p-1 border rounded text-xs w-full" /></td>
                  <td className="p-1"><input value={editData.cedula || ''} onChange={e => setEditData({ ...editData, cedula: e.target.value })} className="p-1 border rounded text-xs w-24" /></td>
                  <td className="p-1"><input value={editData.telefono || ''} onChange={e => setEditData({ ...editData, telefono: e.target.value })} className="p-1 border rounded text-xs w-24" /></td>
                  <td className="p-1"><input type="email" value={editData.email || ''} onChange={e => setEditData({ ...editData, email: e.target.value })} className="p-1 border rounded text-xs w-32" /></td>
                  <td className="p-1">
                    <select value={editData.tipo || 'FIJO'} onChange={e => setEditData({ ...editData, tipo: e.target.value })} className="p-1 border rounded text-xs">
                      <option value="FIJO">Fijo</option><option value="POR_TURNO">Variable</option>
                    </select>
                  </td>
                  <td className="p-1">
                    <select value={editData.base_periodo || 'Dia'} onChange={e => setEditData({ ...editData, base_periodo: e.target.value })} className="p-1 border rounded text-xs">
                      {BASES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </td>
                  <td className="p-1"><input type="number" step="any" value={editData.tarifa_base || ''} onChange={e => setEditData({ ...editData, tarifa_base: e.target.value })} className="p-1 border rounded text-xs w-24 text-right" /></td>
                  <td></td>
                  <td className="p-1"><input type="date" value={editData.fecha_ingreso || ''} onChange={e => setEditData({ ...editData, fecha_ingreso: e.target.value })} className="p-1 border rounded text-xs" /></td>
                  <td className="p-1 text-center">
                    <label className="flex items-center justify-center gap-1 text-xs">
                      <input type="checkbox" checked={!!editData.activo} onChange={e => setEditData({ ...editData, activo: e.target.checked })} /> Activo
                    </label>
                  </td>
                  <td className="p-1 text-center space-x-1">
                    <button onClick={() => guardar(emp.id)} disabled={saving} className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded disabled:opacity-50">✓</button>
                    <button onClick={() => setEdit(null)} className="bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded">✕</button>
                  </td>
                </tr>
              ) : (
                <tr key={emp.id} className={`border-b hover:bg-gray-50 ${!emp.activo ? 'opacity-50' : ''}`}>
                  <td className="p-2 font-medium">{emp.nombre}</td>
                  <td className="p-2 font-mono">{emp.cedula || '—'}</td>
                  <td className="p-2">{emp.telefono || '—'}</td>
                  <td className="p-2">{emp.email ? <a href={`mailto:${emp.email}`} className="text-blue-600 underline">{emp.email}</a> : '—'}</td>
                  <td className="p-2">{emp.tipo === 'FIJO' ? 'Fijo' : 'Variable'}</td>
                  <td className="p-2">Por {emp.base_periodo}</td>
                  <td className="p-2 text-right font-semibold">{fmt(emp.tarifa_base)}</td>
                  <td className="p-2 text-right font-bold text-purple-700">{fmt(emp.total_pagado)}</td>
                  <td className="p-2">{emp.fecha_ingreso ? fmtFecha(emp.fecha_ingreso) : '—'}</td>
                  <td className="p-2 text-center">{emp.activo ? <span className="text-green-600 font-bold">Activo</span> : <span className="text-red-600 font-bold">Inactivo</span>}</td>
                  <td className="p-2 text-center space-x-2">
                    {user?.puede_editar && <button onClick={() => { setEdit(emp.id); setEditData({ ...emp, fecha_ingreso: soloFecha(emp.fecha_ingreso) }); }} className="text-blue-700 font-bold hover:underline">Editar</button>}
                    {user?.puede_eliminar && emp.activo && <button onClick={() => inactivar(emp.id)} className="text-red-500 font-bold hover:underline">Inactivar</button>}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={11} className="p-4 text-center text-gray-400">No hay empleados que coincidan.</td></tr>}
            </tbody>
          </table>
          <Paginador page={page} pages={pages} total={total}
            onPrev={() => { const p = page - 1; setPage(p); cargar(p, busqueda); }}
            onNext={() => { const p = page + 1; setPage(p); cargar(p, busqueda); }} />
        </div>
      </div>
    </Layout>
  );
}
