// import React, { useState } from 'react';

// export default function BetsHistory({ bets, onRefresh }) {
//   const [expandedBet, setExpandedBet] = useState(null);
//   const [deleting, setDeleting] = useState(null);

//   const handleDeleteBet = async (betId) => {
//     if (!window.confirm('¿Estás seguro de que deseas eliminar esta apuesta?')) return;

//     setDeleting(betId);
//     try {
//       const response = await fetch(`/api/apuestamanual/eliminar/${betId}`, {
//         method: 'DELETE',
//       });

//       if (response.ok) {
//         onRefresh();
//       } else {
//         alert('Error al eliminar apuesta');
//       }
//     } catch (err) {
//       alert('Error: ' + err.message);
//     }
//     setDeleting(null);
//   };

//   if (bets.length === 0) {
//     return null;
//   }

//   return (
//     <div className="space-y-3">
//       <h3 className="m-0 mb-4 font-['Bebas_Neue'] text-base font-bold text-slate-900 uppercase tracking-widest">
//         📋 Historial Completo
//       </h3>

//       {bets.map((bet) => (
//         <div
//           key={bet.id}
//           className="rounded-lg border border-slate-200 bg-white overflow-hidden transition-all hover:shadow-md"
//         >
//           {/* HEADER - CLICKEABLE */}
//           <div
//             onClick={() => setExpandedBet(expandedBet === bet.id ? null : bet.id)}
//             className="cursor-pointer p-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
//             style={{
//               background: expandedBet === bet.id ? '#f8fafc' : 'transparent',
//             }}
//           >
//             <div className="flex items-center gap-4 flex-1">
//               {/* ICONO TIPO */}
//               <div className="text-xl min-w-8 text-center">
//                 {bet.tipo === 'prediccion' && '📊'}
//                 {bet.tipo === 'resultado' && '🎯'}
//                 {bet.tipo === 'otra' && '❓'}
//               </div>

//               {/* INFO */}
//               <div className="flex-1">
//                 <h4 className="m-0 mb-1 font-['DM_Sans'] text-sm font-semibold text-slate-900">
//                   {bet.titulo}
//                 </h4>
//                 <div className="flex gap-3 items-center text-xs text-slate-600">
//                   <span>🎲 {bet.opciones?.length || 0} opciones</span>
//                   <span>•</span>
//                   <span>
//                     📅 {bet.fechaCierre ? new Date(bet.fechaCierre).toLocaleDateString('es-AR') : '-'}
//                   </span>
//                 </div>
//               </div>

//               {/* BADGE ESTADO + CHEVRON */}
//               <div className="flex items-center gap-2">
//                 <span
//                   className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
//                     bet.estado === 'activa'
//                       ? 'bg-green-50 text-green-700 border-green-200'
//                       : 'bg-slate-100 text-slate-600 border-slate-300'
//                   }`}
//                 >
//                   {bet.estado === 'activa' ? '🟢 Activa' : '⚫ Cerrada'}
//                 </span>

//                 <span
//                   className="text-base text-slate-400 transition-transform"
//                   style={{
//                     transform: expandedBet === bet.id ? 'rotate(180deg)' : 'rotate(0deg)',
//                   }}
//                 >
//                   ▼
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* EXPANDIDO */}
//           {expandedBet === bet.id && (
//             <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-4">
              
//               {/* DESCRIPCIÓN */}
//               {bet.descripcion && (
//                 <div className="pb-4 border-b border-slate-200">
//                   <p className="m-0 mb-2 font-['DM_Sans'] text-xs font-bold text-slate-600 uppercase tracking-wider">
//                     Descripción
//                   </p>
//                   <p className="m-0 font-['DM_Sans'] text-sm text-slate-700 leading-relaxed">
//                     {bet.descripcion}
//                   </p>
//                 </div>
//               )}

//               {/* OPCIONES */}
//               <div className="pb-4 border-b border-slate-200">
//                 <p className="m-0 mb-3 font-['DM_Sans'] text-xs font-bold text-slate-600 uppercase tracking-wider">
//                   Opciones
//                 </p>
//                 <div className="space-y-2">
//                   {bet.opciones?.map((opc, idx) => (
//                     <div
//                       key={idx}
//                       className="flex justify-between items-center p-3 bg-white rounded border border-slate-200"
//                     >
//                       <span className="font-['DM_Sans'] text-sm text-slate-900">
//                         {opc.nombre}
//                       </span>
//                       <span className="font-['Bebas_Neue'] text-base font-bold text-blue-600">
//                         {Number(opc.cuota).toFixed(2)}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* ACCIONES */}
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => {
//                     alert('Edición en desarrollo');
//                   }}
//                   className="flex-1 px-4 py-2 rounded text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer"
//                 >
//                   ✏️ Editar
//                 </button>

//                 <button
//                   onClick={() => handleDeleteBet(bet.id)}
//                   disabled={deleting === bet.id}
//                   className="flex-1 px-4 py-2 rounded text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                 >
//                   {deleting === bet.id ? '⏳ Eliminando...' : '🗑️ Eliminar'}
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }