export const fmt=(n)=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n||0);
export const padC=(n)=>String(n).padStart(7,'0');
