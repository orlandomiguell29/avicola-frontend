import { useState, useEffect, useCallback } from 'react';
import api from '../api/client.js';
import Layout from '../components/Layout.jsx';
import FiltroFecha from '../components/FiltroFecha.jsx';
import Paginador from '../components/Paginador.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { fmtFecha, soloFecha, hoy } from '../utils/fecha.js';
import { fmt } from '../utils/formato.js';

export default function Facturas() {
  const { user, showFlash } = useAuth();
  const [rows, setRows] = useState([]); const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); const [pages, setPages] = useState(1);
  const [proveedores, setProveedores] = useState([]);
  const [desde, setDesde] = useState(''); const [hasta, setHasta] = useState('');
  const [filtroDesde, setFiltroDesde] = useState(''); const [filtroHasta, setFiltroHasta] = useState('');
  const [form, setForm] = useState({ fecha: hoy(), supplier_id: '', numero_factura: '', descripcion_insumo: '', cantidad: 1, costo_unitario: '' });
  const [edit, setEdit] = useState(null); const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  const totalF = (parseFloat(form.cantidad) || 0) * (parseFloat(form.costo_unitario) || 0);
  const totalE = (parseFloat(editData.cantidad) || 0) * (parseFloat(editData.costo_unitario) || 0);

  const cargar = useCallback(async (p = 1, d = '', h = '') => {
    const { data } = await api.get('/facturas', { params: { page: p, desde: d, hasta: h } });
    setRows(data.data); setTotal(data.total); setPage(data.page); setPages(data.pages);
  }, []);

  useEffect(() => {
    api.get('/proveedores/activos').then(r => {
      setProveedores(r.data);
      if (r.data[0]) setForm(f => ({ ...f, supplier_id: r.data[0].id }));
    });
    cargar();
  }, []);

  useEffect(() => { cargar(1, desde, hasta); }, [desde, hasta]);

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/facturas', form); showFlash('Factura registrada'); setForm(f => ({ ...f, numero_factura: '', descripcion_insumo: '', costo_unitario: '' })); cargar(1, desde, hasta); }
    catch (ex) { showFlash(ex.response?.data?.error || 'Error', 'error'); } finally { setSaving(false); }
  };
  const guardar = async id => {
    setSaving(true);
    try { await api.put(`/facturas/${id}`, editData); showFlash('Actualizada'); setEdit(null); cargar(page, desde, hasta); }
    catch (ex) { showFlash(ex.response?.data?.error || 'Error', 'error'); } finally { setSaving(false); }
  };
  const eliminar = async id => {
    if (!confirm('¿Dar de baja?')) return;
    try { await api.delete(`/facturas/${id}`); showFlash('Dada de baja'); cargar(page, desde, hasta); }
    catch (ex) { showFlash(ex.response?.data?.error || 'Error', 'error'); }
  };

  return (
    <Layout header={<h2 className="font-bold text-xl text-gray-800">🚚 Facturación de Proveedores</h2>}>
      <div className="py-6 max-w-6xl mx-auto px-4 space-y-4">
        <div className="bg-white p-5 rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-gray-700">Registrar nueva factura</span>
            <a href="/proveedores" className="text-xs font-bold text-blue-700 underline">📇 Gestionar catálogo</a>
          </div>
          {proveedores.length === 0 ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">No hay proveedores activos. <a href="/proveedores" className="underline font-bold">Crea uno primero</a>.</p>
          ) : (
            <form onSubmit={submit} className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-600">Fecha</label><input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required className="w-full p-2 border rounded text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600">Proveedor</label>
                <select value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })} required className="w-full p-2 border rounded text-sm">
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select></div>
              <div><label className="block text-xs font-bold text-gray-600">No. Factura</label><input value={form.numero_factura} onChange={e => setForm({ ...form, numero_factura: e.target.value })} required placeholder="FE-10482" className="w-full p-2 border rounded text-sm font-mono" /></div>
              <div><label className="block text-xs font-bold text-gray-600">Insumo / Descripción</label><input value={form.descripcion_insumo} onChange={e => setForm({ ...form, descripcion_insumo: e.target.value })} required className="w-full p-2 border rounded text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-600">Cantidad</label><input type="number" step="1" min="1" value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} required className="w-full p-2 border rounded text-sm text-center" /></div>
              <div><label className="block text-xs font-bold text-gray-600">Costo Unitario ($)</label><input type="number" step="any" value={form.costo_unitario} onChange={e => setForm({ ...form, costo_unitario: e.target.value })} required placeholder="0" className="w-full p-2 border rounded text-sm text-right" /></div>
              <div className="col-span-2 bg-gray-50 p-2 rounded border flex justify-between items-center"><span className="text-xs font-bold text-gray-500">COSTO TOTAL:</span><span className="font-bold">{fmt(totalF)}</span></div>
              <div className="col-span-2 text-right"><button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded disabled:opacity-50">+ Registrar</button></div>
            </form>
          )}
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <FiltroFecha desde={filtroDesde} hasta={filtroHasta} onDesde={setFiltroDesde} onHasta={setFiltroHasta} onBuscar={() => { setDesde(filtroDesde); setHasta(filtroHasta); }} onLimpiar={() => { setFiltroDesde(''); setFiltroHasta(''); setDesde(''); setHasta(''); }} />
        </div>
        <div className="bg-white p-5 rounded-xl shadow overflow-x-auto">
          <div className="flex justify-between items-center mb-3"><h3 className="font-bold text-gray-700">📋 Historial de Facturas</h3><span className="text-xs text-gray-400">{total} factura(s)</span></div>
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-600 uppercase font-bold">
              <tr><th className="p-2">Fecha</th><th className="p-2">Proveedor</th><th className="p-2">No. Factura</th><th className="p-2">Insumo</th><th className="p-2 text-center">Cant.</th><th className="p-2 text-right">C. Unit</th><th className="p-2 text-right">Total</th><th className="p-2">Usuario</th><th className="p-2 text-center">Acciones</th></tr>
            </thead>
            <tbody>
              {rows.map(f => edit === f.id ? (
                <tr key={f.id} className="border-b bg-blue-50">
                  <td className="p-1"><input type="date" value={editData.fecha || ''} onChange={e => setEditData({ ...editData, fecha: e.target.value })} className="p-1 border rounded text-xs w-32" /></td>
                  <td className="p-1"><select value={editData.supplier_id || ''} onChange={e => setEditData({ ...editData, supplier_id: e.target.value })} className="p-1 border rounded text-xs w-full">{proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></td>
                  <td className="p-1"><input value={editData.numero_factura || ''} onChange={e => setEditData({ ...editData, numero_factura: e.target.value })} className="p-1 border rounded text-xs w-24" /></td>
                  <td className="p-1"><input value={editData.descripcion_insumo || ''} onChange={e => setEditData({ ...editData, descripcion_insumo: e.target.value })} className="p-1 border rounded text-xs w-full" /></td>
                  <td className="p-1"><input type="number" step="1" min="1" value={editData.cantidad || ''} onChange={e => setEditData({ ...editData, cantidad: e.target.value })} className="p-1 border rounded text-xs w-16 text-center" /></td>
                  <td className="p-1"><input type="number" step="any" value={editData.costo_unitario || ''} onChange={e => setEditData({ ...editData, costo_unitario: e.target.value })} className="p-1 border rounded text-xs w-24 text-right" /></td>
                  <td className="p-1 font-bold">{fmt(totalE)}</td><td></td>
                  <td className="p-1 text-center space-x-1">
                    <button onClick={() => guardar(f.id)} disabled={saving} className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">✓</button>
                    <button onClick={() => setEdit(null)} className="bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded">✕</button>
                  </td>
                </tr>
              ) : (
                <tr key={f.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 whitespace-nowrap">{fmtFecha(f.fecha)}</td>
                  <td className="p-2 font-medium">{f.nombre_proveedor}</td>
                  <td className="p-2 font-mono font-semibold">{f.numero_factura}</td>
                  <td className="p-2">{f.descripcion_insumo}</td>
                  <td className="p-2 text-center">{Math.round(Number(f.cantidad))}</td>
                  <td className="p-2 text-right text-gray-500">{fmt(f.costo_unitario)}</td>
                  <td className="p-2 text-right font-bold text-red-600">{fmt(f.costo_total)}</td>
                  <td className="p-2 text-gray-500">{f.usuario_name}</td>
                  <td className="p-2 text-center space-x-2">
                    {user?.puede_editar && <button onClick={() => { setEdit(f.id); setEditData({ fecha: soloFecha(f.fecha), supplier_id: f.supplier_id, numero_factura: f.numero_factura, descripcion_insumo: f.descripcion_insumo, cantidad: Math.round(Number(f.cantidad)), costo_unitario: f.costo_unitario }); }} className="text-blue-700 font-bold hover:underline">Editar</button>}
                    {user?.puede_eliminar && <button onClick={() => eliminar(f.id)} className="text-red-500 font-bold hover:underline">✕ Baja</button>}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={9} className="p-6 text-center text-gray-400">No hay facturas registradas.</td></tr>}
            </tbody>
          </table>
          <Paginador page={page} pages={pages} total={total} onPrev={() => { const p = page - 1; setPage(p); cargar(p, desde, hasta); }} onNext={() => { const p = page + 1; setPage(p); cargar(p, desde, hasta); }} />
        </div>
      </div>
    </Layout>
  );
}
