import{useState,useEffect,useCallback}from'react';import api from'../api/client.js';import Layout from'../components/Layout.jsx';import Paginador from'../components/Paginador.jsx';
import{fmtFecha}from'../utils/fecha.js';
const TABLAS={cash_movements:'Caja',supplier_invoices:'Facturas',suppliers:'Proveedores',payroll_entries:'Nómina',employees:'Empleados',users:'Usuarios',settings:'Parametrizaciones'};
const ACCIONES={CREAR:{label:'Crear',color:'bg-green-100 text-green-800'},ACTUALIZAR:{label:'Actualizar',color:'bg-blue-100 text-blue-800'},ELIMINAR:{label:'Eliminar',color:'bg-red-100 text-red-800'},LOGIN:{label:'Login',color:'bg-gray-100 text-gray-700'}};
export default function Auditoria(){
  const[rows,setRows]=useState([]);const[total,setTotal]=useState(0);const[page,setPage]=useState(1);const[pages,setPages]=useState(1);
  const[tabla,setTabla]=useState('');
  const cargar=useCallback(async(p=1,t='')=>{
    const{data}=await api.get('/auditoria',{params:{page:p,tabla:t}});
    setRows(data.data);setTotal(data.total);setPage(data.page);setPages(data.pages);
  },[]);
  useEffect(()=>{cargar(1,tabla);},[tabla]);
  return(
    <Layout header={<h2 className="font-bold text-xl text-gray-800">🛡️ Auditoría del Sistema (Solo lectura · Inmutable)</h2>}>
      <div className="py-6 max-w-7xl mx-auto px-4">
        <div className="bg-white p-5 rounded-xl shadow">
          <div className="mb-4 flex flex-wrap gap-2 text-xs">
            <button onClick={()=>setTabla('')} className={`px-3 py-1.5 rounded font-bold transition ${!tabla?'bg-blue-900 text-white':'bg-gray-100 hover:bg-gray-200'}`}>Todos</button>
            {Object.entries(TABLAS).map(([k,v])=>(
              <button key={k} onClick={()=>setTabla(k)} className={`px-3 py-1.5 rounded font-bold transition ${tabla===k?'bg-blue-900 text-white':'bg-gray-100 hover:bg-gray-200'}`}>{v}</button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 text-gray-600 font-bold uppercase">
                <tr><th className="p-2">Fecha y Hora</th><th className="p-2">Usuario</th><th className="p-2">Acción</th><th className="p-2">Módulo</th><th className="p-2 text-center">ID</th><th className="p-2">IP</th><th className="p-2">Valores Anteriores</th><th className="p-2">Valores Nuevos</th></tr>
              </thead>
              <tbody>
                {rows.map(l=>{const ac=ACCIONES[l.accion]||{label:l.accion,color:'bg-gray-100 text-gray-700'};return(
                  <tr key={l.id} className="border-b hover:bg-gray-50 align-top">
                    <td className="p-2 whitespace-nowrap font-mono text-gray-700">{fmtFecha(l.created_at,true)}</td>
                    <td className="p-2 font-medium">{l.usuario_name||'Sistema'}</td>
                    <td className="p-2"><span className={`px-2 py-0.5 rounded-full font-bold ${ac.color}`}>{ac.label}</span></td>
                    <td className="p-2">{TABLAS[l.tabla_afectada]||l.tabla_afectada}</td>
                    <td className="p-2 text-center font-mono">{l.registro_id||'—'}</td>
                    <td className="p-2 font-mono text-gray-500">{l.ip_address||'—'}</td>
                    <td className="p-2 max-w-xs">{l.valores_anteriores?<details><summary className="cursor-pointer text-blue-700 font-bold text-xs">Ver datos</summary><pre className="text-2xs bg-gray-50 p-1 rounded mt-1 overflow-auto max-h-24 whitespace-pre-wrap border">{JSON.stringify(l.valores_anteriores,null,2)}</pre></details>:'—'}</td>
                    <td className="p-2 max-w-xs">{l.valores_nuevos?<details><summary className="cursor-pointer text-green-700 font-bold text-xs">Ver datos</summary><pre className="text-2xs bg-gray-50 p-1 rounded mt-1 overflow-auto max-h-24 whitespace-pre-wrap border">{JSON.stringify(l.valores_nuevos,null,2)}</pre></details>:'—'}</td>
                  </tr>
                );})}
                {rows.length===0&&<tr><td colSpan={8} className="p-6 text-center text-gray-400">No hay registros de auditoría.</td></tr>}
              </tbody>
            </table>
          </div>
          <Paginador page={page} pages={pages} total={total} onPrev={()=>{const p=page-1;setPage(p);cargar(p,tabla);}} onNext={()=>{const p=page+1;setPage(p);cargar(p,tabla);}}/>
        </div>
      </div>
    </Layout>
  );
}
