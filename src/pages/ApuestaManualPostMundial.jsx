// import React, { useState, useEffect } from 'react';
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
//       <div style={{
//         background: '#faf7f0',
//         minHeight: '100dvh',
//         display: 'flex',
//         flexDirection: 'column',
//       }}>
        
//         {/* HEADER */}
//         <Header />

//         {/* MAIN CONTENT */}
//         <main style={{
//           flex: 1,
//           padding: '32px 20px',
//           maxWidth: '1200px',
//           margin: '0 auto',
//           width: '100%',
//         }}>

//           <ManualBetGate
//             fallback={
//               <div style={{
//                 background: 'rgba(255, 193, 7, 0.1)',
//                 border: '2px dashed rgba(255, 193, 7, 0.4)',
//                 borderRadius: '16px',
//                 padding: '48px 32px',
//                 textAlign: 'center',
//               }}>
//                 <div style={{ fontSize: '64px', marginBottom: '16px' }}>⏳</div>
//                 <h2 style={{
//                   fontFamily: 'Bebas Neue, sans-serif',
//                   fontSize: '24px',
//                   fontWeight: '700',
//                   color: '#c99f16',
//                   margin: '0 0 8px',
//                   letterSpacing: '0.05em',
//                 }}>
//                   Apuestas Manuales No Disponibles
//                 </h2>
//                 <p style={{
//                   fontFamily: 'DM Sans, sans-serif',
//                   fontSize: '14px',
//                   color: '#997600',
//                   margin: '0',
//                 }}>
//                   Esta funcionalidad estará disponible en una fecha especial
//                 </p>
//               </div>
//             }
//           >
//             <div style={{
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '28px',
//             }}>
              
//               {/* RESUMEN ESTADÍSTICAS */}
//               <div>
//                 <h2 style={{
//                   fontFamily: 'Bebas Neue, sans-serif',
//                   fontSize: '18px',
//                   fontWeight: '700',
//                   color: '#0a1226',
//                   margin: '0 0 16px',
//                   letterSpacing: '0.05em',
//                   textTransform: 'uppercase',
//                 }}>
//                   📊 Resumen
//                 </h2>
//                 <BetsSummary bets={bets} />
//               </div>

//               {/* FORMULARIO CREAR APUESTA */}
//               <div>
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
//                   <h2 style={{
//                     fontFamily: 'Bebas Neue, sans-serif',
//                     fontSize: '18px',
//                     fontWeight: '700',
//                     color: '#0a1226',
//                     margin: '0 0 16px',
//                     letterSpacing: '0.05em',
//                     textTransform: 'uppercase',
//                   }}>
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