import { useState } from 'react'
import { isBetOpen, timeLeft, inputLocalAIsoUtc } from '../../utils/index.js'

function getBetStatus(bet) {
  if (bet.estado === 'abierta' && isBetOpen(bet))
    return { color: '#1b8a5a', bg: 'rgba(27,138,90,.08)', border: 'rgba(27,138,90,.2)', label: 'Activa', dot: true }
  if (bet.estado === 'finalizada')
    return { color: '#c99f16', bg: 'rgba(235,195,43,.1)', border: 'rgba(235,195,43,.25)', label: 'Finalizada', dot: false }
  if (bet.estado === 'cerrada')
    return { color: '#5f6e8a', bg: 'rgba(95,110,138,.06)', border: 'rgba(95,110,138,.15)', label: 'Cerrada', dot: false }
  return { color: '#5f6e8a', bg: 'rgba(95,110,138,.06)', border: 'rgba(95,110,138,.12)', label: bet.estado || '—', dot: false }
}

function BetRow({ bet, onClose, onReopen, onFinalize }) {
  const [showReopenForm, setShowReopenForm] = useState(false)
  const [reopenDate, setReopenDate] = useState('')
  const [reopening, setReopening] = useState(false)

  const status = getBetStatus(bet)
  const matchCount = bet.partidos_ids ? bet.partidos_ids.split(',').filter(Boolean).length : (bet.partidos?.length || 0)
  const remaining = bet.fecha_cierre ? timeLeft(bet.fecha_cierre) : null
  const isOpen = isBetOpen(bet)
  const isExpiredOpen = bet.estado === 'abierta' && bet.fecha_cierre && new Date(bet.fecha_cierre) < new Date()
  const canReopen = bet.estado === 'cerrada' || isExpiredOpen

  async function handleConfirmReopen() {
    if (!reopenDate) { alert('Ingresá la nueva fecha de cierre.'); return }
    setReopening(true)
    try {
      await onReopen(bet.id, inputLocalAIsoUtc(reopenDate))
      setShowReopenForm(false)
      setReopenDate('')
    } catch (e) {
      alert('Error al reabrir: ' + e.message)
    } finally {
      setReopening(false)
    }
  }

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        background: '#fff',
        border: `1px solid ${showReopenForm ? '#1b8a5a' : status.border}`,
        boxShadow: showReopenForm ? '0 8px 24px rgba(27,138,90,.12)' : '0 2px 8px rgba(12,24,43,.04)',
      }}
      onMouseEnter={e => { if (!showReopenForm) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(12,24,43,.08)' }}}
      onMouseLeave={e => { if (!showReopenForm) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(12,24,43,.04)' }}}
    >
      {/* Bet info row */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-body font-bold uppercase tracking-wider"
                style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}
              >
                {status.dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />}
                {status.label}
              </span>
              <span
                className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider"
                style={{ background: 'rgba(12,24,43,.04)', color: '#a8b2c4', border: '1px solid #f0eadb' }}
              >
                {bet.tipo === 'grupos' ? 'Áreas' : 'Libre'}
              </span>
              {bet.reabierta && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-body font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(27,138,90,.08)', color: '#1b8a5a', border: '1px solid rgba(27,138,90,.25)' }}
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                  Reabierta
                </span>
              )}
            </div>

            <p className="font-display text-lg truncate" style={{ color: '#0c182b', letterSpacing: '.01em' }}>
              {bet.titulo}
            </p>

            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {matchCount > 0 && (
                <span className="flex items-center gap-1 text-xs font-body" style={{ color: '#5f6e8a' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {matchCount} {matchCount === 1 ? 'partido' : 'partidos'}
                </span>
              )}
              {bet.premio && (
                <span className="flex items-center gap-1 text-xs font-body" style={{ color: '#c99f16' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                  {bet.premio}
                </span>
              )}
              {remaining && isOpen && (
                <span className="flex items-center gap-1 text-xs font-body" style={{ color: '#5f6e8a' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Cierra en {remaining}
                </span>
              )}
              {bet.participantes > 0 && (
                <span className="text-xs font-body" style={{ color: '#a8b2c4' }}>
                  {bet.participantes} participantes
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            {isOpen && onClose && (
              <button
                onClick={() => onClose(bet.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-body font-semibold transition-all"
                style={{ fontSize: 11, background: 'transparent', border: '1px solid rgba(224,50,82,.3)', color: '#e03252' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(224,50,82,.06)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                Cerrar
              </button>
            )}
            {canReopen && onReopen && (
              <button
                onClick={() => setShowReopenForm(v => !v)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-body font-bold transition-all"
                style={{
                  fontSize: 11,
                  background: showReopenForm ? '#1b8a5a' : 'rgba(27,138,90,.08)',
                  border: '1px solid rgba(27,138,90,.3)',
                  color: showReopenForm ? '#fff' : '#1b8a5a',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Reabrir
              </button>
            )}
            {bet.estado === 'cerrada' && onFinalize && (
              <button
                onClick={() => onFinalize(bet.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-body font-bold transition-all"
                style={{ fontSize: 11, background: 'rgba(235,195,43,.1)', border: '1px solid rgba(235,195,43,.35)', color: '#c99f16' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ebc32b'; e.currentTarget.style.color = '#05090f' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(235,195,43,.1)'; e.currentTarget.style.color = '#c99f16' }}
              >
                Finalizar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reopen form panel */}
      {showReopenForm && (
        <div className="px-4 pb-4">
          <div
            className="rounded-xl p-4 flex flex-col gap-4"
            style={{ background: 'rgba(27,138,90,.04)', border: '1.5px solid rgba(27,138,90,.2)' }}
          >
            {/* Recommendation banner */}
            <div
              className="flex gap-3 rounded-lg p-3"
              style={{ background: 'rgba(235,195,43,.08)', border: '1px solid rgba(235,195,43,.3)' }}
            >
              <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c99f16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <p className="text-[11px] font-body font-bold uppercase tracking-wider mb-1" style={{ color: '#c99f16' }}>
                  Recomendación
                </p>
                <p className="text-xs font-body leading-relaxed" style={{ color: '#5f6e8a' }}>
                  Los partidos ya <strong style={{ color: '#0c182b' }}>iniciados o finalizados</strong> se bloquean automáticamente — los usuarios no podrán apostar en ellos.<br />
                  Solo quedan habilitados los partidos <strong style={{ color: '#0c182b' }}>que aún no comenzaron</strong>.<br />
                  Recordá <strong style={{ color: '#0c182b' }}>volver a cerrar</strong> la apuesta cuando los usuarios terminen de completar sus predicciones.
                </p>
              </div>
            </div>

            {/* Nueva fecha de cierre */}
            <div>
              <label className="block text-[11px] font-body font-bold uppercase tracking-wider mb-2" style={{ color: '#5f6e8a' }}>
                Nueva fecha de cierre
              </label>
              <input
                type="datetime-local"
                value={reopenDate}
                onChange={e => setReopenDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm font-body outline-none transition-all"
                style={{
                  background: '#fff',
                  border: '1.5px solid #e8dfd0',
                  color: '#0c182b',
                  fontFamily: 'inherit',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#1b8a5a' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e8dfd0' }}
              />
              <p className="text-[10px] font-body mt-1.5" style={{ color: '#a8b2c4' }}>
                Hasta cuándo van a poder cargar predicciones en esta reapertura.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowReopenForm(false); setReopenDate('') }}
                disabled={reopening}
                className="px-4 py-2 rounded-lg text-xs font-body font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
                style={{ background: '#fff', border: '1px solid #e8dfd0', color: '#5f6e8a' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReopen}
                disabled={!reopenDate || reopening}
                className="px-5 py-2 rounded-lg text-xs font-body font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
                style={{
                  background: !reopenDate || reopening ? 'rgba(27,138,90,.3)' : '#1b8a5a',
                  color: '#fff',
                  boxShadow: !reopenDate || reopening ? 'none' : '0 2px 8px rgba(27,138,90,.3)',
                }}
              >
                {reopening ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Reabriendo...
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                    Confirmar reapertura
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BetsListTab({ bets, loading, closeBet, reopenBet, finalizeBet }) {
  const openBets = bets.filter(b => isBetOpen(b))
  const closedBets = bets.filter(b => b.estado === 'cerrada' && !isBetOpen(b))
  const finishedBets = bets.filter(b => b.estado === 'finalizada')

  async function handleClose(id) {
    if (!window.confirm('¿Cerrar esta apuesta? Los usuarios ya no podrán cargar predicciones.')) return
    try { await closeBet(id) }
    catch (e) { alert('Error al cerrar: ' + e.message) }
  }

  async function handleReopen(id, nuevaFecha) {
    try { await reopenBet(id, nuevaFecha) }
    catch (e) { throw e }
  }

  async function handleFinalize(id) {
    if (!window.confirm('¿Finalizar esta apuesta? Esto calculará los puntajes finales.')) return
    try { await finalizeBet(id) }
    catch (e) { alert('Error al finalizar: ' + e.message) }
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in delay-2">

      {loading && bets.length === 0 && (
        <div className="text-center py-16">
          <span className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#ebc32b' }} />
          <p className="font-body text-sm mt-3" style={{ color: '#5f6e8a' }}>Cargando apuestas...</p>
        </div>
      )}

      {!loading && bets.length === 0 && (
        <div className="rounded-2xl p-12 text-center" style={{ background: '#fff', border: '1px dashed #e8dfd0' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(235,195,43,.08)', border: '1px solid rgba(235,195,43,.2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c99f16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          <h3 className="font-display text-xl mb-2" style={{ color: '#0c182b', letterSpacing: '.02em' }}>
            No hay apuestas creadas
          </h3>
          <p className="font-body text-sm" style={{ color: '#a8b2c4' }}>
            Creá tu primera apuesta desde la pestaña "Nueva Apuesta"
          </p>
        </div>
      )}

      {openBets.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-display text-xl" style={{ color: '#0c182b', letterSpacing: '.02em' }}>ACTIVAS</h3>
            <span className="font-display text-lg" style={{ color: '#1b8a5a' }}>({openBets.length})</span>
          </div>
          <div className="flex flex-col gap-3">
            {openBets.map(bet => (<BetRow key={bet.id} bet={bet} onClose={handleClose} onReopen={handleReopen} />))}
          </div>
        </div>
      )}

      {closedBets.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-display text-xl" style={{ color: '#0c182b', letterSpacing: '.02em' }}>CERRADAS</h3>
            <span className="font-display text-lg" style={{ color: '#5f6e8a' }}>({closedBets.length})</span>
          </div>
          <div className="flex flex-col gap-3">
            {closedBets.map(bet => (<BetRow key={bet.id} bet={bet} onReopen={handleReopen} onFinalize={handleFinalize} />))}
          </div>
        </div>
      )}

      {finishedBets.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-display text-xl" style={{ color: '#0c182b', letterSpacing: '.02em' }}>FINALIZADAS</h3>
            <span className="font-display text-lg" style={{ color: '#c99f16' }}>({finishedBets.length})</span>
          </div>
          <div className="flex flex-col gap-3">
            {finishedBets.map(bet => (<BetRow key={bet.id} bet={bet} />))}
          </div>
        </div>
      )}
    </div>
  )
}
