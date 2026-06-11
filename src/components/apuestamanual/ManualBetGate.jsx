// // import React, { useState, useEffect } from 'react';

// // /**
// //  * ManualBetGate - Control de habilitación para apuestas manuales
// //  * 
// //  * Este componente:
// //  * - Verifica si la apuesta manual está habilitada
// //  * - Puede ser hardcoded (true/false) ahora
// //  * - Será reemplazado por un timer después
// //  * - Envuelve cualquier contenido que solo debe mostrarse si está habilitado
// //  */

// // export default function ManualBetGate({ children, fallback = null }) {
// //   const [isEnabled, setIsEnabled] = useState(false);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     // 🔥 TODO: Reemplazar esto con la lógica del timer después
// //     // Por ahora: HARDCODED A TRUE
// //     const checkManualBetStatus = async () => {
// //       try {
// //         // Aquí irá la lógica del timer en el futuro
// //         // Por ahora solo devuelve true
// //         const enabled = true; // ← CAMBIAR AQUÍ DESPUÉS
        
// //         setIsEnabled(enabled);
// //       } catch (error) {
// //         console.error('Error checking manual bet status:', error);
// //         setIsEnabled(false);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     checkManualBetStatus();
// //   }, []);

// //   if (loading) {
// //     return <div className="p-4 text-center text-gray-500">Cargando...</div>;
// //   }

// //   if (!isEnabled) {
// //     return fallback || (
// //       <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-center">
// //         <p className="text-yellow-800 font-medium">
// //           ⏳ Las apuestas manuales no están habilitadas en este momento
// //         </p>
// //       </div>
// //     );
// //   }

// //   // Si está habilitado, mostramos el contenido
// //   return children;
// // }