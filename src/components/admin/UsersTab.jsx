import { formatDate } from '../../utils/index.js'

function getInitials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(n => n[0]?.toUpperCase() || '').join('')
}

/* ── Shared small button components ─────────────────────── */
function BtnGold({ children, onClick, disabled }) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled}
      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full font-body font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: '#0c182b', color: '#ebc32b', boxShadow: '0 4px 14px rgba(12,24,43,.2)' }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = '#17376a'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = '#0c182b'; e.currentTarget.style.transform = '' } }}
    >
      {children}
    </button>
  )
}

function BtnOutline({ children, onClick, danger = false }) {
  const border  = danger ? 'rgba(224,50,82,.35)' : 'rgba(12,24,43,.2)'
  const color   = danger ? '#e03252'             : '#5f6e8a'
  const hoverBg = danger ? 'rgba(224,50,82,.06)' : 'rgba(12,24,43,.04)'
  return (
    <button
      type="button" onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full font-body font-semibold text-xs uppercase tracking-wider transition-all"
      style={{ background: 'transparent', border: `1px solid ${border}`, color }}
      onMouseEnter={e => { e.currentTarget.style.background = hoverBg }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}

/* ── Main component ──────────────────────────────────────── */
export default function UsersTab({
  pendingUsers, loadingUsers, loadPendingUsers,
  areas, approvingUser, setApprovingUser,
  confirmApprove, rejectUser,
}) {
  return (
    <div className="animate-fade-in delay-2">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-2xl" style={{ color: '#0c182b', letterSpacing: '.02em' }}>PENDIENTES</h2>
          {pendingUsers.length > 0 && (
            <span className="font-display text-xl" style={{ color: '#e03252' }}>({pendingUsers.length})</span>
          )}
        </div>
        <BtnOutline onClick={loadPendingUsers} disabled={loadingUsers}>
          {loadingUsers
            ? <span className="w-3 h-3 rounded-full border-2 border-t-transparent inline-block animate-spin" style={{ borderColor: '#5f6e8a' }} />
            : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          }
          Actualizar
        </BtnOutline>
      </div>

      {/* Loading */}
      {loadingUsers && pendingUsers.length === 0 && (
        <div className="text-center py-16">
          <span className="inline-block w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#ebc32b' }} />
          <p className="font-body text-sm mt-3" style={{ color: '#5f6e8a' }}>Cargando usuarios...</p>
        </div>
      )}

      {/* Empty */}
      {!loadingUsers && pendingUsers.length === 0 && (
        <div className="rounded-2xl p-12 text-center" style={{ background: '#fff', border: '1px dashed #e8dfd0' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(27,138,90,.08)', border: '1px solid rgba(27,138,90,.2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1b8a5a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <p className="font-body font-semibold text-sm" style={{ color: '#5f6e8a' }}>No hay usuarios pendientes</p>
          <p className="font-body text-xs mt-1" style={{ color: '#a8b2c4' }}>Las solicitudes nuevas van a aparecer acá.</p>
        </div>
      )}

      {/* Lista */}
      {pendingUsers.length > 0 && (
        <div className="flex flex-col gap-3">
          {pendingUsers.map(u => {
            const isApproving = approvingUser?.id === u.id
            return (
              <div key={u.id} className="rounded-2xl p-5 transition-all"
                style={{
                  background: '#fff',
                  border: `1px solid ${isApproving ? '#ebc32b' : '#f0eadb'}`,
                  boxShadow: '0 4px 16px rgba(12,24,43,.06)',
                }}>

                {/* Cabecera usuario */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-display text-lg"
                      style={{ background: 'linear-gradient(135deg,#0c182b,#17376a)', color: '#ebc32b', boxShadow: '0 4px 12px rgba(12,24,43,.2)' }}>
                      {getInitials(u.nombre)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-body font-semibold truncate" style={{ color: '#0c182b' }}>{u.nombre}</p>
                      <p className="text-xs font-body truncate" style={{ color: '#5f6e8a' }}>{u.email}</p>
                      <p className="font-body mt-0.5" style={{ fontSize: 10, color: '#a8b2c4' }}>
                        Registrado: {formatDate(u.fecha_registro)}
                      </p>
                    </div>
                  </div>

                  {!isApproving && (
                    <div className="flex gap-2 flex-shrink-0">
                      <BtnGold onClick={() => setApprovingUser({ id: u.id, tipo_usuario: '', area_id: '' })}>Aprobar</BtnGold>
                      <BtnOutline danger onClick={() => rejectUser(u.id)}>Rechazar</BtnOutline>
                    </div>
                  )}
                </div>

                {/* Panel aprobación */}
                {isApproving && (
                  <div className="mt-5 pt-5 flex flex-col gap-5" style={{ borderTop: '1px solid #f0eadb' }}>

                    {/* Rol */}
                    <div>
                      <p className="font-body font-bold text-xs uppercase tracking-widest mb-2" style={{ color: '#5f6e8a' }}>Rol</p>
                      <div className="flex gap-2">
                        {[
                          { val: 'general', label: 'Participante', desc: 'Solo observa' },
                          { val: 'jefe',    label: 'Jefe de Área', desc: 'Carga prodes' },
                        ].map(opt => {
                          const isActive = approvingUser.tipo_usuario === opt.val
                          return (
                            <button key={opt.val} type="button"
                              onClick={() => setApprovingUser({ ...approvingUser, tipo_usuario: opt.val })}
                              className="flex-1 px-4 py-3 rounded-xl text-left transition-all"
                              style={{
                                background: isActive ? '#0c182b' : '#faf7f0',
                                border: `1px solid ${isActive ? '#0c182b' : '#e8dfd0'}`,
                                color: isActive ? '#ebc32b' : '#0c182b',
                              }}>
                              <p className="font-body font-semibold text-sm">{opt.label}</p>
                              <p className="font-body text-xs mt-0.5" style={{ color: isActive ? 'rgba(235,195,43,.6)' : '#5f6e8a' }}>{opt.desc}</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Área */}
                    <div>
                      <p className="font-body font-bold text-xs uppercase tracking-widest mb-2" style={{ color: '#5f6e8a' }}>Área</p>
                      {areas.length === 0 ? (
                        <p className="text-xs font-body p-3 rounded-xl"
                          style={{ background: 'rgba(235,195,43,.06)', border: '1px solid rgba(235,195,43,.2)', color: '#c99f16' }}>
                          ⚠ Todavía no hay áreas. Creá áreas primero para poder asignar usuarios.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {areas.map(a => {
                            const isActive = approvingUser.area_id === a.id
                            return (
                              <button key={a.id} type="button"
                                onClick={() => setApprovingUser({ ...approvingUser, area_id: a.id })}
                                className="px-3 py-1.5 rounded-full text-xs font-body font-semibold transition-all"
                                style={{
                                  background: isActive ? '#0c182b' : 'transparent',
                                  border: `1px solid ${isActive ? '#0c182b' : '#e8dfd0'}`,
                                  color: isActive ? '#ebc32b' : '#5f6e8a',
                                }}>
                                {a.nombre}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 justify-end">
                      <BtnOutline onClick={() => setApprovingUser(null)}>Cancelar</BtnOutline>
                      <BtnGold onClick={() => confirmApprove(u.id)} disabled={!approvingUser.tipo_usuario || !approvingUser.area_id}>
                        Confirmar aprobación
                      </BtnGold>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}