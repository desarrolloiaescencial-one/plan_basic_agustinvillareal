import { useState } from 'react'
import AppShell from '../dashboard/AppShell.jsx'
import BetCard from '../components/user/BetCard.jsx'
import PredictModal from '../components/user/PredictModal.jsx'
import { useBets } from '../hooks/useBets.jsx'

const FILTERS = ['todas', 'activas', 'cerradas']

export default function BetsPage() {
  const { bets, predictions, loading, savePrediction } = useBets()
  const [filter, setFilter]     = useState('todas')
  const [activeBet, setActiveBet] = useState(null)

  const filtered = bets.filter(b => {
    if (filter === 'activas')  return b.estado === 'abierta'
    if (filter === 'cerradas') return b.estado === 'cerrada' || b.estado === 'finalizada'
    return true
  })

  async function handlePredict(betId, matchPredictions) {
    try {
      await Promise.all(
        matchPredictions.map(p => savePrediction({
          apuesta_id: betId,
          partido_id: p.partido_id,
          pred_local: p.pred_local,
          pred_visitante: p.pred_visitante
        }))
      )
      setActiveBet(null)
      alert('Tus predicciones se han guardado con éxito.')
    } catch (err) {
      alert(err.message || 'No se pudieron guardar las predicciones')
    }
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>

        {/* Header */}
        <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <h1 className="font-display leading-none tracking-wide mb-2"
              style={{ fontSize: 'clamp(2.8rem,7vw,4rem)', color: '#0c182b' }}>
              APUESTAS
            </h1>
            <p className="font-body text-sm" style={{ color: '#5f6e8a' }}>
              {bets.length} {bets.length === 1 ? 'apuesta disponible' : 'apuestas disponibles'}
            </p>
          </div>

          {/* Filtros */}
          <div
            className="inline-flex gap-1 p-1 rounded-xl self-start md:self-auto"
            style={{
              background: '#fff',
              border: '1px solid #f0eadb',
              boxShadow: '0 1px 0 rgba(12,24,43,.04)',
            }}
          >
            {FILTERS.map(f => {
              const active = filter === f
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-4 py-2 text-xs font-body font-bold uppercase tracking-wider rounded-lg transition-all"
                  style={{
                    background: active ? '#0c182b' : 'transparent',
                    color: active ? '#ebc32b' : '#5f6e8a',
                    boxShadow: active ? '0 2px 8px rgba(12,24,43,.25)' : 'none',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#0c182b' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#5f6e8a' }}
                >
                  {f}
                </button>
              )
            })}
          </div>
        </div>

        {/* Lista */}
        <div className="grid gap-4">
          {filtered.map((bet, i) => (
            <div
              key={bet.id}
              className={`animate-fade-in delay-${Math.min(i + 1, 5)}`}
            >
              <BetCard
                bet={bet}
                predictionsMap={predictions}
                onPredict={setActiveBet}
              />
            </div>
          ))}

          {filtered.length === 0 && !loading && (
            <div
              className="rounded-2xl p-12 text-center animate-fade-in"
              style={{
                background: '#fff',
                border: '1.5px dashed #f0eadb',
              }}
            >
              <svg
                width="48" height="48" viewBox="0 0 24 24" fill="none"
                stroke="#a8b2c4" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
                className="mx-auto mb-4"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <p className="font-body font-semibold text-base mb-1" style={{ color: '#5f6e8a' }}>
                {filter === 'todas'
                  ? 'Todavía no hay apuestas publicadas'
                  : filter === 'activas'
                    ? 'No hay apuestas activas en este momento'
                    : 'No hay apuestas cerradas todavía'}
              </p>
              <p className="font-body text-xs" style={{ color: '#a8b2c4' }}>
                {filter === 'todas'
                  ? 'Las próximas apuestas van a aparecer acá cuando se publiquen.'
                  : filter === 'activas'
                    ? 'Probá cambiar el filtro o volvé a revisar más tarde.'
                    : 'Una vez que cierren las apuestas actuales vas a poder verlas acá.'}
              </p>
            </div>
          )}

          {filtered.length === 0 && loading && (
            <div className="text-center py-16">
              <span className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#0c182b', borderTopColor: 'transparent' }} />
              <p className="font-body text-sm mt-3" style={{ color: '#5f6e8a' }}>Cargando apuestas...</p>
            </div>
          )}
        </div>

        {/* Modal de predicción */}
        <PredictModal
          bet={activeBet}
          onSubmit={handlePredict}
          onClose={() => setActiveBet(null)}
          loading={loading}
        />

      </div>
    </AppShell>
  )
}