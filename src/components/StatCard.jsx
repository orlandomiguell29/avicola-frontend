import{fmt}from'../utils/formato.js';
export default function StatCard({titulo,valor,colorBorde='border-blue-600',colorTexto='text-blue-700'}){
  return(
    <div className={`bg-white p-4 rounded-xl shadow border-l-4 ${colorBorde}`}>
      <p className="text-xs text-gray-500 font-bold uppercase">{titulo}</p>
      <p className={`text-2xl font-bold ${colorTexto}`}>{fmt(valor)}</p>
    </div>
  );
}
