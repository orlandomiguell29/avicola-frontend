import { useState, useEffect, useCallback } from 'react';
import api from '../api/client.js';
import Layout from '../components/Layout.jsx';
import FiltroFecha from '../components/FiltroFecha.jsx';
import Paginador from '../components/Paginador.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { fmtFecha, soloFecha, hoy } from '../utils/fecha.js';
import { fmt } from '../utils/formato.js';

export default function Caja() {
  const { user, showFlash } = useAuth();
  const [rows, setRows] = useState([]); const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); const [pages, setPages] = useState(1);
  const [desde, setDesde] = useState(''); const [hasta, setHasta] = useState('');
  const [filtroDesde, setFiltroDesde] = useState(''); const [filtroHasta, setFiltroHasta] = useState('');
  const [form, setForm] = useState({ fecha: hoy(), tipo: 'DEBE', concepto: '', cantidad: 1, precio_unitario: '' });
  const [edit, setEdit] = useState(null); const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  const totalF = (parseFloat(form.cantidad) || 0) * (parseFloat(form.precio_unitario) || 0);
  const totalE = (parseFloat(editData.cantidad) || 0) * (parseFloat(editData.precio_unitario) || 0);

  const cargar = useCallback(async (p = 1, d = '', h = '') => {
    const { data } = await api.get('/caja', { params: { page: p, desde: d, hasta: h } });
    setRows(data.data); setTotal(data.total); setPage(data.page); setPages(data.pages);
  }, []);

  useEffect(() => { cargar(1, desde, hasta); }, [desde, hasta]);

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/caja', form); showFlash('Movimiento registrado'); setForm(f => ({ ...f, concepto: '', precio_unitario: '' })); cargar(1, desde, hasta); }
    catch (ex) { showFlash(ex.response?.data?.error || 'Error', 'error'); } finally { setSaving(false); }
  };
  const guardar = async id => {
    setSaving(true);
    try { await api.put(`/caja/${id}`, editData); showFlash('Actualizado'); setEdit(null); cargar(page, desde, hasta); }
    catch (ex) { showFlash(ex.response?.data?.error || 'Error', 'error'); } finally { setSaving(false); }
  };
  const eliminar = async id => {
    if (!confirm('¿Dar de baja?')) return;
    try { await api.delete(`/caja/${id}`); showFlash('Dado de baja'); cargar(page, desde, hasta); }
    catch (ex) { showFlash(ex.response?.data?.error || 'Error', 'error'); }
  };
  const buscar = () => { setDesde(filtroDesde); setHasta(filtroHasta); };
  const limpiar = () => { setFiltroDesde(''); setFiltroHasta(''); setDesde(''); setHasta(''); };

  return (
    <Layout header={<h2 className="font-bold text-xl text-gray-800">💵 Contabilidad Diaria — Caja</h2>}>
      <div className="py-6 max-w-5xl mx-auto px-4 space-y-4">
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Registrar nuevo movimiento</h3>
          <form onSubmit={submit} className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-gray-600">Fecha</label><input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required className="w-full p-2 border rounded text-sm" /></div>
            <div><label className="block text-xs font-bold text-gray-600">Tipo</label>
              <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="w-full p-2 border rounded text-sm">
                <option value="DEBE">DEBE (Ingreso / Ventas)</option><option value="HABER">HABER (Egreso / Gastos)</option>
              </select></div>
            <div className="col-span-2"><label className="block text-xs font-bold text-gray-600">Concepto</label><input value={form.concepto} onChange={e => setForm({ ...form, concepto: e.target.value })} required placeholder="Ej: Venta de Huevo AAA" className="w-full p-2 border rounded text-sm" /></div>
            <div><label className="block text-xs font-bold text-gray-600">Cantidad</label><input type="number" step="1" min="1" value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} required className="w-full p-2 border rounded text-sm text-center" /></div>
            <div><label className="block text-xs font-bold text-gray-600">Precio Unitario ($)</label><input type="number" step="any" value={form.precio_unitario} onChange={e => setForm({ ...form, precio_unitario: e.target.value })} required placeholder="0" className="w-full p-2 border rounded text-sm text-right" /></div>
            <div className="col-span-2 bg-gray-50 p-2 rounded border flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500">MONTO TOTAL CALCULADO:</span>
              <span className="font-bold text-gray-800">{fmt(totalF)}</span>
            </div>
            <div className="col-span-2 text-right"><button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-6 rounded disabled:opacity-50">+ Cargar Movimiento</button></div>
          </form>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <FiltroFecha desde={filtroDesde} hasta={filtroHasta} onDesde={setFiltroDesde} onHasta={setFiltroHasta} onBuscar={buscar} onLimpiar={limpiar} label="🔍 Filtrar por fechas:" />
          {(desde || hasta) && <p className="text-xs text-blue-700 mt-2">Mostrando: {desde ? fmtFecha(desde) : 'inicio'} → {hasta ? fmtFecha(hasta) : 'hoy'} — {total} resultado(s)</p>}
        </div>
        <div className="bg-white p-5 rounded-xl shadow overflow-x-auto">
          <div className="flex justify-between items-center mb-3"><h3 className="font-bold text-gray-700">📋 Historial de Movimientos</h3><span className="text-xs text-gray-400">{total} registro(s)</span></div>
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-600 uppercase font-bold">
              <tr><th className="p-2">Fecha</th><th className="p-2">Tipo</th><th className="p-2">Detalle</th><th className="p-2 text-center">Cant.</th><th className="p-2 text-right">P. Unit</th><th className="p-2 text-right">Total</th><th className="p-2">Usuario</th><th className="p-2 text-center">Acciones</th></tr>
            </thead>
            <tbody>
              {rows.map(m => edit === m.id ? (
                <tr key={m.id} className="border-b bg-blue-50">
                  <td className="p-1"><input type="date" value={editData.fecha || ''} onChange={e => setEditData({ ...editData, fecha: e.target.value })} className="p-1 border rounded text-xs w-32" /></td>
                  <td className="p-1"><select value={editData.tipo || 'DEBE'} onChange={e => setEditData({ ...editData, tipo: e.target.value })} className="p-1 border rounded text-xs"><option value="DEBE">DEBE</option><option value="HABER">HABER</option></select></td>
                  <td className="p-1"><input value={editData.concepto || ''} onChange={e => setEditData({ ...editData, concepto: e.target.value })} className="p-1 border rounded text-xs w-full" /></td>
                  <td className="p-1"><input type="number" step="1" min="1" value={editData.cantidad || ''} onChange={e => setEditData({ ...editData, cantidad: e.target.value })} className="p-1 border rounded text-xs w-16 text-center" /></td>
                  <td className="p-1"><input type="number" step="any" value={editData.precio_unitario || ''} onChange={e => setEditData({ ...editData, precio_unitario: e.target.value })} className="p-1 border rounded text-xs w-24 text-right" /></td>
                  <td className="p-1 font-bold">{fmt(totalE)}</td><td></td>
                  <td className="p-1 text-center space-x-1">
                    <button onClick={() => guardar(m.id)} disabled={saving} className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">✓</button>
                    <button onClick={() => setEdit(null)} className="bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded">✕</button>
                  </td>
                </tr>
              ) : (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 whitespace-nowrap">{fmtFecha(m.fecha)}</td>
                  <td className="p-2"><span className={`font-bold px-2 py-0.5 rounded text-xs ${m.tipo === 'DEBE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.tipo}</span></td>
                  <td className="p-2">{m.concepto}</td>
                  <td className="p-2 text-center">{Math.round(Number(m.cantidad))}</td>
                  <td className="p-2 text-right text-gray-500">{fmt(m.precio_unitario)}</td>
                  <td className="p-2 text-right font-semibold">{fmt(m.monto_total)}</td>
                  <td className="p-2 text-gray-500">{m.usuario_name}</td>
                  <td className="p-2 text-center space-x-2">
                    {user?.puede_editar && <button onClick={() => { setEdit(m.id); setEditData({ fecha: soloFecha(m.fecha), tipo: m.tipo, concepto: m.concepto, cantidad: Math.round(Number(m.cantidad)), precio_unitario: m.precio_unitario }); }} className="text-blue-700 font-bold hover:underline">Editar</button>}
                    {user?.puede_eliminar && <button onClick={() => eliminar(m.id)} className="text-red-500 font-bold hover:underline">✕ Baja</button>}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-gray-400">No hay movimientos{(desde || hasta) ? ' para el período seleccionado' : ' registrados aún'}.</td></tr>}
            </tbody>
          </table>
          <Paginador page={page} pages={pages} total={total} onPrev={() => { const p = page - 1; setPage(p); cargar(p, desde, hasta); }} onNext={() => { const p = page + 1; setPage(p); cargar(p, desde, hasta); }} />
        </div>
      </div>
    </Layout>
  );
}
