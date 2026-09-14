export default function FiltroFecha({desde,hasta,onDesde,onHasta,onBuscar,onLimpiar,label='🔍 Filtrar por fechas:'}){
  return(
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-bold text-gray-600">{label}</span>
      <div className="flex items-center gap-1"><label className="text-xs text-gray-500">Desde:</label><input type="date" value={desde} onChange={e=>onDesde(e.target.value)} className="border rounded p-1 text-sm"/></div>
      <div className="flex items-center gap-1"><label className="text-xs text-gray-500">Hasta:</label><input type="date" value={hasta} onChange={e=>onHasta(e.target.value)} className="border rounded p-1 text-sm"/></div>
      <button onClick={onBuscar} className="bg-blue-900 text-white text-xs font-bold py-1.5 px-3 rounded hover:bg-blue-950 transition">Buscar</button>
      {onLimpiar&&(desde||hasta)&&<button onClick={onLimpiar} className="bg-gray-200 text-gray-700 text-xs font-bold py-1.5 px-3 rounded hover:bg-gray-300 transition">✕ Ver todos</button>}
    </div>
  );
}
