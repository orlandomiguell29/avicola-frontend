import { useState, useEffect, useCallback } from 'react';
import api from '../api/client.js';
import Layout from '../components/Layout.jsx';
import FiltroFecha from '../components/FiltroFecha.jsx';
import Paginador from '../components/Paginador.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { fmtFecha, soloFecha, hoy } from '../utils/fecha.js';
import { fmt, padC } from '../utils/formato.js';

const MAPA = { Hora: 'tarifa_hora', Turno: 'tarifa_turno', Dia: 'tarifa_dia', Semana: 'tarifa_semana', Quincena: 'tarifa_quincena', Mes: 'tarifa_mes' };

export default function Nomina() {
  const { user, showFlash } = useAuth();
  const [rows, setRows] = useState([]); const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); const [pages, setPages] = useState(1);
  const [empleados, setEmpleados] = useState([]); const [tarifas, setTarifas] = useState({});
  const [desde, setDesde] = useState(''); const [hasta, setHasta] = useState('');
  const [filtroDesde, setFiltroDesde] = useState(''); const [filtroHasta, setFiltroHasta] = useState('');
  const [form, setForm] = useState({ fecha: hoy(), employee_id: '', nombre_empleado: '', tipo_empleado: 'FIJO', base_periodo: 'Dia', cantidad_trabajada: 1, tarifa_aplicada: '' });
  const [edit, setEdit] = useState(null); const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  const totalF = (parseFloat(form.cantidad_trabajada) || 0) * (parseFloat(form.tarifa_aplicada) || 0);
  const totalE = (parseFloat(editData.cantidad_trabajada) || 0) * (parseFloat(editData.tarifa_aplicada) || 0);

  const cargar = useCallback(async (p = 1, d = '', h = '') => {
    const { data } = await api.get('/nomina', { params: { page: p, desde: d, hasta: h } });
    setRows(data.data); setTotal(data.total); setPage(data.page); setPages(data.pages);
  }, []);

  useEffect(() => {
    Promise.all([api.get('/empleados/activos'), api.get('/settings')]).then(([e, s]) => {
      setEmpleados(e.data); setTarifas(s.data);
      if (e.data[0]) {
        const emp = e.data[0];
        setForm(f => ({ ...f, employee_id: emp.id, nombre_empleado: emp.nombre, tipo_empleado: emp.tipo, base_periodo: emp.base_periodo, tarifa_aplicada: emp.tarifa_base || s.data[MAPA[emp.base_periodo]] || 0 }));
      }
    });
    cargar();
  }, []);

  useEffect(() => { cargar(1, desde, hasta); }, [desde, hasta]);

  const selEmp = id => {
    const emp = empleados.find(e => e.id === parseInt(id));
    if (emp) setForm(f => ({ ...f, employee_id: emp.id, nombre_empleado: emp.nombre, tipo_empleado: emp.tipo, base_periodo: emp.base_periodo, tarifa_aplicada: emp.tarifa_base || tarifas[MAPA[emp.base_periodo]] || f.tarifa_aplicada }));
  };

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/nomina', form); showFlash('Pago registrado'); setForm(f => ({ ...f, cantidad_trabajada: 1 })); cargar(1, desde, hasta); }
    catch (ex) { showFlash(ex.response?.data?.error || 'Error', 'error'); } finally { setSaving(false); }
  };
  const guardar = async id => {
    setSaving(true);
    try { await api.put(`/nomina/${id}`, editData); showFlash('Actualizado'); setEdit(null); cargar(page, desde, hasta); }
    catch (ex) { showFlash(ex.response?.data?.error || 'Error', 'error'); } finally { setSaving(false); }
  };
  const eliminar = async id => {
    if (!confirm('¿Dar de baja?')) return;
    try { await api.delete(`/nomina/${id}`); showFlash('Dada de baja'); cargar(page, desde, hasta); }
    catch (ex) { showFlash(ex.response?.data?.error || 'Error', 'error'); }
  };

  return (
    <Layout header={<h2 className="font-bold text-xl text-gray-800">👥 Registro e Historial de Nómina</h2>}>
      <div className="py-6 max-w-6xl mx-auto px-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow lg:col-span-2">
            <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">Liquidar y Registrar Pago</h3>
            <form onSubmit={submit} className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-600">Fecha del Pago</label><input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required className="w-full p-2 border rounded text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600">Empleado</label>
                <select value={form.employee_id} onChange={e => selEmp(e.target.value)} className="w-full p-2 border rounded text-sm">
                  <option value="">— Seleccionar —</option>
                  {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select></div>
              <div><label className="block text-xs font-bold text-gray-600">Nombre (editable)</label><input value={form.nombre_empleado} onChange={e => setForm({ ...form, nombre_empleado: e.target.value })} required className="w-full p-2 border rounded text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600">Tipo</label>
                <select value={form.tipo_empleado} onChange={e => setForm({ ...form, tipo_empleado: e.target.value })} className="w-full p-2 border rounded text-sm">
                  <option value="FIJO">Fijo</option><option value="POR_TURNO">Variable</option>
                </select></div>
              <div><label className="block text-xs font-bold text-gray-600">Base del Período</label>
                <select value={form.base_periodo} onChange={e => setForm(f => ({ ...f, base_periodo: e.target.value, tarifa_aplicada: tarifas[MAPA[e.target.value]] || f.tarifa_aplicada }))} className="w-full p-2 border rounded text-sm">
                  {Object.keys(MAPA).map(b => <option key={b} value={b}>Por {b}</option>)}
                </select></div>
              <div><label className="block text-xs font-bold text-gray-600">Cantidad Laborada</label><input type="number" step="1" min="1" value={form.cantidad_trabajada} onChange={e => setForm({ ...form, cantidad_trabajada: e.target.value })} required className="w-full p-2 border rounded text-sm text-center" /></div>
              <div><label className="block text-xs font-bold text-gray-600">Tarifa ($)</label><input type="number" step="any" value={form.tarifa_aplicada} onChange={e => setForm({ ...form, tarifa_aplicada: e.target.value })} required className="w-full p-2 border rounded text-sm bg-blue-50 text-blue-900 text-right" /></div>
              <div className="col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-200 flex justify-between items-center">
                <span className="text-xs font-bold text-blue-900 uppercase">Total Liquidación:</span>
                <span className="text-xl font-black text-blue-800">{fmt(totalF)}</span>
              </div>
              <div className="col-span-2"><button type="submit" disabled={saving} className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-2.5 rounded text-xs uppercase disabled:opacity-50">💾 Guardar en Historial</button></div>
            </form>
          </div>
          {user?.es_admin && (
            <div className="bg-white p-5 rounded-xl shadow border-2 border-yellow-400 h-fit">
              <h3 className="font-bold text-yellow-800 mb-2">⚙️ Tarifas Base</h3>
              <a href="/settings" className="text-xs text-blue-700 underline">Editar en Parametrizaciones</a>
              <div className="mt-3 space-y-1 text-xs">
                {Object.entries(MAPA).map(([b, c]) => <div key={c} className="flex justify-between"><span className="text-gray-600">Por {b}:</span><span className="font-semibold">{fmt(tarifas[c])}</span></div>)}
              </div>
            </div>
          )}
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <FiltroFecha desde={filtroDesde} hasta={filtroHasta} onDesde={setFiltroDesde} onHasta={setFiltroHasta} onBuscar={() => { setDesde(filtroDesde); setHasta(filtroHasta); }} onLimpiar={() => { setFiltroDesde(''); setFiltroHasta(''); setDesde(''); setHasta(''); }} />
        </div>
        <div className="bg-white p-5 rounded-xl shadow overflow-x-auto">
          <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">📋 Historial Completo de Pagos de Personal</h3>
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-600 uppercase font-bold">
              <tr><th className="p-2">#</th><th className="p-2">Fecha</th><th className="p-2">Empleado</th><th className="p-2">Tipo</th><th className="p-2">Base</th><th className="p-2 text-center">Cant.</th><th className="p-2 text-right">Tarifa</th><th className="p-2 text-right">Total</th><th className="p-2 text-center">Colilla</th><th className="p-2 text-center">Acciones</th></tr>
            </thead>
            <tbody>
              {rows.map(n => edit === n.id ? (
                <tr key={n.id} className="border-b bg-blue-50">
                  <td className="p-1 font-mono text-blue-700 font-bold">{padC(n.consecutivo)}</td>
                  <td className="p-1"><input type="date" value={editData.fecha || ''} onChange={e => setEditData({ ...editData, fecha: e.target.value })} className="p-1 border rounded text-xs w-32" /></td>
                  <td className="p-1"><input value={editData.nombre_empleado || ''} onChange={e => setEditData({ ...editData, nombre_empleado: e.target.value })} className="p-1 border rounded text-xs w-full" /></td>
                  <td className="p-1"><select value={editData.tipo_empleado || 'FIJO'} onChange={e => setEditData({ ...editData, tipo_empleado: e.target.value })} className="p-1 border rounded text-xs"><option value="FIJO">Fijo</option><option value="POR_TURNO">Variable</option></select></td>
                  <td className="p-1"><select value={editData.base_periodo || 'Dia'} onChange={e => setEditData({ ...editData, base_periodo: e.target.value })} className="p-1 border rounded text-xs">{Object.keys(MAPA).map(b => <option key={b} value={b}>{b}</option>)}</select></td>
                  <td className="p-1"><input type="number" step="1" min="1" value={editData.cantidad_trabajada || ''} onChange={e => setEditData({ ...editData, cantidad_trabajada: e.target.value })} className="p-1 border rounded text-xs w-16 text-center" /></td>
                  <td className="p-1"><input type="number" step="any" value={editData.tarifa_aplicada || ''} onChange={e => setEditData({ ...editData, tarifa_aplicada: e.target.value })} className="p-1 border rounded text-xs w-24 text-right" /></td>
                  <td className="p-1 font-bold">{fmt(totalE)}</td><td></td>
                  <td className="p-1 text-center space-x-1">
                    <button onClick={() => guardar(n.id)} disabled={saving} className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">✓</button>
                    <button onClick={() => setEdit(null)} className="bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded">✕</button>
                  </td>
                </tr>
              ) : (
                <tr key={n.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-mono text-blue-700 font-bold">{padC(n.consecutivo)}</td>
                  <td className="p-2 whitespace-nowrap">{fmtFecha(n.fecha)}</td>
                  <td className="p-2 font-medium">{n.nombre_empleado}</td>
                  <td className="p-2">{n.tipo_empleado === 'FIJO' ? 'Fijo' : 'Variable'}</td>
                  <td className="p-2">Por {n.base_periodo}</td>
                  <td className="p-2 text-center font-bold">{Math.round(Number(n.cantidad_trabajada))}</td>
                  <td className="p-2 text-right text-gray-600">{fmt(n.tarifa_aplicada)}</td>
                  <td className="p-2 text-right font-bold text-purple-700">{fmt(n.total_pagado)}</td>
                  <td className="p-2 text-center"><a href={`/nomina/${n.id}/comprobante`} target="_blank" rel="noreferrer" className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm">🖨️</a></td>
                  <td className="p-2 text-center space-x-2">
                    {user?.puede_editar && <button onClick={() => { setEdit(n.id); setEditData({ fecha: soloFecha(n.fecha), nombre_empleado: n.nombre_empleado, tipo_empleado: n.tipo_empleado, base_periodo: n.base_periodo, cantidad_trabajada: Math.round(Number(n.cantidad_trabajada)), tarifa_aplicada: n.tarifa_aplicada }); }} className="text-blue-700 font-bold hover:underline">Editar</button>}
                    {user?.puede_eliminar && <button onClick={() => eliminar(n.id)} className="text-red-500 font-bold hover:underline">✕ Baja</button>}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={10} className="p-6 text-center text-gray-400">No hay registros de nómina.</td></tr>}
            </tbody>
          </table>
          <Paginador page={page} pages={pages} total={total} onPrev={() => { const p = page - 1; setPage(p); cargar(p, desde, hasta); }} onNext={() => { const p = page + 1; setPage(p); cargar(p, desde, hasta); }} />
        </div>
      </div>
    </Layout>
  );
}
