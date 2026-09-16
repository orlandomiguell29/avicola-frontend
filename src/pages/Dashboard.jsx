import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import api from '../api/client.js';
import Layout from '../components/Layout.jsx';
import StatCard from '../components/StatCard.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { fmtFecha, hoy } from '../utils/fecha.js';
import { fmt } from '../utils/formato.js';

const VACÍO = { resumenDia:{ingresos:0,egresos:0,neto:0}, resumenMes:{ingresos:0,egresos:0,utilidad:0}, desgloseEgresosMes:{caja:0,proveedores:0,nomina:0}, serie:[], serieAcum:[] };

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [fecha, setFecha] = useState(hoy());
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const barRef = useRef(); const acumRef = useRef(); const donaRef = useRef();
  const barC = useRef(); const acumC = useRef(); const donaC = useRef();

  useEffect(() => {
    setData(null); setError('');
    api.get(`/dashboard?fecha=${fecha}`)
      .then(r => setData(r.data))
      .catch(e => {
        console.error('Dashboard error:', e);
        setError(e.response?.data?.error || 'Error al cargar datos. Verifica que el servidor esté corriendo.');
        setData(VACÍO);
      });
  }, [fecha]);

  useEffect(() => {
    if (!data?.serie?.length) return;
    if (barC.current) barC.current.destroy();
    barC.current = new Chart(barRef.current, {
      type: 'bar',
      data: {
        labels: data.serie.map(x => fmtFecha(x.fecha)),
        datasets: [
          { label: 'Ingresos', data: data.serie.map(x => x.ingresos), backgroundColor: '#10B981', borderRadius: 4 },
          { label: 'Gastos', data: data.serie.map(x => x.egresos), backgroundColor: '#EF4444', borderRadius: 4 },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } },
    });
    return () => barC.current?.destroy();
  }, [data?.serie]);

  useEffect(() => {
    if (!data?.serieAcum?.length) return;
    if (acumC.current) acumC.current.destroy();
    acumC.current = new Chart(acumRef.current, {
      type: 'line',
      data: {
        labels: data.serieAcum.map(x => fmtFecha(x.fecha)),
        datasets: [
          { label: 'Ingresos Acum.', data: data.serieAcum.map(x => x.ingresos), borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.08)', fill: true, tension: 0.3, pointRadius: 2 },
          { label: 'Gastos Acum.', data: data.serieAcum.map(x => x.egresos), borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.08)', fill: true, tension: 0.3, pointRadius: 2 },
          { label: 'Utilidad Acum.', data: data.serieAcum.map(x => x.utilidad), borderColor: '#8B5CF6', fill: false, tension: 0.3, pointRadius: 2, borderDash: [4, 3] },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { ticks: { callback: v => '$' + Intl.NumberFormat('es-CO').format(v) } }, x: { ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 10 } } },
      },
    });
    return () => acumC.current?.destroy();
  }, [data?.serieAcum]);

  useEffect(() => {
    if (!data) return;
    const d = data.desgloseEgresosMes || {};
    if (donaC.current) donaC.current.destroy();
    donaC.current = new Chart(donaRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Gastos de Caja', 'Facturas Proveedores', 'Nómina'],
        datasets: [{ data: [d.caja || 0, d.proveedores || 0, d.nomina || 0], backgroundColor: ['#F59E0B', '#EF4444', '#8B5CF6'], borderWidth: 2 }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } } },
    });
    return () => donaC.current?.destroy();
  }, [data?.desgloseEgresosMes]);

  const handleExport = async () => {
    try {
      setDownloading(true);
      const res = await api.get('/export/completo', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Los_Flamencos_${fecha}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export error:', e);
      alert('Error al descargar el archivo de Excel.');
    } finally {
      setDownloading(false);
    }
  };

  if (!data) return (
    <Layout header={<h2 className="font-bold text-xl">📊 Dashboard</h2>}>
      <div className="p-16 text-center text-gray-400 text-lg">Cargando datos...</div>
    </Layout>
  );

  const { resumenDia, resumenMes, desgloseEgresosMes } = data;

  return (
    <Layout header={
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-bold text-xl text-gray-800">📊 Cuadro de Mando — Los Flamencos</h2>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Fecha:</label>
          <input type="date" defaultValue={fecha} onChange={e => setFecha(e.target.value)} className="border rounded p-1 text-sm" />
        </div>
      </div>
    }>
      <div className="py-6 max-w-7xl mx-auto px-4 space-y-6">

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">⚠️ {error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard titulo={`Ingresos ${fmtFecha(fecha)}`} valor={resumenDia.ingresos} colorBorde="border-green-500" colorTexto="text-green-600" />
          <StatCard titulo={`Gastos ${fmtFecha(fecha)}`} valor={resumenDia.egresos} colorBorde="border-red-500" colorTexto="text-red-600" />
          <StatCard titulo={`Caja Neta ${fmtFecha(fecha)}`} valor={resumenDia.neto} colorBorde="border-blue-600" colorTexto={resumenDia.neto >= 0 ? 'text-green-700' : 'text-red-700'} />
          <StatCard titulo="Utilidad Real del Mes" valor={resumenMes.utilidad} colorBorde="border-purple-500" colorTexto={resumenMes.utilidad >= 0 ? 'text-purple-700' : 'text-red-700'} />
        </div>

        {user?.puede_exportar && (
          <div className="bg-white p-4 rounded-xl shadow flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs font-bold text-gray-700">📥 Exportar reporte completo a Excel</p>
              <p className="text-xs text-gray-400">3 hojas: Caja, Facturas y Nómina</p>
            </div>
            <button 
              onClick={handleExport} 
              disabled={downloading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded text-sm transition disabled:opacity-50"
            >
              {downloading ? 'Generando Excel...' : '📊 Descargar Excel'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow lg:col-span-2">
            <h2 className="text-base font-bold text-gray-700 mb-1 border-b pb-2">📈 Flujo — Últimos 7 Días con Movimiento</h2>
            <div className="h-64">
              {data.serie.length > 0 ? <canvas ref={barRef} /> : <p className="text-center text-gray-400 pt-20 text-sm">Sin movimientos registrados aún.</p>}
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-base font-bold text-gray-700 mb-4 border-b pb-2">📆 Resumen del Mes</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Ventas del Mes:</span><span className="font-bold text-green-600">{fmt(resumenMes.ingresos)}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Gastos + Nómina:</span><span className="font-bold text-red-600">{fmt(resumenMes.egresos)}</span></div>
              <div className="flex justify-between pt-1"><span className="font-bold text-gray-700">Utilidad Real:</span><span className={`font-black text-lg ${resumenMes.utilidad >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(resumenMes.utilidad)}</span></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-base font-bold text-gray-700 mb-1 border-b pb-2">📉 Acumulado Histórico — Ingresos, Gastos y Utilidad</h2>
          <div className="h-72">
            {data.serieAcum.length > 0 ? <canvas ref={acumRef} /> : <p className="text-center text-gray-400 pt-28 text-sm">Sin datos históricos aún.</p>}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-base font-bold text-gray-700 mb-4 border-b pb-2">🥧 Desglose de Egresos del Mes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-64"><canvas ref={donaRef} /></div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"><span>Gastos de Caja</span><span className="font-bold">{fmt(desgloseEgresosMes.caja)}</span></div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border-l-4 border-red-400"><span>Facturas Proveedores</span><span className="font-bold">{fmt(desgloseEgresosMes.proveedores)}</span></div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400"><span>Pagos de Nómina</span><span className="font-bold">{fmt(desgloseEgresosMes.nomina)}</span></div>
              <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border-l-4 border-gray-400 font-bold"><span>Total Egresos</span><span>{fmt((desgloseEgresosMes.caja || 0) + (desgloseEgresosMes.proveedores || 0) + (desgloseEgresosMes.nomina || 0))}</span></div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
