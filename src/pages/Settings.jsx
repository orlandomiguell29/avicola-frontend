import{useState,useEffect}from'react';import api from'../api/client.js';import Layout from'../components/Layout.jsx';import{useAuth}from'../hooks/useAuth.jsx';import{fmt}from'../utils/formato.js';
const ETIQ={tarifa_hora:'Valor por Hora',tarifa_turno:'Valor por Turno',tarifa_dia:'Valor por Día',tarifa_semana:'Valor por Semana',tarifa_quincena:'Valor por Quincena',tarifa_mes:'Valor por Mes'};
export default function Settings(){
  const{showFlash}=useAuth();
  const[form,setForm]=useState({tarifa_hora:0,tarifa_turno:0,tarifa_dia:0,tarifa_semana:0,tarifa_quincena:0,tarifa_mes:0});
  useEffect(()=>{api.get('/settings').then(r=>setForm(r.data)).catch(()=>{});},[]);
  const submit=async e=>{e.preventDefault();
    try{await api.put('/settings',form);showFlash('Tarifas actualizadas');}
    catch(ex){showFlash(ex.response?.data?.error||'Error','error');}
  };
  return(
    <Layout header={<h2 className="font-bold text-xl text-gray-800">⚙️ Parametrizaciones — Tarifas Base de Nómina</h2>}>
      <div className="py-6 max-w-md mx-auto px-4">
        <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow border-2 border-yellow-400 space-y-4">
          <p className="text-xs text-gray-500">Estos valores se usan como tarifa por defecto al liquidar en el módulo de Nómina.</p>
          {Object.entries(ETIQ).map(([c,l])=>(
            <div key={c} className="flex justify-between items-center gap-3">
              <label className="text-sm font-medium text-gray-700 w-36">{l}:</label>
              <div className="flex items-center gap-1 flex-1"><span className="text-gray-500 text-sm">$</span>
                <input type="number" step="any" value={form[c]||0} onChange={e=>setForm({...form,[c]:e.target.value})} className="p-2 border rounded text-sm w-full text-right"/></div>
            </div>
          ))}
          <div className="text-right pt-2"><button type="submit" className="bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold py-2 px-6 rounded transition">💾 Guardar Tarifas</button></div>
        </form>
      </div>
    </Layout>
  );
}
