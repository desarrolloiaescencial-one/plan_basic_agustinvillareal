// import { useState, useEffect, useMemo } from 'react'
// import sheetsApi from '../../services/sheetsApi.js'
// import { useToast } from '../../hooks/useToast.jsx'

// const INITIAL = { 
//   titulo: '', 
//   competicion: '', 
//   competicion_logo: '',
//   matchups: [{ equipo1_id: '', equipo1_nombre: '', equipo1_logo: '', equipo2_id: '', equipo2_nombre: '', equipo2_logo: '' }],
//   premio: '', 
//   fecha_cierre: '' 
// }

// const ESCUDO_GRIS = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23c0c0c0" rx="10"/%3E%3Ctext x="50" y="50" font-size="40" fill="%23808080" text-anchor="middle" dominant-baseline="middle" font-family="Arial"%3E%3F%3C/text%3E%3C/svg%3E'

// function Field({ label, error, ...props }) {
//   return (
//     <div className="flex flex-col gap-1.5">
//       <label className="font-body font-bold text-xs uppercase tracking-widest"
//         style={{ color: error ? '#e03252' : '#5f6e8a' }}>
//         {label}
//       </label>
//       <input
//         {...props}
//         className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all"
//         style={{ 
//           background: '#fff', 
//           border: `1.5px solid ${error ? '#e03252' : '#f0eadb'}`, 
//           color: '#0a1226' 
//         }}
//         onFocus={e => {
//           e.target.style.borderColor = error ? '#e03252' : '#ebc32b'
//           e.target.style.boxShadow = error 
//             ? '0 0 0 3px rgba(224,50,82,.08)' 
//             : '0 0 0 3px rgba(235,195,43,.08)'
//         }}
//         onBlur={e => {
//           e.target.style.borderColor = error ? '#e03252' : '#f0eadb'
//           e.target.style.boxShadow = 'none'
//         }}
//       />
//       {error && (
//         <span className="font-body text-xs" style={{ color: '#e03252' }}>
//           {error}
//         </span>
//       )}
//     </div>
//   )
// }

// function FilterChip({ active, onClick, children, disabled }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       disabled={disabled}
//       className="px-3 py-1.5 rounded-lg font-body font-semibold text-xs transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
//       style={{
//         background: active ? '#0a1226' : '#fff',
//         border: `1.5px solid ${active ? '#0a1226' : '#f0eadb'}`,
//         color: active ? '#ebc32b' : '#5f6e8a',
//       }}
//       onMouseEnter={e => { 
//         if (!active && !disabled) { 
//           e.currentTarget.style.borderColor = '#ebc32b'
//           e.currentTarget.style.color = '#c99f16'
//         } 
//       }}
//       onMouseLeave={e => { 
//         if (!active && !disabled) { 
//           e.currentTarget.style.borderColor = '#f0eadb'
//           e.currentTarget.style.color = '#5f6e8a'
//         } 
//       }}
//     >
//       {children}
//     </button>
//   )
// }

// function SelectorEquipos({ label, equipos, selectedId, onSelect, onOtro, onOtroCancelar, onOtroNombre, otroNombre, onOtroConfirm, showOtroMode }) {
//   const [filtroLiga, setFiltroLiga] = useState('')
//   const [busqueda, setBusqueda] = useState('')

//   const ligasDisponibles = useMemo(() => {
//     const set = new Set(equipos.map(e => e.Liga || e.liga).filter(Boolean))
//     return [...set].sort()
//   }, [equipos])

//   const equiposFiltrados = useMemo(() => {
//     const q = busqueda.trim().toLowerCase()
//     return equipos.filter(e => {
//       if (filtroLiga && (e.Liga || e.liga) !== filtroLiga) return false
//       if (q && !`${e.Nombre || e.nombre}`.toLowerCase().includes(q)) return false
//       return true
//     })
//   }, [equipos, filtroLiga, busqueda])

//   if (showOtroMode) {
//     return (
//       <div style={{
//         padding: '16px',
//         background: '#fff',
//         border: '1.5px solid #f0eadb',
//         borderRadius: '12px',
//       }}>
//         <p className="font-body font-bold text-xs uppercase tracking-widest mb-3" style={{ color: '#5f6e8a' }}>
//           {label}
//         </p>
//         <input
//           type="text"
//           placeholder="Nombre del equipo"
//           value={otroNombre}
//           onChange={(e) => onOtroNombre(e.target.value)}
//           autoFocus
//           style={{
//             width: '100%',
//             padding: '10px 12px',
//             borderRadius: '8px',
//             border: '1.5px solid #ebc32b',
//             background: '#fff',
//             fontFamily: 'DM Sans, sans-serif',
//             fontSize: '12px',
//             color: '#0a1226',
//             outline: 'none',
//             marginBottom: '8px',
//           }}
//         />
//         <div style={{ display: 'flex', gap: '8px' }}>
//           <button
//             type="button"
//             onClick={onOtroConfirm}
//             style={{
//               flex: 1,
//               padding: '8px',
//               borderRadius: '6px',
//               background: '#ebc32b',
//               border: 'none',
//               color: '#0a1226',
//               fontFamily: 'DM Sans, sans-serif',
//               fontSize: '11px',
//               fontWeight: '600',
//               cursor: 'pointer',
//               textTransform: 'uppercase',
//             }}
//           >
//             ✓ Usar
//           </button>
//           <button
//             type="button"
//             onClick={onOtroCancelar}
//             style={{
//               flex: 1,
//               padding: '8px',
//               borderRadius: '6px',
//               background: '#f0eadb',
//               border: 'none',
//               color: '#5f6e8a',
//               fontFamily: 'DM Sans, sans-serif',
//               fontSize: '11px',
//               cursor: 'pointer',
//               textTransform: 'uppercase',
//             }}
//           >
//             ✕ Cancelar
//           </button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="flex flex-col gap-4">
//       <span className="font-body font-bold text-xs uppercase tracking-widest" style={{ color: '#5f6e8a' }}>
//         {label}
//       </span>

//       {/* + OTRO EQUIPO - ARRIBA AL INICIO */}
//       <button
//         type="button"
//         onClick={onOtro}
//         style={{
//           width: '100%',
//           padding: '10px',
//           borderRadius: '8px',
//           background: '#f0eadb',
//           border: '1px solid #e8dfd0',
//           color: '#5f6e8a',
//           fontFamily: 'DM Sans, sans-serif',
//           fontSize: '12px',
//           fontWeight: '600',
//           cursor: 'pointer',
//           transition: 'all 0.2s ease',
//           textTransform: 'uppercase',
//           letterSpacing: '0.05em',
//         }}
//         onMouseEnter={(e) => {
//           e.target.style.background = '#ebc32b'
//           e.target.style.color = '#0a1226'
//         }}
//         onMouseLeave={(e) => {
//           e.target.style.background = '#f0eadb'
//           e.target.style.color = '#5f6e8a'
//         }}
//       >
//         + Otro equipo
//       </button>

//       {/* Filtros por liga - SIN "TODAS" */}
//       {ligasDisponibles.length > 0 && (
//         <div className="flex flex-wrap gap-2">
//           {ligasDisponibles.map(liga => (
//             <FilterChip key={liga} active={filtroLiga === liga} onClick={() => setFiltroLiga(liga)}>
//               {liga}
//             </FilterChip>
//           ))}
//         </div>
//       )}

//       {/* Búsqueda */}
//       <input
//         type="text"
//         value={busqueda}
//         onChange={e => setBusqueda(e.target.value)}
//         placeholder="Buscar equipo..."
//         className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all"
//         style={{ background: '#fff', border: '1.5px solid #f0eadb', color: '#0a1226' }}
//         onFocus={e => { 
//           e.target.style.borderColor = '#ebc32b'
//           e.target.style.boxShadow = '0 0 0 3px rgba(235,195,43,.08)' 
//         }}
//         onBlur={e => { 
//           e.target.style.borderColor = '#f0eadb'
//           e.target.style.boxShadow = 'none' 
//         }}
//       />

//       {/* Lista de equipos */}
//       <div style={{
//         border: '1.5px solid #f0eadb',
//         borderRadius: '12px',
//         overflow: 'hidden',
//         maxHeight: '400px',
//         overflowY: 'auto',
//       }}>
//         {equiposFiltrados.map(eq => {
//           const checked = selectedId === (eq.IdEquipo || eq.id || eq.Codigo)
//           const nombre = eq.Nombre || eq.nombre || ''
//           const logo = eq.Logo_URL || eq.logo || ESCUDO_GRIS
          
//           return (
//             <label
//               key={eq.IdEquipo || eq.id || eq.Codigo}
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '12px',
//                 padding: '12px 16px',
//                 borderBottom: '1px solid #f5f5f5',
//                 background: checked ? 'rgba(235,195,43,0.08)' : '#fff',
//                 cursor: 'pointer',
//                 transition: 'all 0.2s ease',
//               }}
//               onMouseEnter={e => {
//                 if (!checked) e.currentTarget.style.background = 'rgba(235,195,43,0.04)'
//               }}
//               onMouseLeave={e => {
//                 if (!checked) e.currentTarget.style.background = '#fff'
//               }}
//             >
//               <input
//                 type="checkbox"
//                 checked={checked}
//                 onChange={() => onSelect(eq.IdEquipo || eq.id || eq.Codigo, nombre, logo)}
//                 style={{ cursor: 'pointer' }}
//               />
              
//               <img 
//                 src={logo} 
//                 alt={nombre}
//                 style={{
//                   width: '32px',
//                   height: '32px',
//                   objectFit: 'contain',
//                   borderRadius: '4px',
//                 }}
//                 onError={(e) => e.target.src = ESCUDO_GRIS}
//               />
              
//               <span className="font-body text-sm" style={{ color: '#0a1226', flex: 1 }}>
//                 {nombre}
//               </span>
              
//               {eq.Liga && (
//                 <span className="font-body text-xs" style={{ color: '#a8b2c4' }}>
//                   {eq.Liga}
//                 </span>
//               )}
//             </label>
//           )
//         })}
//       </div>
//     </div>
//   )
// }

// export default function CreateBetForm({ onSubmit }) {
//   const { toast } = useToast()
//   const [form, setForm] = useState(INITIAL)
//   const [competiciones, setCompeticiones] = useState([])
//   const [equipos, setEquipos] = useState([])
//   const [loadingData, setLoadingData] = useState(true)
//   const [loadingSubmit, setLoadingSubmit] = useState(false)
//   const [errors, setErrors] = useState({})
//   const [mostrarEquipo1, setMostrarEquipo1] = useState(false)
//   const [mostrarEquipo2, setMostrarEquipo2] = useState(false)
//   const [modoOtroEquipo1, setModoOtroEquipo1] = useState(false)
//   const [modoOtroEquipo2, setModoOtroEquipo2] = useState(false)
//   const [otroEquipo1Nombre, setOtroEquipo1Nombre] = useState('')
//   const [otroEquipo2Nombre, setOtroEquipo2Nombre] = useState('')

//   // ✅ CAMBIO 1: useEffect - Cargar equipos que incluye competiciones
//   useEffect(() => {
//     async function loadData() {
//       try {
//         const response = await sheetsApi.equipos.listar()
//         const todosEquipos = response.equipos || response || []
        
//         // Separar competiciones (tipo="competicion") de equipos (tipo="equipo")
//         const soloCompeticiones = todosEquipos.filter(e => e.tipo === "competicion")
//         const soloEquipos = todosEquipos.filter(e => e.tipo === "equipo")
        
//         setCompeticiones(soloCompeticiones)
//         setEquipos(soloEquipos)
//       } catch (err) {
//         toast.error('Error cargando datos: ' + err.message)
//       } finally {
//         setLoadingData(false)
//       }
//     }
//     loadData()
//   }, [])

//   const handleEquipoSelect = (matchupIdx, equipoNum, equipoId, nombre, logo) => {
//     const newMatchups = [...form.matchups]
//     if (equipoNum === 1) {
//       newMatchups[matchupIdx].equipo1_id = equipoId
//       newMatchups[matchupIdx].equipo1_nombre = nombre
//       newMatchups[matchupIdx].equipo1_logo = logo
//       setMostrarEquipo1(false)
//       setModoOtroEquipo1(false)
//     } else {
//       newMatchups[matchupIdx].equipo2_id = equipoId
//       newMatchups[matchupIdx].equipo2_nombre = nombre
//       newMatchups[matchupIdx].equipo2_logo = logo
//       setMostrarEquipo2(false)
//       setModoOtroEquipo2(false)
//     }
//     setForm(prev => ({ ...prev, matchups: newMatchups }))
//   }

//   const handleEquipoManual = (matchupIdx, equipoNum, nombre) => {
//     if (!nombre.trim()) return
    
//     const newMatchups = [...form.matchups]
//     if (equipoNum === 1) {
//       newMatchups[matchupIdx].equipo1_id = `manual_${nombre}`
//       newMatchups[matchupIdx].equipo1_nombre = nombre
//       newMatchups[matchupIdx].equipo1_logo = ESCUDO_GRIS
//       setMostrarEquipo1(false)
//       setModoOtroEquipo1(false)
//       setOtroEquipo1Nombre('')
//     } else {
//       newMatchups[matchupIdx].equipo2_id = `manual_${nombre}`
//       newMatchups[matchupIdx].equipo2_nombre = nombre
//       newMatchups[matchupIdx].equipo2_logo = ESCUDO_GRIS
//       setMostrarEquipo2(false)
//       setModoOtroEquipo2(false)
//       setOtroEquipo2Nombre('')
//     }
//     setForm(prev => ({ ...prev, matchups: newMatchups }))
//   }

//   const agregarMatchup = () => {
//     if (form.matchups.length < 3) {
//       setForm(prev => ({
//         ...prev,
//         matchups: [...prev.matchups, { equipo1_id: '', equipo1_nombre: '', equipo1_logo: '', equipo2_id: '', equipo2_nombre: '', equipo2_logo: '' }],
//       }))
//     }
//   }

//   const eliminarMatchup = (idx) => {
//     setForm(prev => ({
//       ...prev,
//       matchups: prev.matchups.filter((_, i) => i !== idx),
//     }))
//   }

//   const validarFormulario = () => {
//     const newErrors = {}

//     if (!form.titulo.trim()) newErrors.titulo = 'Título requerido'
//     if (!form.competicion) newErrors.competicion = 'Competición requerida'
//     if (!form.premio.trim()) newErrors.premio = 'Premio requerido'
//     if (!form.fecha_cierre) newErrors.fecha_cierre = 'Fecha de cierre requerida'

//     const ahora = new Date()
//     const fechaCierre = new Date(form.fecha_cierre)
//     if (fechaCierre <= ahora) {
//       newErrors.fecha_cierre = 'La fecha debe ser futura'
//     }

//     if (form.matchups.length === 0) {
//       newErrors.matchups = 'Necesitas al menos 1 matchup'
//     }
//     for (let i = 0; i < form.matchups.length; i++) {
//       const m = form.matchups[i]
//       if (!m.equipo1_nombre || !m.equipo2_nombre) {
//         newErrors.matchups = `Matchup ${i + 1}: Selecciona ambos equipos`
//         break
//       }
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   // ✅ CAMBIO 2: handleSubmit - Construir matchups_json y enviar a PRODE
// // ═══════════════════════════════════════════════════════════════════════════
// // FUNCIÓN handleSubmit COMPLETA - Copiar y pegar en CreateBetForm.jsx
// // Reemplaza la función existente (aprox. línea 306 del archivo original)
// // ═══════════════════════════════════════════════════════════════════════════

// /**
//  * ═══════════════════════════════════════════════════════════════════════════
//  * handleSubmit CORREGIDO Y FINAL
//  * 
//  * El backend (Google Apps Script) se encarga de:
//  * 1. Recibir matchups_json SIN partido_id
//  * 2. Crear los partidos ficticios automáticamente
//  * 3. Generar los IDs como: MATCH_manual_APU_xxxxx_0, MATCH_manual_APU_xxxxx_1, etc.
//  * 4. Guardar en partidos_ids: "MATCH_manual_APU_xxxxx_0,MATCH_manual_APU_xxxxx_1,..."
//  * 
//  * El frontend SOLO envía los matchups sin partido_id. El backend maneja todo lo demás.
//  * ═══════════════════════════════════════════════════════════════════════════
//  */

// /**
//  * ═══════════════════════════════════════════════════════════════════════════
//  * handleSubmit FINAL - Enviar partidos_ids como string vacío
//  * ═══════════════════════════════════════════════════════════════════════════
//  */

// /**
//  * ═══════════════════════════════════════════════════════════════════════════
//  * handleSubmit VERDADERAMENTE FINAL - Sin partidos_ids para tipo='libre'
//  * ═══════════════════════════════════════════════════════════════════════════
//  */

// const handleSubmit = async (e) => {
//   e.preventDefault()
//   if (!validarFormulario()) return
//   setLoadingSubmit(true)

//   // ─── PASO 1: Armar matchups_json ────────────────────────────────────────
//   const matchups = {
//     matchups: form.matchups.map((m, idx) => ({
//       matchup_id: idx,
//       equipo1: { 
//         id: m.equipo1_id, 
//         nombre: m.equipo1_nombre, 
//         logo: m.equipo1_logo, 
//         tipo: "equipo" 
//       },
//       equipo2: { 
//         id: m.equipo2_id, 
//         nombre: m.equipo2_nombre, 
//         logo: m.equipo2_logo, 
//         tipo: "equipo" 
//       },
//       resultado: null
//     }))
//   };

//   // ─── PASO 2: Armar payload para enviar al backend ────────────────────
// const payload = {
//   action: 'apuestas.crear',
//   session_token: localStorage.getItem('prode_session_token'),
//   tipo: 'libre',
//   titulo: form.titulo,
//   descripcion: '',
//   premio: form.premio,
//   fecha_cierre: form.fecha_cierre,
//   matchups_json: JSON.stringify(matchups),
//   // partidos_ids: 'MATCH_manual_APU_temp_0,MATCH_manual_APU_temp_1',  // ✅ Enviar IDs temporales
//   puntos_exacto: 5,
//   puntos_diferencia: 3,
//   puntos_resultado: 1,
//   puntos_clasificado: 1,
//   areas_ids: '',
//   estado: 'abierta'
// };

//   // ─── DEBUG: Log del payload ───────────────────────────────────────────
//   console.log('📤 CreateBetForm - Enviando apuesta libre:', {
//     tipo: payload.tipo,
//     titulo: payload.titulo,
//     matchups_count: matchups.matchups.length,
//     fecha_cierre: payload.fecha_cierre,
//     tiene_matchups_json: !!payload.matchups_json
//   });

//   try {
//     // ─── PASO 3: Enviar al backend (Apps Script) ────────────────────────
//     const response = await fetch(import.meta.env.VITE_GAS_URL, {
//       method: 'POST',
//       headers: { 'Content-Type': 'text/plain' },
//       body: JSON.stringify(payload)
//     });
    
//     const data = await response.json();
    
//     // ─── PASO 4: Procesar respuesta ───────────────────────────────────────
//     if (!data.ok) {
//       throw new Error(data.error || 'Error desconocido del servidor');
//     }
    
//     // ✅ Éxito
//     console.log('✅ Apuesta creada:', data);
//     toast.success('✅ Apuesta creada exitosamente');
    
//     // Limpiar formulario
//     setForm(INITIAL);
    
//     // Llamar callback si existe
//     if (typeof onSubmit === 'function') {
//       onSubmit(data);
//     }
    
//   } catch (err) {
//     console.error('❌ Error al crear apuesta:', err);
//     toast.error('❌ Error: ' + err.message);
//   } finally {
//     setLoadingSubmit(false);
//   }
// };


// // ═══════════════════════════════════════════════════════════════════════════
// // FIN - handleSubmit CORREGIDO
// // ═══════════════════════════════════════════════════════════════════════════


//   const canSubmit = !loadingSubmit && !loadingData && form.matchups.every(m => m.equipo1_nombre && m.equipo2_nombre) && form.premio && form.fecha_cierre && form.titulo && form.competicion

//   if (loadingData) {
//     return (
//       <div style={{
//         padding: '48px 20px',
//         textAlign: 'center',
//         fontFamily: 'DM Sans, sans-serif',
//         color: '#5f6e8a',
//       }}>
//         ⏳ Cargando datos...
//       </div>
//     )
//   }

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-6">

//       {/* Título */}
//       <Field
//         label="Título de la apuesta"
//         value={form.titulo}
//         onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
//         placeholder="Ej: Final Argentina vs Francia"
//         error={errors.titulo}
//       />

//       {/* COMPETICIÓN - CON "OTRO" ARRIBA */}
//       <div>
//         <div className="flex items-center justify-between mb-3">
//           <label className="font-body font-bold text-xs uppercase tracking-widest" style={{ color: '#5f6e8a' }}>
//             Competición
//           </label>
//         </div>

//         {/* Mostrar logo grande si está seleccionada */}
//         {form.competicion ? (
//           <div style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: '16px',
//             padding: '16px',
//             background: '#fafafa',
//             borderRadius: '12px',
//             marginBottom: '12px',
//             cursor: 'pointer',
//             border: '1.5px solid #f0eadb',
//           }}
//           onClick={() => setForm(p => ({ ...p, competicion: '' }))}>
//             <img 
//               src={competiciones.find(c => c.Nombre === form.competicion || c.nombre === form.competicion)?.Logo_URL || competiciones.find(c => c.Nombre === form.competicion || c.nombre === form.competicion)?.logo || ESCUDO_GRIS}
//               alt={form.competicion}
//               style={{
//                 width: '64px',
//                 height: '64px',
//                 objectFit: 'contain',
//                 borderRadius: '8px',
//               }}
//               onError={(e) => e.target.src = ESCUDO_GRIS}
//             />
//             <div>
//               <p className="font-body font-bold text-sm" style={{ color: '#0a1226', margin: 0 }}>
//                 {form.competicion}
//               </p>
//               <p className="font-body text-xs" style={{ color: '#a8b2c4', margin: '4px 0 0 0' }}>
//                 Click para cambiar
//               </p>
//             </div>
//           </div>
//         ) : (
//           <div style={{
//             border: '1.5px solid #f0eadb',
//             borderRadius: '12px',
//             overflow: 'hidden',
//           }}>
//             {/* + OTRO */}
//             <button
//               type="button"
//               onClick={() => setForm(p => ({ ...p, competicion: 'Otro' }))}
//               style={{
//                 width: '100%',
//                 padding: '12px 16px',
//                 background: '#f0eadb',
//                 border: 'none',
//                 borderBottom: '1px solid #e8dfd0',
//                 color: '#5f6e8a',
//                 fontFamily: 'DM Sans, sans-serif',
//                 fontSize: '12px',
//                 fontWeight: '600',
//                 cursor: 'pointer',
//                 textAlign: 'left',
//                 transition: 'all 0.2s ease',
//                 textTransform: 'uppercase',
//               }}
//               onMouseEnter={(e) => {
//                 e.target.style.background = '#ebc32b'
//                 e.target.style.color = '#0a1226'
//               }}
//               onMouseLeave={(e) => {
//                 e.target.style.background = '#f0eadb'
//                 e.target.style.color = '#5f6e8a'
//               }}
//             >
//               + Otra competición
//             </button>

//             {/* Lista de competiciones */}
//             {competiciones.map((comp, idx) => (
//               <label
//                 key={idx}
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '12px',
//                   padding: '12px 16px',
//                   borderBottom: idx < competiciones.length - 1 ? '1px solid #f5f5f5' : 'none',
//                   background: '#fff',
//                   cursor: 'pointer',
//                   transition: 'all 0.2s ease',
//                 }}
//                 onMouseEnter={e => e.currentTarget.style.background = 'rgba(235,195,43,0.04)'}
//                 onMouseLeave={e => e.currentTarget.style.background = '#fff'}
//               >
//                 <input
//                   type="radio"
//                   checked={form.competicion === comp.Nombre || form.competicion === comp.nombre}
//                   onChange={() => setForm(p => ({ ...p, competicion: comp.Nombre || comp.nombre }))}
//                   style={{ cursor: 'pointer' }}
//                 />
//                 <img 
//                   src={comp.Logo_URL || comp.logo || ESCUDO_GRIS}
//                   alt={comp.Nombre || comp.nombre}
//                   style={{
//                     width: '32px',
//                     height: '32px',
//                     objectFit: 'contain',
//                     borderRadius: '4px',
//                   }}
//                   onError={(e) => e.target.src = ESCUDO_GRIS}
//                 />
//                 <span className="font-body text-sm" style={{ color: '#0a1226', flex: 1 }}>
//                   {comp.Nombre || comp.nombre}
//                 </span>
//               </label>
//             ))}
//           </div>
//         )}
//         {errors.competicion && (
//           <span className="font-body text-xs" style={{ color: '#e03252', marginTop: '4px', display: 'block' }}>
//             {errors.competicion}
//           </span>
//         )}
//       </div>

//       {/* MATCHUPS - IGUAL A PARTIDOS */}
//       <div className="flex flex-col gap-4">
//         <div className="flex items-center justify-between">
//           <span className="font-body font-bold text-xs uppercase tracking-widest" style={{ color: '#5f6e8a' }}>
//             Matchups ({form.matchups.length}/3)
//           </span>
//           {form.matchups.length < 3 && (
//             <button
//               type="button"
//               onClick={agregarMatchup}
//               style={{
//                 padding: '6px 12px',
//                 borderRadius: '6px',
//                 background: '#f0eadb',
//                 border: '1px solid #e8dfd0',
//                 color: '#5f6e8a',
//                 fontFamily: 'DM Sans, sans-serif',
//                 fontSize: '12px',
//                 fontWeight: '600',
//                 cursor: 'pointer',
//                 transition: 'all 0.2s ease',
//                 textTransform: 'uppercase',
//               }}
//               onMouseEnter={(e) => {
//                 e.target.style.background = '#ebc32b'
//                 e.target.style.color = '#0a1226'
//               }}
//               onMouseLeave={(e) => {
//                 e.target.style.background = '#f0eadb'
//                 e.target.style.color = '#5f6e8a'
//               }}
//             >
//               + Agregar
//             </button>
//           )}
//         </div>

//         {form.matchups.map((matchup, idx) => (
//           <div key={idx} style={{
//             border: '1.5px solid #f0eadb',
//             borderRadius: '12px',
//             overflow: 'hidden',
//             background: '#fff',
//           }}>
//             <div style={{
//               padding: '12px 16px',
//               background: 'linear-gradient(135deg, #0a1226 0%, #1a2540 100%)',
//               borderBottom: '1px solid rgba(235,195,43,0.15)',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//             }}>
//               <span className="font-body font-bold text-xs uppercase tracking-widest" style={{ color: '#ebc32b' }}>
//                 Matchup {idx + 1}
//               </span>
//               {form.matchups.length > 1 && (
//                 <button
//                   type="button"
//                   onClick={() => eliminarMatchup(idx)}
//                   style={{
//                     padding: '6px 12px',
//                     borderRadius: '6px',
//                     background: 'rgba(224,50,82,0.15)',
//                     border: '1px solid rgba(224,50,82,0.3)',
//                     color: '#e03252',
//                     fontFamily: 'DM Sans, sans-serif',
//                     fontSize: '12px',
//                     cursor: 'pointer',
//                     transition: 'all 0.2s ease',
//                   }}
//                   onMouseEnter={(e) => {
//                     e.target.style.background = '#e03252'
//                     e.target.style.color = '#fff'
//                   }}
//                   onMouseLeave={(e) => {
//                     e.target.style.background = 'rgba(224,50,82,0.15)'
//                     e.target.style.color = '#e03252'
//                   }}
//                 >
//                   ✕ Eliminar
//                 </button>
//               )}
//             </div>

//             <div style={{ padding: '16px' }}>
//               {/* EQUIPO 1 */}
//               {!mostrarEquipo1 ? (
//                 <div style={{ marginBottom: '16px' }}>
//                   {matchup.equipo1_nombre ? (
//                     <div style={{
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '12px',
//                       padding: '12px',
//                       background: '#fafafa',
//                       borderRadius: '8px',
//                       cursor: 'pointer',
//                     }}
//                     onClick={() => setMostrarEquipo1(true)}>
//                       <img 
//                         src={matchup.equipo1_logo || ESCUDO_GRIS} 
//                         alt={matchup.equipo1_nombre}
//                         style={{
//                           width: '40px',
//                           height: '40px',
//                           objectFit: 'contain',
//                           borderRadius: '6px',
//                         }}
//                         onError={(e) => e.target.src = ESCUDO_GRIS}
//                       />
//                       <span className="font-body text-sm font-semibold" style={{ color: '#0a1226' }}>
//                         {matchup.equipo1_nombre}
//                       </span>
//                     </div>
//                   ) : (
//                     <button
//                       type="button"
//                       onClick={() => setMostrarEquipo1(true)}
//                       style={{
//                         width: '100%',
//                         padding: '12px',
//                         borderRadius: '8px',
//                         background: '#f0eadb',
//                         border: '1.5px solid #e8dfd0',
//                         color: '#5f6e8a',
//                         fontFamily: 'DM Sans, sans-serif',
//                         fontSize: '12px',
//                         fontWeight: '600',
//                         cursor: 'pointer',
//                         textTransform: 'uppercase',
//                       }}
//                     >
//                       -- Seleccionar Equipo 1 --
//                     </button>
//                   )}
//                 </div>
//               ) : (
//                 <div style={{ marginBottom: '16px' }}>
//                   <SelectorEquipos
//                     label="Equipo 1"
//                     equipos={equipos}
//                     selectedId={matchup.equipo1_id}
//                     onSelect={(id, nombre, logo) => handleEquipoSelect(idx, 1, id, nombre, logo)}
//                     onOtro={() => setModoOtroEquipo1(true)}
//                     showOtroMode={modoOtroEquipo1}
//                     onOtroNombre={setOtroEquipo1Nombre}
//                     otroNombre={otroEquipo1Nombre}
//                     onOtroConfirm={() => handleEquipoManual(idx, 1, otroEquipo1Nombre)}
//                     onOtroCancelar={() => {
//                       setModoOtroEquipo1(false)
//                       setOtroEquipo1Nombre('')
//                     }}
//                   />
//                 </div>
//               )}

//               {/* VS */}
//               <div style={{
//                 textAlign: 'center',
//                 margin: '12px 0',
//                 fontFamily: 'DM Sans, sans-serif',
//                 fontSize: '12px',
//                 fontWeight: '600',
//                 color: '#a8b2c4',
//                 textTransform: 'uppercase',
//               }}>
//                 VS
//               </div>

//               {/* EQUIPO 2 */}
//               {!mostrarEquipo2 ? (
//                 <div>
//                   {matchup.equipo2_nombre ? (
//                     <div style={{
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '12px',
//                       padding: '12px',
//                       background: '#fafafa',
//                       borderRadius: '8px',
//                       cursor: 'pointer',
//                     }}
//                     onClick={() => setMostrarEquipo2(true)}>
//                       <img 
//                         src={matchup.equipo2_logo || ESCUDO_GRIS} 
//                         alt={matchup.equipo2_nombre}
//                         style={{
//                           width: '40px',
//                           height: '40px',
//                           objectFit: 'contain',
//                           borderRadius: '6px',
//                         }}
//                         onError={(e) => e.target.src = ESCUDO_GRIS}
//                       />
//                       <span className="font-body text-sm font-semibold" style={{ color: '#0a1226' }}>
//                         {matchup.equipo2_nombre}
//                       </span>
//                     </div>
//                   ) : (
//                     <button
//                       type="button"
//                       onClick={() => setMostrarEquipo2(true)}
//                       style={{
//                         width: '100%',
//                         padding: '12px',
//                         borderRadius: '8px',
//                         background: '#f0eadb',
//                         border: '1.5px solid #e8dfd0',
//                         color: '#5f6e8a',
//                         fontFamily: 'DM Sans, sans-serif',
//                         fontSize: '12px',
//                         fontWeight: '600',
//                         cursor: 'pointer',
//                         textTransform: 'uppercase',
//                       }}
//                     >
//                       -- Seleccionar Equipo 2 --
//                     </button>
//                   )}
//                 </div>
//               ) : (
//                 <SelectorEquipos
//                   label="Equipo 2"
//                   equipos={equipos}
//                   selectedId={matchup.equipo2_id}
//                   onSelect={(id, nombre, logo) => handleEquipoSelect(idx, 2, id, nombre, logo)}
//                   onOtro={() => setModoOtroEquipo2(true)}
//                   showOtroMode={modoOtroEquipo2}
//                   onOtroNombre={setOtroEquipo2Nombre}
//                   otroNombre={otroEquipo2Nombre}
//                   onOtroConfirm={() => handleEquipoManual(idx, 2, otroEquipo2Nombre)}
//                   onOtroCancelar={() => {
//                     setModoOtroEquipo2(false)
//                     setOtroEquipo2Nombre('')
//                   }}
//                 />
//               )}
//             </div>
//           </div>
//         ))}

//         {errors.matchups && (
//           <span className="font-body text-xs" style={{ color: '#e03252' }}>
//             {errors.matchups}
//           </span>
//         )}
//       </div>

//       {/* Premio + Fecha */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <Field
//           label="Premio / Incentivo"
//           value={form.premio}
//           onChange={e => setForm(p => ({ ...p, premio: e.target.value }))}
//           error={errors.premio}
//           placeholder="Ej: Gift card $50"
//         />
//         <Field
//           label="Fecha límite"
//           type="datetime-local"
//           value={form.fecha_cierre}
//           onChange={e => setForm(p => ({ ...p, fecha_cierre: e.target.value }))}
//           error={errors.fecha_cierre}
//         />
//       </div>

//       {/* Submit */}
//       <button
//         type="submit"
//         disabled={!canSubmit}
//         className="w-full py-4 rounded-xl font-body font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
//         style={{
//           background: canSubmit ? 'linear-gradient(135deg, #0a1226 0%, #1a2540 100%)' : 'rgba(12,24,43,.15)',
//           color: canSubmit ? '#ebc32b' : '#a8b2c4',
//           boxShadow: canSubmit ? '0 4px 16px rgba(10,18,38,.2)' : 'none',
//         }}
//         onMouseEnter={e => { 
//           if (canSubmit) { 
//             e.currentTarget.style.background = 'linear-gradient(135deg, #1a2540 0%, #0a1226 100%)'
//             e.currentTarget.style.transform = 'translateY(-1px)'
//             e.currentTarget.style.boxShadow = '0 6px 20px rgba(10,18,38,.25)'
//           } 
//         }}
//         onMouseLeave={e => { 
//           if (canSubmit) { 
//             e.currentTarget.style.background = 'linear-gradient(135deg, #0a1226 0%, #1a2540 100%)'
//             e.currentTarget.style.transform = 'translateY(0)'
//             e.currentTarget.style.boxShadow = '0 4px 16px rgba(10,18,38,.2)'
//           } 
//         }}
//       >
//         {loadingSubmit ? (
//           <>
//             <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
//             Creando apuesta...
//           </>
//         ) : (
//           <>
//             Crear Apuesta · {form.matchups.length} {form.matchups.length === 1 ? 'matchup' : 'matchups'}
//           </>
//         )}
//       </button>

//     </form>
//   )
// }