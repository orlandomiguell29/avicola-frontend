import{useState,useEffect,useCallback}from'react';import api from'../api/client.js';
import Layout from'../components/Layout.jsx';import Paginador from'../components/Paginador.jsx';
import{useAuth}from'../hooks/useAuth.jsx';

const EF={nombre:'',nit:'',telefono:'',email:'',contacto:'',direccion:''};
export default function Proveedores(){
  const{user,showFlash}=useAuth();
  const[rows,setRows]=useState([]);const[total,setTotal]=useState(0);const[page,setPage]=useState(1);const[pages,setPages]=useState(1);
  const[busqueda,setBusqueda]=useState('');const[textoBusq,setTextoBusq]=useState('');
  const[form,setForm]=useState(EF);const[edit,setEdit]=useState(null);const[editData,setEditData]=useState({});const[saving,setSaving]=useState(false);

  const cargar=useCallback(async(p=1,b='')=>{
    const{data}=await api.get('/proveedores',{params:{page:p,busqueda:b}});
    setRows(data.data);setTotal(data.total);setPage(data.page);setPages(data.pages);
  },[]);

  useEffect(()=>{cargar(1,busqueda);},[busqueda]);

  const submit=async e=>{e.preventDefault();setSaving(true);
    try{await api.post('/proveedores',form);showFlash('Proveedor creado');setForm(EF);cargar(1,busqueda);}
    catch(ex){showFlash(ex.response?.data?.error||'Error','error');}finally{setSaving(false);}
  };
  const guardar=async id=>{setSaving(true);
    try{await api.put(`/proveedores/${id}`,editData);showFlash('Actualizado');setEdit(null);cargar(page,busqueda);}
    catch(ex){showFlash(ex.response?.data?.error||'Error','error');}finally{setSaving(false);}
  };
  const inactivar=async id=>{if(!confirm('¿Inactivar?'))return;
    try{await api.delete(`/proveedores/${id}`);showFlash('Inactivado');cargar(page,busqueda);}
    catch(ex){showFlash(ex.response?.data?.error||'Error','error');}
  };

  return(
    <Layout header={<h2 className="font-bold text-xl text-gray-800">📇 Catálogo de Proveedores</h2>}>
      <div className="py-6 max-w-5xl mx-auto px-4 space-y-6">
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Registrar nuevo proveedor</h3>
          <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[{l:'Nombre *',c:'nombre',p:'Razón social'},{l:'NIT / CC',c:'nit',p:'900.123.456-7'},{l:'Teléfono',c:'telefono',p:'310 123 4567'},{l:'Correo',c:'email',p:'ventas@proveedor.com',t:'email'},{l:'Contacto',c:'contacto',p:'Persona de contacto'},{l:'Dirección',c:'direccion',p:'Dirección comercial'}].map(({l,c,p,t='text'})=>(
              <div key={c}><label className="block text-xs font-bold text-gray-600 mb-1">{l}</label>
                <input type={t} value={form[c]} onChange={e=>setForm({...form,[c]:e.target.value})} placeholder={p} required={c==='nombre'} className="w-full p-2 border rounded text-sm"/></div>
            ))}
            <div className="col-span-2 md:col-span-3 text-right"><button type="submit" disabled={saving} className="bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold py-2 px-6 rounded transition disabled:opacity-50">+ Crear Proveedor</button></div>
          </form>
        </div>
        <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-3 items-center">
          <span className="text-xs font-bold text-gray-600">🔍 Buscar:</span>
          <input type="text" value={textoBusq} onChange={e=>setTextoBusq(e.target.value)} onKeyDown={e=>e.key==='Enter'&&setBusqueda(textoBusq)} placeholder="Nombre, NIT o correo..." className="border rounded p-2 text-sm flex-1 max-w-sm"/>
          <button onClick={()=>setBusqueda(textoBusq)} className="bg-blue-900 text-white text-xs font-bold py-2 px-4 rounded hover:bg-blue-950 transition">Buscar</button>
          {busqueda&&<button onClick={()=>{setTextoBusq('');setBusqueda('');}} className="bg-gray-200 text-gray-700 text-xs font-bold py-2 px-3 rounded">✕ Limpiar</button>}
          <span className="text-xs text-gray-400">{total} proveedor(es)</span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-600 uppercase font-bold">
              <tr><th className="p-2">Nombre</th><th className="p-2">NIT</th><th className="p-2">Teléfono</th><th className="p-2">Correo</th><th className="p-2">Contacto</th><th className="p-2 text-center">Estado</th><th className="p-2 text-center">Acciones</th></tr>
            </thead>
            <tbody>
              {rows.map(p=>edit===p.id?(
                <tr key={p.id} className="border-b bg-blue-50">
                  <td className="p-1"><input value={editData.nombre||''} onChange={e=>setEditData({...editData,nombre:e.target.value})} className="p-1 border rounded text-xs w-full"/></td>
                  <td className="p-1"><input value={editData.nit||''} onChange={e=>setEditData({...editData,nit:e.target.value})} className="p-1 border rounded text-xs w-full"/></td>
                  <td className="p-1"><input value={editData.telefono||''} onChange={e=>setEditData({...editData,telefono:e.target.value})} className="p-1 border rounded text-xs w-full"/></td>
                  <td className="p-1"><input type="email" value={editData.email||''} onChange={e=>setEditData({...editData,email:e.target.value})} className="p-1 border rounded text-xs w-full"/></td>
                  <td className="p-1"><input value={editData.contacto||''} onChange={e=>setEditData({...editData,contacto:e.target.value})} className="p-1 border rounded text-xs w-full"/></td>
                  <td className="p-1 text-center"><label className="flex items-center justify-center gap-1 text-xs"><input type="checkbox" checked={!!editData.activo} onChange={e=>setEditData({...editData,activo:e.target.checked})}/>Activo</label></td>
                  <td className="p-1 text-center space-x-1">
                    <button onClick={()=>guardar(p.id)} disabled={saving} className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">✓</button>
                    <button onClick={()=>setEdit(null)} className="bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded">✕</button>
                  </td>
                </tr>
              ):(
                <tr key={p.id} className={`border-b hover:bg-gray-50 ${!p.activo?'opacity-50':''}`}>
                  <td className="p-2 font-medium">{p.nombre}</td><td className="p-2">{p.nit||'—'}</td><td className="p-2">{p.telefono||'—'}</td>
                  <td className="p-2">{p.email?<a href={`mailto:${p.email}`} className="text-blue-600 underline">{p.email}</a>:'—'}</td>
                  <td className="p-2">{p.contacto||'—'}</td>
                  <td className="p-2 text-center">{p.activo?<span className="text-green-600 font-bold">Activo</span>:<span className="text-red-600 font-bold">Inactivo</span>}</td>
                  <td className="p-2 text-center space-x-2">
                    {user?.puede_editar&&<button onClick={()=>{setEdit(p.id);setEditData({...p});}} className="text-blue-700 font-bold hover:underline">Editar</button>}
                    {user?.puede_eliminar&&p.activo&&<button onClick={()=>inactivar(p.id)} className="text-red-500 font-bold hover:underline">Inactivar</button>}
                  </td>
                </tr>
              ))}
              {rows.length===0&&<tr><td colSpan={7} className="p-6 text-center text-gray-400">No se encontraron proveedores.</td></tr>}
            </tbody>
          </table>
          <Paginador page={page} pages={pages} total={total} onPrev={()=>{const p=page-1;setPage(p);cargar(p,busqueda);}} onNext={()=>{const p=page+1;setPage(p);cargar(p,busqueda);}}/>
        </div>
      </div>
    </Layout>
  );
}
