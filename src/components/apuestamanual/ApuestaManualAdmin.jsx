// import React, { useState } from 'react';
// import AppShell from '../dashboard/AppShell.jsx';
// import ManualBetGate from '../components/apuestamanual/ManualBetGate';
// import CreateBetForm from '../components/apuestamanual/CreateBetForm';
// import BetsHistory from '../components/apuestamanual/BetsHistory';
// import BetsSummary from '../components/apuestamanual/BetsSummary';
// import Header from '../components/apuestamanual/Header';

// export default function ApuestaManualAdmin() {
//   const [bets, setBets] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const handleBetCreated = (newBet) => {
//     setBets(prev => [newBet, ...prev]);
//   };

//   const handleRefresh = () => {
//     // Recargar apuestas si es necesario
//   };

//   return (
//     <AppShell>
//       <div className="min-h-screen bg-white">
        
//         {/* HEADER */}
//         <Header />

//         {/* MAIN CONTENT */}
//         <main className="max-w-7xl mx-auto px-6 py-12">

//           <ManualBetGate
//             fallback={
//               <div className="rounded-xl border-2 border-dashed border-yellow-300 bg-yellow-50 p-12 text-center">
//                 <div className="text-6xl mb-4">⏳</div>
//                 <h2 className="m-0 mb-2 font-['Bebas_Neue'] text-2xl font-bold text-yellow-700 uppercase tracking-widest">
//                   Apuestas Manuales No Disponibles
//                 </h2>
//                 <p className="m-0 font-['DM_Sans'] text-sm text-yellow-600">
//                   Esta funcionalidad estará disponible en una fecha especial
//                 </p>
//               </div>
//             }
//           >
//             <div className="space-y-12">
              
//               {/* RESUMEN ESTADÍSTICAS */}
//               <div>
//                 <h2 className="m-0 mb-6 font-['Bebas_Neue'] text-lg font-bold text-slate-900 uppercase tracking-widest">
//                   📊 Resumen
//                 </h2>
//                 <BetsSummary bets={bets} />
//               </div>

//               {/* FORMULARIO CREAR APUESTA */}
//               <div>
//                 <h2 className="m-0 mb-6 font-['Bebas_Neue'] text-lg font-bold text-slate-900 uppercase tracking-widest">
//                   ➕ Crear Apuesta
//                 </h2>
//                 <CreateBetForm 
//                   onBetCreated={handleBetCreated}
//                   equipos={[]}
//                   competiciones={[]}
//                   apiUrl="/api/apuestamanual/crear"
//                 />
//               </div>

//               {/* HISTORIAL DE APUESTAS */}
//               {bets.length > 0 && (
//                 <div>
//                   <h2 className="m-0 mb-6 font-['Bebas_Neue'] text-lg font-bold text-slate-900 uppercase tracking-widest">
//                     📋 Historial
//                   </h2>
//                   <BetsHistory bets={bets} onRefresh={handleRefresh} />
//                 </div>
//               )}
//             </div>
//           </ManualBetGate>

//         </main>
//       </div>
//     </AppShell>
//   );
// }