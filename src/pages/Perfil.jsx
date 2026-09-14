import{useState}from'react';import api from'../api/client.js';import Layout from'../components/Layout.jsx';import{useAuth}from'../hooks/useAuth.jsx';
export default function Perfil(){
  const{user,showFlash}=useAuth();
  const[f,setF]=useState({password_actual:'',password_nuevo:'',confirmar:''});
  const[err,setErr]=useState('');
  const submit=async e=>{e.preventDefault();setErr('');
    if(f.password_nuevo!==f.confirmar)return setErr('Las contraseñas no coinciden');
    try{await api.put('/auth/password',f);showFlash('Contraseña actualizada');setF({password_actual:'',password_nuevo:'',confirmar:''});}
    catch(ex){setErr(ex.response?.data?.error||'Error');}
  };
  return(
    <Layout header={<h2 className="font-bold text-xl text-gray-800">👤 Mi Perfil</h2>}>
      <div className="py-6 max-w-md mx-auto px-4">
        <div className="bg-white p-5 rounded-xl shadow mb-4">
          <p className="text-sm"><span className="font-bold">Nombre:</span> {user?.name}</p>
          <p className="text-sm mt-1"><span className="font-bold">Correo:</span> {user?.email}</p>
          <p className="text-sm mt-1"><span className="font-bold">Rol:</span> {user?.role}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Cambiar Contraseña</h3>
          {err&&<p className="text-xs text-red-600 mb-3">{err}</p>}
          <form onSubmit={submit} className="space-y-3">
            {['password_actual','password_nuevo','confirmar'].map(k=>(
              <div key={k}><label className="block text-xs font-bold text-gray-600 mb-1">{k==='password_actual'?'Contraseña Actual':k==='password_nuevo'?'Nueva Contraseña':'Confirmar Nueva'}</label>
                <input type="password" value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})} required className="w-full p-2 border rounded text-sm"/></div>
            ))}
            <button type="submit" className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-2 rounded text-xs transition">Actualizar Contraseña</button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
