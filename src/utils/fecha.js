export function fmtFecha(valor,conHora=false){
  if(!valor)return'—';
  const s=String(valor);
  const m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(!m)return s;
  const[,y,mo,d]=m;
  if(!conHora)return`${d}/${mo}/${y}`;
  const dt=new Date(s);
  if(isNaN(dt))return`${d}/${mo}/${y}`;
  const ops={timeZone:'America/Bogota',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false};
  const p=new Intl.DateTimeFormat('es-CO',ops).formatToParts(dt);
  const g=t=>p.find(x=>x.type===t)?.value||'';
  return`${g('day')}/${g('month')}/${g('year')} ${g('hour')}:${g('minute')}`;
}
export function soloFecha(valor){
  if(!valor)return'';
  return String(valor).substring(0,10);
}
export function hoy(){return new Date().toISOString().split('T')[0];}
