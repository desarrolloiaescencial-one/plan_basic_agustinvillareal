/**
 * DashboardPage.jsx
 * Ubicación: src/dashboard/DashboardPage.jsx
 * ✅ INTEGRADO CON PredictModal
 * ✅ INTEGRADO CON Loading OVERLAY
 */
import { useState } from 'react'
import AppShell from '../dashboard/AppShell.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { useBets } from '../hooks/useBets.jsx'
import { isBetOpen, timeLeft } from '../utils/index.js'
import { Link } from 'react-router-dom'
import PredictModal from '../components/user/PredictModal.jsx'
import Loading from '../hooks/Loading.jsx'

function StatCard({ label, value, sub, icon, gold = false, live = false }) {
  const accentColor = live ? '#e03252' : gold ? '#c99f16' : '#425b8b'
  const borderColor = live ? 'rgba(224,50,82,.2)' : gold ? 'rgba(201,159,22,.3)' : '#f0eadb'
  const iconBg      = live ? 'rgba(224,50,82,.08)' : gold ? 'rgba(235,195,43,.1)' : 'rgba(66,91,139,.08)'
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 transition-all"
      style={{ background: '#fff', border: `1px solid ${borderColor}`, boxShadow: '0 1px 0 rgba(12,24,43,.04)' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(12,24,43,.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 0 rgba(12,24,43,.04)' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        <div style={{ color: accentColor }}>{icon}</div>
      </div>
      <div>
        <p className="font-display leading-none mb-1" style={{ fontSize: 'clamp(2.2rem,5vw,3rem)', color: accentColor }}>{value}</p>
        <p className="font-body font-bold text-xs uppercase tracking-widest" style={{ color: '#a8b2c4' }}>{label}</p>
        {sub && <p className="font-body text-xs mt-0.5" style={{ color: '#a8b2c4' }}>{sub}</p>}
      </div>
    </div>
  )
}

function BetRow({ bet, onPredict }) {
  const matchCount  = bet.partidos?.length || 0
  const remaining   = isBetOpen(bet) ? timeLeft(bet.fecha_cierre) : 'Cerrada'
  const closingSoon = remaining !== 'Cerrada' && !remaining.includes('d')
  const hasLive     = bet.partidos?.some(p => p.estado === 'en_vivo')
  return (
    <div
      onClick={() => onPredict(bet)}
      className="flex items-center gap-3 p-3.5 rounded-xl transition-all group cursor-pointer"
      style={{ background: '#fff', border: '1px solid #f0eadb', boxShadow: '0 1px 0 rgba(12,24,43,.04)' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#fffdf5'; e.currentTarget.style.borderColor = '#ebc32b'; e.currentTarget.style.transform = 'translateX(3px)' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#f0eadb'; e.currentTarget.style.transform = '' }}
    >
      <span className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: hasLive ? '#e03252' : '#ebc32b', boxShadow: hasLive ? '0 0 8px rgba(224,50,82,.5)' : '0 0 6px rgba(235,195,43,.5)' }} />
      <div className="flex-1 min-w-0">
        <p className="font-body font-semibold text-sm truncate" style={{ color: '#0c182b' }}>{bet.titulo}</p>
        <p className="font-body text-xs mt-0.5" style={{ color: '#5f6e8a' }}>
          {matchCount} {matchCount === 1 ? 'partido' : 'partidos'}
          {bet.premio && <span> · 🏆 {bet.premio}</span>}
        </p>
      </div>
      <span className="font-body text-xs font-semibold flex-shrink-0" style={{ color: closingSoon ? '#c99f16' : '#0c182b' }}>{remaining}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8b2c4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 transition-transform group-hover:translate-x-1">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  )
}

function LiveCard({ bet, predictions, onPredict }) {
  const liveMatch = bet.partidos?.find(p => p.estado === 'en_vivo') || bet.partidos?.[0]
  const myPred    = liveMatch ? predictions[liveMatch.id] : null
  return (
    <div 
      onClick={() => onPredict(bet)}
      className="rounded-2xl p-4 md:p-5 cursor-pointer transition-all"
      style={{ background: '#fff', border: '1.5px solid rgba(224,50,82,.3)', boxShadow: '0 4px 16px rgba(224,50,82,.08)' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(224,50,82,.15)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(224,50,82,.08)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full animate-pulse-live" style={{ background: '#e03252' }} />
        <span className="font-body font-bold text-xs uppercase tracking-widest" style={{ color: '#e03252' }}>
          {liveMatch?.minuto ? `EN VIVO · ${liveMatch.minuto}'` : 'EN VIVO'}
        </span>
        <span className="font-body text-xs ml-auto truncate" style={{ color: '#5f6e8a' }}>{bet.titulo}</span>
      </div>
      {liveMatch && (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="font-body font-semibold text-sm truncate" style={{ color: '#0c182b' }}>
              {liveMatch.equipo_local} <span style={{ color: '#a8b2c4' }}>vs</span> {liveMatch.equipo_visitante}
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-center">
              <p style={{ fontSize: 9, color: '#a8b2c4', textTransform: 'uppercase', letterSpacing: '.1em' }} className="font-body mb-0.5">Mi pred.</p>
              <p className="font-display text-xl leading-none" style={{ color: '#c99f16' }}>
                {myPred ? `${myPred.pred_local}-${myPred.pred_visitante}` : '—'}
              </p>
            </div>
            <div className="w-px h-8" style={{ background: '#f0eadb' }} />
            <div className="text-center">
              <p style={{ fontSize: 9, color: '#a8b2c4', textTransform: 'uppercase', letterSpacing: '.1em' }} className="font-body mb-0.5">Real</p>
              <p className="font-display text-xl leading-none" style={{ color: '#0c182b' }}>
                {liveMatch.goles_local ?? 0}-{liveMatch.goles_visitante ?? 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Empty({ icon, text, sub, to, cta }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl"
      style={{ background: '#fff', border: '1.5px dashed #f0eadb' }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
        style={{ background: 'rgba(235,195,43,.08)', border: '1px solid rgba(235,195,43,.2)' }}>
        <div style={{ color: '#c99f16' }}>{icon}</div>
      </div>
      <p className="font-body font-semibold text-sm" style={{ color: '#5f6e8a' }}>{text}</p>
      {sub && <p className="font-body text-xs mt-1" style={{ color: '#a8b2c4' }}>{sub}</p>}
      {to && cta && (
        <Link to={to} className="mt-4 inline-flex items-center gap-1.5 font-body font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full transition-all"
          style={{ background: '#ebc32b', color: '#05090f', textDecoration: 'none' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f5d75a' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#ebc32b' }}>
          {cta}
        </Link>
      )}
    </div>
  )
}

function SectionHead({ title, to, cta }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display" style={{ fontSize: '1.5rem', color: '#0c182b', letterSpacing: '.02em' }}>{title}</h2>
      {to && (
        <Link to={to} className="font-body font-semibold text-xs flex items-center gap-1.5 transition-colors"
          style={{ color: '#c99f16', textDecoration: 'none' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#0c182b' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#c99f16' }}>
          {cta}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </Link>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { bets, predictions, savePrediction, loading } = useBets()
  
  // ✅ ESTADO PARA CONTROLAR EL MODAL
  const [selectedBet, setSelectedBet] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeBets  = bets.filter(b => isBetOpen(b))
  const liveBets    = bets.filter(b => b.partidos?.some(p => p.estado === 'en_vivo'))
  const myPredCount = Object.keys(predictions).length
  const nombre      = (user?.nombre || '').split(' ')[0].toUpperCase()

  // ✅ FUNCIÓN PARA ABRIR EL MODAL
  const handlePredict = (bet) => {
    setSelectedBet(bet)
  }

  // ✅ FUNCIÓN PARA CERRAR EL MODAL
  const handleCloseModal = () => {
    setSelectedBet(null)
  }

  // ✅ FUNCIÓN PARA GUARDAR PREDICCIONES (con batches de 3 en paralelo)
  const handleSubmitPredictions = async (betId, matchPredictions) => {
    setIsSubmitting(true)
    
    try {
      const BATCH_SIZE = 3
      
      for (let i = 0; i < matchPredictions.length; i += BATCH_SIZE) {
        const batch = matchPredictions.slice(i, i + BATCH_SIZE)
        
        await Promise.all(
          batch.map(async (p) => {
            const payload = {
              apuesta_id: betId,
              partido_id: p.partido_id,
              pred_local: p.pred_local,
              pred_visitante: p.pred_visitante,
            }
            if (p.pred_clasificado) payload.pred_clasificado = p.pred_clasificado
            return savePrediction(payload)
          })
        )
      }
      
      // Cerrar modal después de guardar exitosamente
      setSelectedBet(null)
      setIsSubmitting(false)
    } catch (error) {
      console.error('Error guardando predicciones:', error)
      alert('Error al guardar predicciones. Por favor intentá de nuevo.')
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell>
      {/* ✅ LOADING OVERLAY - Se muestra ENCIMA del contenido mientras carga */}
      {loading && bets.length === 0 && (
        <Loading message="Cargando dashboard..." />
      )}

      {/* ✅ CONTENIDO - Siempre se renderiza */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>

        <div className="rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden animate-fade-in"
          style={{ background: '#0c182b', border: '1px solid rgba(235,195,43,.2)', boxShadow: '0 12px 40px rgba(12,24,43,.15)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 80% 20%, rgba(235,195,43,.12), transparent 65%)' }} />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-live" />
                <span className="font-body font-bold text-xs uppercase tracking-widest" style={{ color: 'rgba(235,195,43,.7)' }}>
                  Mundial 2026
                </span>
              </div>
              <h1 className="font-display leading-none mb-1" style={{ fontSize: 'clamp(2.2rem,6vw,3.5rem)', letterSpacing: '.02em' }}>
                <span className="text-white">HOLA, </span>
                <span style={{ color: '#ebc32b' }}>{nombre}</span>
              </h1>
              <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,.45)' }}>
                {activeBets.length > 0
                  ? `Tenés ${activeBets.length} apuesta${activeBets.length > 1 ? 's' : ''} activa${activeBets.length > 1 ? 's' : ''} disponible${activeBets.length > 1 ? 's' : ''}.`
                  : 'Acá está el resumen de tu actividad en Prode Talento.'}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link to="/partidos"
                className="inline-flex items-center gap-2 font-body font-bold text-sm px-5 py-3 rounded-full transition-all"
                style={{ background: '#ebc32b', color: '#05090f', boxShadow: '0 6px 20px rgba(235,195,43,.3)', textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f5d75a'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ebc32b'; e.currentTarget.style.transform = '' }}>
                Fixture
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
              <Link to="/ranking"
                className="inline-flex items-center gap-2 font-body font-semibold text-sm px-5 py-3 rounded-full transition-all"
                style={{ border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(235,195,43,.4)'; e.currentTarget.style.color = '#ebc32b' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)'; e.currentTarget.style.color = 'rgba(255,255,255,.7)' }}>
                Ranking
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in delay-1">
          <StatCard label="Puntos totales" value="—" sub="Sin partidos finalizados" gold
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
          />
          <StatCard label="Posición" value="—" sub="Ranking global" gold
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>}
          />
          <StatCard label="Predicciones" value={myPredCount || '—'} sub="Cargadas hasta ahora"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
          />
          <StatCard label="En vivo" value={liveBets.length} sub="Partidos ahora mismo" live={liveBets.length > 0}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>}
          />
        </div>

        {liveBets.length > 0 && (
          <div className="mb-8 animate-fade-in delay-2">
            <SectionHead title="EN VIVO AHORA" />
            <div className="grid gap-3">
              {liveBets.map(bet => <LiveCard key={bet.id} bet={bet} predictions={predictions} onPredict={handlePredict} />)}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 animate-fade-in delay-2">

          <div className="lg:col-span-2">
            <SectionHead title="APUESTAS ACTIVAS" to="/apuestas" cta="Ver todas" />
            {activeBets.length === 0 ? (
              <Empty
                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}
                text="No hay apuestas activas"
                sub="Aparecerán acá cuando el admin publique una."
                to="/apuestas"
                cta="Ver apuestas"
              />
            ) : (
              <div className="flex flex-col gap-2">
                {activeBets.slice(0, 5).map(bet => <BetRow key={bet.id} bet={bet} onPredict={handlePredict} />)}
                {activeBets.length > 5 && (
                  <Link to="/apuestas" className="text-center font-body text-sm py-2 transition-colors"
                    style={{ color: '#c99f16', textDecoration: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#0c182b' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#c99f16' }}>
                    +{activeBets.length - 5} más →
                  </Link>
                )}
              </div>
            )}
          </div>

          <div>
            <SectionHead title="ACCESOS RÁPIDOS" />
            <div className="flex flex-col gap-3">
              {[
                { to: '/apuestas',         label: 'Apuestas',         sub: 'Cargá tus pronósticos',    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
                { to: '/partidos',         label: 'Fixture',          sub: 'Partidos del Mundial',     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
                { to: '/mis-predicciones', label: 'Mis Predicciones', sub: 'Historial de pronósticos', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
                { to: '/ranking',          label: 'Ranking',          sub: 'Tabla de posiciones',      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> },
              ].map(({ to, label, sub, icon }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-3 p-3.5 rounded-xl transition-all group"
                  style={{ background: '#fff', border: '1px solid #f0eadb', textDecoration: 'none', boxShadow: '0 1px 0 rgba(12,24,43,.04)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fffdf5'; e.currentTarget.style.borderColor = '#ebc32b'; e.currentTarget.style.transform = 'translateX(3px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#f0eadb'; e.currentTarget.style.transform = '' }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#0c182b,#425b8b)', color: '#ebc32b' }}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-sm" style={{ color: '#0c182b' }}>{label}</p>
                    <p className="font-body text-xs" style={{ color: '#5f6e8a' }}>{sub}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8b2c4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className="flex-shrink-0 transition-transform group-hover:translate-x-1">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ✅ MODAL DE PREDICCIONES */}
      {selectedBet && (
        <PredictModal
          bet={selectedBet}
          onClose={handleCloseModal}
          onSubmit={handleSubmitPredictions}
          loading={isSubmitting}
        />
      )}
    </AppShell>
  )
}