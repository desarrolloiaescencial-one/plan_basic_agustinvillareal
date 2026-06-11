/* ── Shared small button components ─────────────────────── */
function BtnGold({ children, onClick, disabled, type = 'button' }) {
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full font-body font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: '#0c182b', color: '#ebc32b', boxShadow: '0 4px 14px rgba(12,24,43,.2)' }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = '#17376a'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = '#0c182b'; e.currentTarget.style.transform = '' } }}
    >
      {children}
    </button>
  )
}

function BtnOutline({ children, onClick, disabled, danger = false }) {
  const border  = danger ? 'rgba(224,50,82,.35)' : 'rgba(12,24,43,.2)'
  const color   = danger ? '#e03252'             : '#5f6e8a'
  const hoverBg = danger ? 'rgba(224,50,82,.06)' : 'rgba(12,24,43,.04)'
  return (
    <button
      type="button" onClick={onClick} disabled={disabled}
      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full font-body font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-40"
      style={{ background: 'transparent', border: `1px solid ${border}`, color }}
      onMouseEnter={e => { e.currentTarget.style.background = hoverBg }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}

function AdminInput({ value, onChange, placeholder, required, type = 'text' }) {
  return (
    <input
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} required={required}
      className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all"
      style={{ background: '#fff', border: '1px solid #e8dfd0', color: '#0c182b' }}
      onFocus={e => { e.target.style.borderColor = '#ebc32b'; e.target.style.boxShadow = '0 0 0 3px rgba(235,195,43,.12)' }}
      onBlur={e =>  { e.target.style.borderColor = '#e8dfd0'; e.target.style.boxShadow = 'none' }}
    />
  )
}

function AdminTextarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all resize-none"
      style={{ background: '#fff', border: '1px solid #e8dfd0', color: '#0c182b' }}
      onFocus={e => { e.target.style.borderColor = '#ebc32b'; e.target.style.boxShadow = '0 0 0 3px rgba(235,195,43,.12)' }}
      onBlur={e =>  { e.target.style.borderColor = '#e8dfd0'; e.target.style.boxShadow = 'none' }}
    />
  )
}

/* ── Main component ──────────────────────────────────────── */
// export default function AreasTab({
//   areasAll, loadingAreas, loadAreasAll,
//   editingArea, setEditingArea,
//   newArea, setNewArea,
//   savingArea,
//   handleCreateArea, handleSaveEdit, handleToggleArea,
// }) {
//   return (
//     <div className="animate-fade-in delay-2 grid lg:grid-cols-5 gap-6">

//       {/* ── Crear área ── */}
//       <div
//         className="lg:col-span-2 rounded-2xl p-6 h-fit"
//         style={{
//           background: '#fff',
//           border: '1px solid #f0eadb',
//           boxShadow: '0 4px 16px rgba(12,24,43,.06)',
//         }}
//       >
//         <div className="flex items-center gap-3 mb-6">
//           <div className="w-9 h-9 rounded-xl flex items-center justify-center"
//             style={{ background: 'rgba(235,195,43,.12)', border: '1px solid rgba(235,195,43,.25)' }}>
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c99f16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//               <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
//             </svg>
//           </div>
//           <h2 className="font-display text-2xl" style={{ color: '#0c182b', letterSpacing: '.02em' }}>NUEVA ÁREA</h2>
//         </div>

//         <form onSubmit={handleCreateArea} className="flex flex-col gap-4">
//           <div>
//             <p className="font-body font-bold text-xs uppercase tracking-widest mb-2" style={{ color: '#5f6e8a' }}>Nombre *</p>
//             <AdminInput value={newArea.nombre} onChange={e => setNewArea({ ...newArea, nombre: e.target.value })} placeholder="Ej: Marketing, Ventas, IT..." required />
//           </div>
//           <div>
//             <p className="font-body font-bold text-xs uppercase tracking-widest mb-2" style={{ color: '#5f6e8a' }}>Descripción (opcional)</p>
//             <AdminTextarea value={newArea.descripcion} onChange={e => setNewArea({ ...newArea, descripcion: e.target.value })} placeholder="Breve descripción del área" rows={3} />
//           </div>
//           <BtnGold type="submit" disabled={savingArea || !newArea.nombre.trim()} onClick={undefined}>
//             {savingArea
//               ? <><span className="w-4 h-4 rounded-full border-2 border-t-transparent inline-block animate-spin" style={{ borderColor: '#ebc32b' }} /> Creando...</>
//               : 'Crear área'
//             }
//           </BtnGold>
//         </form>
//       </div>

//       {/* ── Lista de áreas ── */}
//       <div className="lg:col-span-3 flex flex-col gap-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <h2 className="font-display text-2xl" style={{ color: '#0c182b', letterSpacing: '.02em' }}>ÁREAS</h2>
//             <span className="font-display text-xl" style={{ color: '#ebc32b' }}>({areasAll.length})</span>
//           </div>
//           <BtnOutline onClick={loadAreasAll} disabled={loadingAreas}>
//             {loadingAreas
//               ? <span className="w-3 h-3 rounded-full border-2 border-t-transparent inline-block animate-spin" style={{ borderColor: '#5f6e8a' }} />
//               : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
//             }
//             Actualizar
//           </BtnOutline>
//         </div>

//         {loadingAreas && areasAll.length === 0 && (
//           <div className="text-center py-16">
//             <span className="inline-block w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#ebc32b' }} />
//             <p className="font-body text-sm mt-3" style={{ color: '#5f6e8a' }}>Cargando áreas...</p>
//           </div>
//         )}

//         {!loadingAreas && areasAll.length === 0 && (
//           <div className="rounded-2xl p-10 text-center" style={{ background: '#fff', border: '1px dashed #e8dfd0' }}>
//             <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
//               style={{ background: 'rgba(235,195,43,.08)', border: '1px solid rgba(235,195,43,.2)' }}>
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c99f16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"/>
//               </svg>
//             </div>
//             <p className="font-body text-sm font-semibold" style={{ color: '#5f6e8a' }}>Todavía no hay áreas creadas.</p>
//             <p className="font-body text-xs mt-1" style={{ color: '#a8b2c4' }}>Creá la primera desde el formulario.</p>
//           </div>
//         )}

//         {areasAll.length > 0 && (
//           <div className="flex flex-col gap-3">
//             {areasAll.map(area => {
//               const isActive  = area.activa === true || area.activa === 'TRUE' || area.activa === 'true' || area.activa === 1
//               const isEditing = editingArea?.id === area.id
//               return (
//                 <div key={area.id} className="rounded-xl p-4 transition-all"
//                   style={{
//                     background: '#fff',
//                     border: `1px solid ${isActive ? '#f0eadb' : '#e8dfd0'}`,
//                     boxShadow: '0 2px 8px rgba(12,24,43,.04)',
//                     opacity: isActive ? 1 : .6,
//                   }}>
//                   {isEditing ? (
//                     <div className="flex flex-col gap-3">
//                       <AdminInput value={editingArea.nombre} onChange={e => setEditingArea({ ...editingArea, nombre: e.target.value })} placeholder="Nombre del área" />
//                       <AdminTextarea value={editingArea.descripcion || ''} onChange={e => setEditingArea({ ...editingArea, descripcion: e.target.value })} placeholder="Descripción" rows={2} />
//                       <div className="flex gap-2 justify-end">
//                         <BtnOutline onClick={() => setEditingArea(null)}>Cancelar</BtnOutline>
//                         <BtnGold onClick={handleSaveEdit} disabled={savingArea}>{savingArea ? 'Guardando...' : 'Guardar'}</BtnGold>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center gap-2 flex-wrap">
//                           <p className="font-display text-lg truncate" style={{ color: '#0c182b', letterSpacing: '.01em' }}>{area.nombre}</p>
//                           <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-body font-bold uppercase tracking-wider"
//                             style={{
//                               background: isActive ? 'rgba(27,138,90,.08)' : 'rgba(95,110,138,.06)',
//                               color:      isActive ? '#1b8a5a'              : '#a8b2c4',
//                               border:     `1px solid ${isActive ? 'rgba(27,138,90,.2)' : 'rgba(95,110,138,.15)'}`,
//                             }}>
//                             {isActive ? 'Activa' : 'Inactiva'}
//                           </span>
//                         </div>
//                         {area.descripcion && <p className="text-xs font-body mt-1" style={{ color: '#5f6e8a' }}>{area.descripcion}</p>}
//                       </div>
//                       <div className="flex gap-1.5 flex-shrink-0">
//                         <BtnOutline onClick={() => setEditingArea({ id: area.id, nombre: area.nombre, descripcion: area.descripcion || '' })}>Editar</BtnOutline>
//                         <BtnOutline danger={isActive} onClick={() => handleToggleArea(area, isActive)}>{isActive ? 'Desactivar' : 'Reactivar'}</BtnOutline>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }