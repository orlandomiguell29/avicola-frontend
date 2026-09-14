import{createContext,useContext,useState,useEffect,useCallback}from'react';
import api from'../api/client.js';
const Ctx=createContext(null);
export function AuthProvider({children}){
  const[user,setUser]=useState(null);
  const[loading,setLoading]=useState(true);
  const[flash,setFlash]=useState(null);

  const showFlash=(msg,tipo='success')=>{setFlash({msg,tipo});setTimeout(()=>setFlash(null),3500);};

  const cargarUsuario=useCallback(async()=>{
    try{const{data}=await api.get('/auth/me');setUser(data);}
    catch{setUser(null);}finally{setLoading(false);}
  },[]);

  useEffect(()=>{cargarUsuario();},[cargarUsuario]);

  const login=async(email,password)=>{
    const{data}=await api.post('/auth/login',{email,password});
    setUser(data.user);return data.user;
  };

  const logout=async()=>{
    await api.post('/auth/logout');
    setUser(null);window.location.href='/login';
  };

  return<Ctx.Provider value={{user,loading,login,logout,showFlash,flash}}>{children}</Ctx.Provider>;
}
export const useAuth=()=>useContext(Ctx);
