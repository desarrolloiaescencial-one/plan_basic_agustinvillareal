// import React from 'react';

// export default function BetsSummary({ bets }) {
//   const totalBets = bets.length;
//   const activeBets = bets.filter(b => b.estado === 'activa').length;
//   const closedBets = bets.filter(b => b.estado === 'cerrada').length;
//   const totalOpciones = bets.reduce((sum, b) => sum + (b.opciones?.length || 0), 0);

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
//       {/* TOTAL APUESTAS */}
//       <StatCard
//         icon="🎰"
//         label="Total Apuestas"
//         value={totalBets}
//         color="text-blue-600"
//         bgColor="bg-blue-50"
//         borderColor="border-blue-200"
//       />

//       {/* ACTIVAS */}
//       <StatCard
//         icon="✅"
//         label="Activas"
//         value={activeBets}
//         color="text-green-600"
//         bgColor="bg-green-50"
//         borderColor="border-green-200"
//       />

//       {/* CERRADAS */}
//       <StatCard
//         icon="🔒"
//         label="Cerradas"
//         value={closedBets}
//         color="text-red-600"
//         bgColor="bg-red-50"
//         borderColor="border-red-200"
//       />

//       {/* TOTAL OPCIONES */}
//       <StatCard
//         icon="🎲"
//         label="Total Opciones"
//         value={totalOpciones}
//         color="text-cyan-600"
//         bgColor="bg-cyan-50"
//         borderColor="border-cyan-200"
//       />
//     </div>
//   );
// }

// function StatCard({ icon, label, value, color, bgColor, borderColor }) {
//   return (
//     <div className={`rounded-lg border ${borderColor} ${bgColor} p-5 flex flex-col gap-3`}>
//       <div className="flex justify-between items-start">
//         <span className="font-['DM_Sans'] text-xs font-bold text-slate-600 uppercase tracking-wider">
//           {label}
//         </span>
//         <span className="text-2xl">
//           {icon}
//         </span>
//       </div>
//       <span className={`font-['Bebas_Neue'] text-3xl font-bold ${color} leading-none`}>
//         {value}
//       </span>
//     </div>
//   );
// }