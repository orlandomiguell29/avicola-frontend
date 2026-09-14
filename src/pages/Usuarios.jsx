import{useState,useEffect}from'react';import api from'../api/client.js';import Layout from'../components/Layout.jsx';import{useAuth}from'../hooks/useAuth.jsx';
export default function Usuarios(){
  const{showFlash}=useAuth();
  const[rows,setRows]=useState([]);
  const[form,setForm]=useState({name:'',email:'',password:'',role:'USUARIO',can_export:false,can_edit:false,can_delete:false});
  const[edit,setEdit]=useState(null);const[editData,setEditData]=useState({});const[saving,setSaving]=useState(false);
  const cargar=()=>api.get('/usuarios').then(r=>setRows(r.data)).catch(()=>{});
  useEffect(()=>{cargar();},[]);
  const submit=async e=>{e.preventDefault();setSaving(true);
    try{await api.post('/usuarios',form);showFlash('Usuario creado');setForm({name:'',email:'',password:'',role:'USUARIO',can_export:false,can_edit:false,can_delete:false});cargar();}
    catch(ex){showFlash(ex.response?.data?.error||'Error','error');}finally{setSaving(false);}
  };
  const guardar=async id=>{setSaving(true);
    try{await api.put(`/usuarios/${id}`,editData);showFlash('Actualizado');setEdit(null);cargar();}
    catch(ex){showFlash(ex.response?.data?.error||'Error','error');}finally{setSaving(false);}
  };
  const darBaja=async id=>{if(!confirm('¿Dar de baja?'))return;
    try{await api.delete(`/usuarios/${id}`);showFlash('Dado de baja');cargar();}
    catch(ex){showFlash(ex.response?.data?.error||'Error','error');}
  };
  return(
    <Layout header={<h2 className="font-bold text-xl text-gray-800">👤 Gestión de Usuarios y Permisos</h2>}>
      <div className="py-6 max-w-6xl mx-auto px-4 space-y-6">
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Crear nuevo usuario</h3>
          <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><label className="block text-xs font-bold text-gray-600 mb-1">Nombre</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required placeholder="Nombre completo" className="w-full p-2 border rounded text-sm"/></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1">Correo</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required placeholder="correo@dominio.com" className="w-full p-2 border rounded text-sm"/></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1">Contraseña (mín. 8)</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required className="w-full p-2 border rounded text-sm"/></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1">Rol</label>
              <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="w-full p-2 border rounded text-sm">
                <option value="USUARIO">Usuario</option><option value="ADMIN">Administrador</option>
              </select></div>
            <div className="col-span-2 md:col-span-3 flex gap-6 items-center pt-1">
              <span className="text-xs font-bold text-gray-600">Permisos:</span>
              {[['can_export','Exportar'],['can_edit','Editar'],['can_delete','Eliminar']].map(([c,l])=>(
                <label key={c} className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" checked={!!form[c]} onChange={e=>setForm({...form,[c]:e.target.checked})}/>{l}</label>
              ))}
            </div>
            <div className="text-right"><button type="submit" disabled={saving} className="w-full bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold py-2 px-4 rounded disabled:opacity-50">+ Crear</button></div>
          </form>
        </div>
        <div className="bg-white p-5 rounded-xl shadow overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-600 uppercase font-bold">
              <tr><th className="p-2">Nombre</th><th className="p-2">Correo</th><th className="p-2">Rol</th><th className="p-2 text-center">Exportar</th><th className="p-2 text-center">Editar</th><th className="p-2 text-center">Eliminar</th><th className="p-2 text-center">Estado</th><th className="p-2 text-center">Acciones</th></tr>
            </thead>
            <tbody>
              {rows.map(u=>edit===u.id?(
                <tr key={u.id} className="border-b bg-blue-50">
                  <td className="p-1"><input value={editData.name||''} onChange={e=>setEditData({...editData,name:e.target.value})} className="p-1 border rounded text-xs w-full"/></td>
                  <td className="p-1"><input type="email" value={editData.email||''} onChange={e=>setEditData({...editData,email:e.target.value})} className="p-1 border rounded text-xs w-full"/></td>
                  <td className="p-1"><select value={editData.role||'USUARIO'} onChange={e=>setEditData({...editData,role:e.target.value})} className="p-1 border rounded text-xs"><option value="USUARIO">Usuario</option><option value="ADMIN">Admin</option></select></td>
                  {['can_export','can_edit','can_delete'].map(c=><td key={c} className="p-1 text-center"><input type="checkbox" checked={!!editData[c]} onChange={e=>setEditData({...editData,[c]:e.target.checked})}/></td>)}
                  <td className="p-1 text-center"><input type="checkbox" checked={!!editData.active} onChange={e=>setEditData({...editData,active:e.target.checked})}/></td>
                  <td className="p-1 text-center space-y-1">
                    <input type="password" value={editData.password||''} onChange={e=>setEditData({...editData,password:e.target.value})} placeholder="Nueva clave" className="p-1 border rounded text-2xs w-28 block mx-auto mb-1"/>
                    <div className="space-x-1">
                      <button onClick={()=>guardar(u.id)} disabled={saving} className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">✓</button>
                      <button onClick={()=>setEdit(null)} className="bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded">✕</button>
                    </div>
                  </td>
                </tr>
              ):(
                <tr key={u.id} className={`border-b hover:bg-gray-50 ${!u.active?'opacity-50':''}`}>
                  <td className="p-2 font-medium">{u.name}</td><td className="p-2">{u.email}</td>
                  <td className="p-2"><span className={`font-bold ${u.role==='ADMIN'?'text-blue-700':'text-gray-700'}`}>{u.role}</span></td>
                  {['can_export','can_edit','can_delete'].map(c=><td key={c} className="p-2 text-center">{u.role==='ADMIN'||u[c]?'✅':'—'}</td>)}
                  <td className="p-2 text-center">{u.active?<span className="text-green-600 font-bold">Activo</span>:<span className="text-red-600 font-bold">Inactivo</span>}</td>
                  <td className="p-2 text-center space-x-2">
                    <button onClick={()=>{setEdit(u.id);setEditData({...u,password:'',active:!!u.active});}} className="text-blue-700 font-bold hover:underline">Editar</button>
                    <button onClick={()=>darBaja(u.id)} className="text-red-500 font-bold hover:underline">Dar de baja</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
