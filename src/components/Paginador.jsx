export default function Paginador({page,pages,total,onPrev,onNext}){
  if(pages<=1)return null;
  return(
    <div className="flex justify-center items-center gap-2 mt-4 text-xs">
      <button onClick={onPrev} disabled={page<=1} className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40 font-bold">← Anterior</button>
      <span className="text-gray-600">Página {page} de {pages} ({total} registros)</span>
      <button onClick={onNext} disabled={page>=pages} className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40 font-bold">Siguiente →</button>
    </div>
  );
}
