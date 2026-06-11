import { useState, useMemo } from 'react'
import sheetsApi from '../../services/sheetsApi.js'
import { fmtFecha } from '../../utils/index.js'

const ORDEN_FASES = ['grupos', '16avos', 'octavos', 'cuartos', 'semis', '3er_puesto', 'final']
const LABEL_FASE = {
  grupos: 'Fase de Grupos', '16avos': '16avos de Final', octavos: 'Octavos de Final',
  cuartos: 'Cuartos de Final', semis: 'Semifinales', '3er_puesto': '3er Puesto', final: 'Final'
}

const ESTADO_COLORS = {
  programado:  { color: '#5f6e8a', bg: 'rgba(255,255,255,.06)', border: 'rgba(255,255,255,.12)', label: 'Programado' },
  en_vivo:     { color: '#ff4d6d', bg: 'rgba(255,77,109,.12)',  border: 'rgba(255,77,109,.35)',  label: 'EN VIVO' },
  finalizado:  { color: '#ebc32b', bg: 'rgba(235,195,43,.1)',   border: 'rgba(235,195,43,.3)',   label: 'Finalizado' },
  cancelado:   { color: '#a8b2c4', bg: 'rgba(255,255,255,.04)', border: 'rgba(255,255,255,.1)',  label: 'Cancelado' },
}

// ─── Detección de eliminatoria (cualquier fase distinta de 'grupos') ─
function esEliminatoria(fase) {
  if (!fase) return false
  return String(fase).trim().toLowerCase() !== 'grupos'
}

function EditScoreModal({ match, onClose, onSave }) {
  const [local,         setLocal       ] = useState(String(match.goles_local     ?? ''))
  const [visitante,     setVisit       ] = useState(String(match.goles_visitante ?? ''))
  const [estado,        setEstado      ] = useState(match.estado || 'programado')
  const [penalesLocal,  setPenalesLocal] = useState(String(match.penales_local   ?? ''))
  const [penalesVisit,  setPenalesVisit] = useState(String(match.penales_visit   ?? ''))
  const [saving,        setSaving      ] = useState(false)
  const [errorPen,      setErrorPen    ] = useState('')

  const elim = esEliminatoria(match.fase)
  const golesLocalNum   = local !== '' ? parseInt(local) : null
  const golesVisitNum   = visitante !== '' ? parseInt(visitante) : null
  const empate = golesLocalNum != null && golesVisitNum != null && golesLocalNum === golesVisitNum
  // Mostrar bloque de penales solo si: es eliminatoria + estado finalizado + empate en 90'
  const debeMostrarPenales = elim && estado === 'finalizado' && empate

  async function handleSave() {
    setErrorPen('')
    // Validación: si es elim+empate+finalizado, los penales son obligatorios
    if (debeMostrarPenales) {
      const pl = penalesLocal !== '' ? parseInt(penalesLocal) : NaN
      const pv = penalesVisit !== '' ? parseInt(penalesVisit) : NaN
      if (isNaN(pl) || isNaN(pv)) {
        setErrorPen('Es eliminatoria y terminó empatado: tenés que cargar los penales para definir el clasificado.')
        return
      }
      if (pl === pv) {
        setErrorPen('Los penales no pueden quedar empatados — uno de los dos equipos clasifica.')
        return
      }
    }

    setSaving(true)
    try {
      await sheetsApi.partidos.actualizar({
        partido_id:       match.id,
        goles_local:      local !== '' ? parseInt(local) : null,
        goles_visitante:  visitante !== '' ? parseInt(visitante) : null,
        penales_local:    debeMostrarPenales && penalesLocal !== '' ? parseInt(penalesLocal) : null,
        penales_visit:    debeMostrarPenales && penalesVisit !== '' ? parseInt(penalesVisit) : null,
        estado,
      })
      onSave()
      onClose()
    } catch (e) {
      alert('Error actualizando partido: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(12,24,43,.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{
          background: '#fff',
          border: '1px solid #f0eadb',
          boxShadow: '0 25px 80px rgba(0,0,0,.6)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl text-white" style={{ letterSpacing: '.02em' }}>EDITAR RESULTADO</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: '#faf7f0', border: '1px solid #e8dfd0', color: '#5f6e8a' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,77,109,.1)'; e.currentTarget.style.color = '#ff4d6d' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = 'rgba(255,255,255,.5)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Equipos + fase */}
        <p className="font-body text-sm text-center mb-1" style={{ color: '#5f6e8a' }}>
          <span className="text-white font-semibold">{match.equipo_local}</span>
          <span style={{ color: '#a8b2c4' }}> vs </span>
          <span className="text-white font-semibold">{match.equipo_visitante}</span>
        </p>
        {match.fase && (
          <p className="font-body text-[10px] text-center mb-4 uppercase tracking-widest" style={{ color: elim ? '#ebc32b' : '#a8b2c4' }}>
            {LABEL_FASE[match.fase] || match.fase}
            {elim && ' · Eliminación directa'}
          </p>
        )}

        {/* Score inputs (90') */}
        <p className="font-body text-[10px] uppercase tracking-widest mb-2" style={{ color: '#5f6e8a' }}>
          Marcador {elim ? '(90 minutos)' : ''}
        </p>
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 text-center">
            <p className="font-body text-xs uppercase tracking-widest mb-2" style={{ color: '#5f6e8a' }}>{match.equipo_local}</p>
            <input
              type="number" min="0" max="99" value={local}
              onChange={e => setLocal(e.target.value)}
              className="w-full px-3 py-3 rounded-xl font-display text-2xl text-center outline-none transition-all"
              style={{ background: '#faf7f0', border: '1px solid #e8dfd0', color: '#ebc32b' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(235,195,43,.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(235,195,43,.1)' }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,.12)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
          <span className="font-display text-2xl" style={{ color: '#a8b2c4' }}>:</span>
          <div className="flex-1 text-center">
            <p className="font-body text-xs uppercase tracking-widest mb-2" style={{ color: '#5f6e8a' }}>{match.equipo_visitante}</p>
            <input
              type="number" min="0" max="99" value={visitante}
              onChange={e => setVisit(e.target.value)}
              className="w-full px-3 py-3 rounded-xl font-display text-2xl text-center outline-none transition-all"
              style={{ background: '#faf7f0', border: '1px solid #e8dfd0', color: '#ebc32b' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(235,195,43,.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(235,195,43,.1)' }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,.12)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        </div>

        {/* Estado */}
        <div className="mb-5">
          <p className="font-body text-xs uppercase tracking-widest mb-2" style={{ color: '#5f6e8a' }}>Estado del partido</p>
          <div className="grid grid-cols-2 gap-2">
            {['programado', 'en_vivo', 'finalizado', 'cancelado'].map(est => {
              const s = ESTADO_COLORS[est]
              const isActive = estado === est
              return (
                <button key={est} type="button" onClick={() => setEstado(est)}
                  className="py-2 px-3 rounded-xl text-xs font-body font-semibold transition-all"
                  style={{
                    background: isActive ? s.bg : 'rgba(255,255,255,.04)',
                    border: `1px solid ${isActive ? s.border : 'rgba(255,255,255,.08)'}`,
                    color: isActive ? s.color : 'rgba(255,255,255,.4)',
                  }}>
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* PENALES — solo si eliminatoria + finalizado + empate */}
        {debeMostrarPenales && (
          <div className="mb-5 p-3 rounded-xl" style={{ background: 'rgba(235,195,43,.06)', border: '1px solid rgba(235,195,43,.25)' }}>
            <div className="flex items-center gap-2 mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ebc32b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              <p className="font-body text-xs uppercase tracking-widest font-bold" style={{ color: '#ebc32b' }}>
                Definición por penales
              </p>
            </div>
            <p className="font-body text-[11px] mb-3" style={{ color: '#5f6e8a' }}>
              El partido terminó empatado en los 90'. Cargá los penales para que el sistema sepa quién clasifica.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="font-body text-[10px] uppercase tracking-widest mb-1" style={{ color: '#5f6e8a' }}>{match.equipo_local}</p>
                <input
                  type="number" min="0" max="99" value={penalesLocal}
                  onChange={e => { setPenalesLocal(e.target.value); setErrorPen('') }}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg font-display text-lg text-center outline-none transition-all"
                  style={{ background: '#fff', border: '1px solid #e8dfd0', color: '#0c182b' }}
                />
              </div>
              <span className="font-display text-lg" style={{ color: '#a8b2c4' }}>:</span>
              <div className="flex-1">
                <p className="font-body text-[10px] uppercase tracking-widest mb-1" style={{ color: '#5f6e8a' }}>{match.equipo_visitante}</p>
                <input
                  type="number" min="0" max="99" value={penalesVisit}
                  onChange={e => { setPenalesVisit(e.target.value); setErrorPen('') }}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg font-display text-lg text-center outline-none transition-all"
                  style={{ background: '#fff', border: '1px solid #e8dfd0', color: '#0c182b' }}
                />
              </div>
            </div>
            {errorPen && (
              <p className="font-body text-[11px] mt-2 font-semibold" style={{ color: '#ff4d6d' }}>
                {errorPen}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-body font-semibold text-sm transition-all"
            style={{ background: 'transparent', border: '1px solid #e8dfd0', color: '#5f6e8a' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,217,223,.3)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'; e.currentTarget.style.color = 'rgba(255,255,255,.5)' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl font-body font-bold text-sm transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#ebc32b,#c99f16)', color: '#05090f', boxShadow: '0 4px 16px rgba(235,195,43,.3)' }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.boxShadow = '0 6px 24px rgba(235,195,43,.5)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(235,195,43,.3)' }}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PartidosAdminTab({ matches, loadBets }) {
  const [filtroFase,   setFiltroFase  ] = useState('todas')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [editingMatch, setEditingMatch ] = useState(null)
  const [syncing,      setSyncing      ] = useState(false)

  const fasesDisponibles = useMemo(() => {
    const set = new Set(matches.map(m => m.fase).filter(Boolean))
    return ORDEN_FASES.filter(f => set.has(f))
  }, [matches])

  const filtered = useMemo(() => {
    return matches.filter(m => {
      if (filtroFase   !== 'todas' && m.fase   !== filtroFase)   return false
      if (filtroEstado !== 'todos' && m.estado !== filtroEstado) return false
      return true
    })
  }, [matches, filtroFase, filtroEstado])

  async function handleSync() {
    setSyncing(true)
    try {
      await sheetsApi.partidos.sincronizar()
      await loadBets()
      alert('Partidos sincronizados correctamente.')
    } catch (e) {
      alert('Error al sincronizar: ' + e.message)
    } finally {
      setSyncing(false)
    }
  }

  const liveCount      = matches.filter(m => m.estado === 'en_vivo').length
  const finishedCount  = matches.filter(m => m.estado === 'finalizado').length
  const scheduledCount = matches.filter(m => m.estado === 'programado').length

  return (
    <div className="animate-fade-in delay-2">

      {/* Header con stats y sync */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="font-display text-2xl text-white" style={{ letterSpacing: '.02em' }}>
            PARTIDOS <span style={{ color: '#ebc32b' }}>({matches.length})</span>
          </h2>
          <div className="flex items-center gap-3">
            {liveCount > 0 && (
              <span className="flex items-center gap-1.5 font-body text-xs font-bold" style={{ color: '#ff4d6d' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d6d] animate-pulse-live" />
                {liveCount} en vivo
              </span>
            )}
            <span className="font-body text-xs" style={{ color: '#a8b2c4' }}>{scheduledCount} programados · {finishedCount} finalizados</span>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-body font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
          style={{ background: 'rgba(235,195,43,.1)', border: '1px solid rgba(235,195,43,.3)', color: '#ebc32b' }}
          onMouseEnter={e => { if (!syncing) { e.currentTarget.style.background = '#ebc32b'; e.currentTarget.style.color = '#05090f' } }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(235,195,43,.1)'; e.currentTarget.style.color = '#ebc32b' }}
        >
          {syncing
            ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" style={{ animation: 'spin .8s linear infinite' }} />
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          }
          {syncing ? 'Sincronizando...' : 'Sincronizar API'}
        </button>
      </div>

      {/* Filtros */}
      <div
        className="rounded-2xl p-4 mb-5 flex flex-col gap-3"
        style={{ background: '#fff', border: '1px solid #f0eadb' }}
      >
        {fasesDisponibles.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-body font-bold uppercase text-[10px] tracking-widest w-14 flex-shrink-0" style={{ color: '#a8b2c4' }}>Fase</span>
            {['todas', ...fasesDisponibles].map(f => (
              <button key={f} type="button"
                onClick={() => setFiltroFase(f)}
                className="px-3 py-1 rounded-full font-body font-semibold transition-all whitespace-nowrap"
                style={{
                  fontSize: 11,
                  background: filtroFase === f ? '#ebc32b' : 'rgba(255,255,255,.06)',
                  border: `1px solid ${filtroFase === f ? '#ebc32b' : 'rgba(255,255,255,.12)'}`,
                  color: filtroFase === f ? '#05090f' : 'rgba(255,255,255,.5)',
                }}>
                {f === 'todas' ? 'Todas' : (LABEL_FASE[f] || f)}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-body font-bold uppercase text-[10px] tracking-widest w-14 flex-shrink-0" style={{ color: '#a8b2c4' }}>Estado</span>
          {['todos', 'programado', 'en_vivo', 'finalizado'].map(est => {
            const s = est === 'todos' ? null : ESTADO_COLORS[est]
            const isActive = filtroEstado === est
            return (
              <button key={est} type="button"
                onClick={() => setFiltroEstado(est)}
                className="px-3 py-1 rounded-full font-body font-semibold transition-all whitespace-nowrap"
                style={{
                  fontSize: 11,
                  background: isActive ? (s?.bg || '#ebc32b') : 'rgba(255,255,255,.06)',
                  border: `1px solid ${isActive ? (s?.border || '#ebc32b') : 'rgba(255,255,255,.12)'}`,
                  color: isActive ? (s?.color || '#05090f') : 'rgba(255,255,255,.5)',
                }}>
                {est === 'todos' ? 'Todos' : (s?.label || est)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Contador */}
      <p className="text-xs font-body mb-3" style={{ color: '#a8b2c4' }}>
        {filtered.length} {filtered.length === 1 ? 'partido' : 'partidos'}
      </p>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(66,91,139,.08)', border: '1px dashed rgba(235,195,43,.2)' }}>
          <p className="font-body text-sm font-semibold" style={{ color: '#5f6e8a' }}>
            No hay partidos con estos filtros.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(match => {
            const s = ESTADO_COLORS[match.estado] || ESTADO_COLORS.programado
            const isFinished  = match.estado === 'finalizado'
            const isLive      = match.estado === 'en_vivo'
            const isScheduled = match.estado === 'programado'
            const faseLabel   = LABEL_FASE[match.fase] || match.fase || ''
            const elim = esEliminatoria(match.fase)
            const tienePenales = match.penales_local != null && match.penales_local !== '' &&
                                 match.penales_visit != null && match.penales_visit !== ''
            const empate = match.goles_local != null && match.goles_visitante != null &&
                           parseInt(match.goles_local) === parseInt(match.goles_visitante)

            return (
              <div
                key={match.id}
                className="rounded-xl px-4 py-3 transition-all group"
                style={{
                  background: '#fff',
                  border: `1px solid ${isLive ? 'rgba(255,77,109,.3)' : 'rgba(255,255,255,.07)'}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(235,195,43,.25)'; e.currentTarget.style.background = 'linear-gradient(155deg,rgba(66,91,139,.22),rgba(66,91,139,.08))' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = isLive ? 'rgba(255,77,109,.3)' : 'rgba(255,255,255,.07)'; e.currentTarget.style.background = 'linear-gradient(155deg,rgba(66,91,139,.15),rgba(66,91,139,.04))' }}
              >
                <div className="flex items-center gap-3">
                  {/* Fase / estado */}
                  <div className="flex flex-col gap-0.5 flex-shrink-0 w-24 hidden sm:flex">
                    {faseLabel && (
                      <span className="text-[9px] font-semibold uppercase tracking-wider font-body" style={{ color: elim ? '#ebc32b' : '#a8b2c4' }}>
                        {faseLabel}
                      </span>
                    )}
                    {match.grupo && (
                      <span className="text-[9px] font-body" style={{ color: '#a8b2c4' }}>
                        Grupo {match.grupo}{match.jornada ? ` · J${match.jornada}` : ''}
                      </span>
                    )}
                  </div>

                  {/* Partido */}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 justify-end min-w-0">
                      {match.bandera_local && (
                        <img src={match.bandera_local} alt="" className="w-6 h-4 object-cover rounded-sm flex-shrink-0" style={{ border: '1px solid #e8dfd0' }} />
                      )}
                      <span className="font-body text-sm text-white truncate text-right">{match.equipo_local || '—'}</span>
                    </div>

                    <div className="flex-shrink-0 px-3 py-1 rounded-lg text-center"
                      style={{ background: 'rgba(2,15,39,.5)', border: '1px solid #e8dfd0', minWidth: 56 }}>
                      {isScheduled ? (
                        <span className="font-display text-sm" style={{ color: '#a8b2c4' }}>- : -</span>
                      ) : (
                        <>
                          <span className="font-display text-base" style={{ color: isLive ? '#ff4d6d' : '#ebc32b' }}>
                            {match.goles_local ?? 0} : {match.goles_visitante ?? 0}
                          </span>
                          {tienePenales && (
                            <span className="block text-[9px] font-body font-bold uppercase tracking-wider" style={{ color: '#5f6e8a' }}>
                              pen {match.penales_local}-{match.penales_visit}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-body text-sm text-white truncate">{match.equipo_visitante || '—'}</span>
                      {match.bandera_visitante && (
                        <img src={match.bandera_visitante} alt="" className="w-6 h-4 object-cover rounded-sm flex-shrink-0" style={{ border: '1px solid #e8dfd0' }} />
                      )}
                    </div>
                  </div>

                  {/* Estado badge + alerta penales pendientes */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {/* ⚠️ Aviso si es elim+finalizado+empate y NO tiene penales */}
                    {elim && isFinished && empate && !tienePenales && (
                      <span title="Faltan los penales para puntuar"
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full"
                        style={{ background: 'rgba(255,77,109,.15)', border: '1px solid rgba(255,77,109,.4)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ff4d6d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                      </span>
                    )}
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-body font-bold uppercase tracking-wider whitespace-nowrap hidden sm:inline-flex"
                      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                    >
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d6d] animate-pulse-live" />}
                      {isScheduled ? (fmtFecha(match.fecha_partido) || '—') : s.label}
                    </span>

                    {/* Edit button */}
                    <button
                      onClick={() => setEditingMatch(match)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                      style={{ background: 'rgba(235,195,43,.1)', border: '1px solid #f0eadb', color: '#ebc32b' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#ebc32b'; e.currentTarget.style.color = '#05090f' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(235,195,43,.1)'; e.currentTarget.style.color = '#ebc32b' }}
                      title="Editar resultado"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit modal */}
      {editingMatch && (
        <EditScoreModal
          match={editingMatch}
          onClose={() => setEditingMatch(null)}
          onSave={loadBets}
        />
      )}
    </div>
  )
}
