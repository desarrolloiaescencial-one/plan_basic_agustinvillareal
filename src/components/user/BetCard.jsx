import { timeLeft, isBetOpen } from '../../utils/index.js'
import { useAuth } from '../../hooks/useAuth.jsx'

/* ── Colores y labels por estado de apuesta ──────────────── */
const STATE_STYLES = {
  en_vivo: {
    border: 'rgba(224,50,82,.45)',
    glow: '0 0 32px rgba(224,50,82,.12)',
    label: 'EN VIVO',
    color: '#e03252',
    bg: 'rgba(224,50,82,.1)',
  },
  abierta: {
    border: 'rgba(66,91,139,.6)',
    glow: '0 0 24px rgba(66,91,139,.15)',
    label: 'ABIERTA',
    color: '#7b9fd4',
    bg: 'rgba(66,91,139,.18)',
  },
  finalizada: {
    border: 'rgba(235,195,43,.35)',
    glow: '0 0 24px rgba(235,195,43,.08)',
    label: 'FINALIZADA',
    color: '#c99f16',
    bg: 'rgba(235,195,43,.1)',
  },
  cerrada: {
    border: 'rgba(30,59,110,.65)',
    glow: 'none',
    label: 'CERRADA',
    color: '#4a6899',
    bg: 'rgba(30,59,110,.2)',
  },
}
/* ── Ícono de trofeo (premio) ───────────────────────────── */
function TrophyIcon({ size = 14, color = 'var(--color-warn)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

/* ── Ícono de reloj (countdown) ─────────────────────────── */
function ClockIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

/* ── Bandera del equipo (con fallback si no hay imagen) ─── */
function Bandera({ url, alt = '' }) {
  if (!url) return null
  return (
    <img
      src={url}
      alt={alt}
      className="w-7 h-5 object-cover rounded-[3px] flex-shrink-0 shadow-sm"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
    />
  )
}

/* ── Badge genérico (tipo pill) ─────────────────────────── */
function Pill({ children, color, bg, border, icon }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-body font-bold uppercase tracking-wider whitespace-nowrap"
      style={{ background: bg, color, border: `1px solid ${border}` }}
    >
      {icon}
      {children}
    </span>
  )
}

export default function BetCard({ bet, predictionsMap, onPredict }) {
  const { user, isPro } = useAuth()

  const open = isBetOpen(bet) && (!bet.fecha_cierre || new Date(bet.fecha_cierre) > new Date())
  const isLive = bet.partidos?.some(p => p.estado === 'en_vivo')
  const allFinished = bet.partidos?.length > 0 && bet.partidos.every(p => p.estado === 'finalizado')

  // Estado visual de la apuesta
  const state = isLive
    ? 'en_vivo'
    : allFinished
      ? 'finalizada'
      : open
        ? 'abierta'
        : 'cerrada'

  const style = STATE_STYLES[state]

  const matchCount = bet.partidos?.length || 0
  const hasAnyPrediction = bet.partidos?.some(p => predictionsMap?.[p.id])
  const remaining = timeLeft(bet.fecha_cierre)
  const isClosingSoon = open && remaining !== 'Cerrada' && !remaining.includes('d')

  /* ── NUEVO: Lógica de grupal / rol del usuario ─────── */
  const esGrupal = bet.tipo === 'grupos'
  const esJefe = user?.tipo_usuario === 'jefe'
  const areaUsuario = user?.area_id
  const areasParticipantes = bet.areas_ids
    ? String(bet.areas_ids).split(',').map(id => id.trim())
    : []
  const miAreaParticipa = areaUsuario && areasParticipantes.includes(String(areaUsuario))
  const soyReferente = esGrupal && esJefe && miAreaParticipa

  // Buscar el nombre del jefe (cargador) mirando alguna predicción del área
  const primeraPredGrupal = bet.partidos?.map(p => predictionsMap?.[p.id]).find(
    pred => pred && pred.es_grupal
  )
  const nombreJefe = primeraPredGrupal?.cargada_por_nombre || ''

  // ¿Soy general en una grupal que no cargó nada aún?
  const soyGeneralSinPrediccion = esGrupal && !esJefe && miAreaParticipa && !hasAnyPrediction

  // Texto del botón según contexto
  let actionLabel = null
  if (esGrupal && !esJefe && miAreaParticipa) {
    // General en grupal → cambia el label
    actionLabel = hasAnyPrediction ? 'Ver predicciones del área' : 'Ver apuesta'
  } else if (!open) {
    actionLabel = hasAnyPrediction ? 'Ver mi predicción' : null
  } else {
    actionLabel = hasAnyPrediction ? 'Editar predicción' : 'Apostar'
  }

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: 'linear-gradient(145deg, #0f2145 0%, #0a1830 100%)',
        border: `1px solid ${style.border}`,
        boxShadow: `0 10px 30px rgba(0,0,0,0.35), ${style.glow}`,
      }}
    >
      <div className="p-5 md:p-6">

        {/* Header: título + badges de estado/tipo */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-2xl md:text-3xl style={{ color: '#d0daf0' }} tracking-wide leading-tight truncate">
              {bet.titulo}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] font-body mt-1">
              {matchCount} {matchCount === 1 ? 'partido' : 'partidos'}
            </p>
          </div>

          {/* Contenedor de badges - se apilan si hay muchos */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <Pill color={style.color} bg={style.bg} border={style.border}
              icon={state === 'en_vivo'
                ? <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-live)] animate-pulse-live" />
                : null
              }
            >
              {style.label}
            </Pill>

            {/* Badge de tipo: GRUPAL / INDIVIDUAL — solo Plan_pro */}
            {isPro && (esGrupal ? (
              <Pill
                color="var(--color-warn)"
                bg="rgba(244,180,42,0.12)"
                border="rgba(244,180,42,0.4)"
              >
                Grupal
              </Pill>
            ) : (
              <Pill
                color="var(--color-accent)"
                bg="rgba(34,217,223,0.1)"
                border="rgba(34,217,223,0.3)"
              >
                Individual
              </Pill>
            ))}

            {/* Badge de "SOS REFERENTE" si sos jefe en una grupal que te incluye */}
            {soyReferente && (
              <Pill
                color="#10b981"
                bg="rgba(16,185,129,0.12)"
                border="rgba(16,185,129,0.4)"
                icon={
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15 8.5 22 9.3 17 14 18.5 21 12 17.8 5.5 21 7 14 2 9.3 9 8.5" />
                  </svg>
                }
              >
                Sos referente
              </Pill>
            )}
          </div>
        </div>

        {/* NUEVO: Warning cuando el general está esperando que su jefe cargue */}
        {soyGeneralSinPrediccion && open && (
          <div
            className="flex items-start gap-2.5 mb-4 px-3 py-2.5 rounded-lg"
            style={{
              background: 'rgba(244,180,42,0.08)',
              border: '1px solid rgba(244,180,42,0.25)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-warn)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-xs font-body text-[var(--color-warn)] leading-relaxed">
              Tu referente todavía no cargó las predicciones del área. Recordáselo antes de que cierre la apuesta.
            </p>
          </div>
        )}

        {/* NUEVO: Info sutil cuando el general SÍ tiene predicciones del jefe */}
        {esGrupal && !esJefe && miAreaParticipa && hasAnyPrediction && nombreJefe && (
          <div
            className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg"
            style={{
              background: 'rgba(34,217,223,0.06)',
              border: '1px solid rgba(34,217,223,0.2)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className="text-xs font-body text-[var(--color-text-muted)]">
              Predicciones cargadas por <span className="text-[var(--color-accent)] font-semibold">{nombreJefe}</span>
            </p>
          </div>
        )}

        {/* Countdown destacado (solo si está abierta) */}
        {open && (
          <div
            className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg"
            style={{
              background: 'rgba(2,15,39,0.5)',
              border: `1px solid ${isClosingSoon ? 'rgba(244,180,42,0.3)' : 'rgba(34,217,223,0.2)'}`,
            }}
          >
            <div style={{ color: isClosingSoon ? 'var(--color-warn)' : 'var(--color-accent)' }}>
              <ClockIcon size={14} />
            </div>
            <span className="text-[10px] font-body uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              Cierra en
            </span>
            <span
              className="font-display text-xl tracking-wide ml-auto"
              style={{ color: isClosingSoon ? 'var(--color-warn)' : 'var(--color-accent)' }}
            >
              {remaining}
            </span>
          </div>
        )}

        {/* Partidos */}
        {matchCount > 0 && (
          <div className="flex flex-col gap-2 mb-4">
            {bet.partidos.map(match => {
              const pred = predictionsMap?.[match.id]
              const isFinished = match.estado === 'finalizado'
              const isMatchLive = match.estado === 'en_vivo'
              const hasRealScore = isFinished || isMatchLive

              return (
                <div
                  key={match.id}
                  className="rounded-lg p-3"
                  style={{
                    background: 'rgba(2,15,39,0.4)',
                    border: `1px solid ${isMatchLive ? 'rgba(255,61,113,0.25)' : 'var(--color-border)'}`,
                  }}
                >
                  {/* Fila equipos + banderas */}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Bandera url={match.bandera_local} alt={match.equipo_local} />
                      <span className="font-body font-semibold  text-sm truncate">
                        {match.equipo_local}style={{ color: '#d0daf0' }}
                      </span>
                    </div>

                    <span className="font-display text-lg text-[var(--color-text-faint)] px-2">
                      vs
                    </span>

                    <div className="flex items-center gap-2 min-w-0 justify-end">
                      <span className="font-body font-semibold style={{ color: '#d0daf0' }} text-sm truncate text-right">
                        {match.equipo_visitante}
                      </span>
                      <Bandera url={match.bandera_visitante} alt={match.equipo_visitante} />
                    </div>
                  </div>
  

                  {/* Scores: predicción + real (si corresponde) */}
                  {(pred || hasRealScore) && (
                    <div className="flex items-center justify-center gap-5 mt-3 pt-3 border-t border-[var(--color-border)]">
                      {pred && (
                        <div className="text-center">
                          <p className="text-[9px] font-body uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-0.5">
                            {pred.es_grupal ? 'Predicción área' : 'Tu predicción'}
                          </p>
                          <p className="font-display text-xl text-[var(--color-accent)] leading-none">
                            {pred.pred_local} - {pred.pred_visitante}
                          </p>
                        </div>
                      )}

                      {hasRealScore && (
                        <>
                          {pred && <div className="w-px h-8 bg-[var(--color-border)]" />}
                          <div className="text-center">
                            <p className="text-[9px] font-body uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-0.5">
                              {isMatchLive ? 'En vivo' : 'Resultado'}
                            </p>
                            <p
                              className="font-display text-xl leading-none"
                              style={{ color: isMatchLive ? 'var(--color-live)' : 'var(--color-text)' }}
                            >
                              {match.goles_local ?? 0} - {match.goles_visitante ?? 0}
                            </p>
                          </div>
                        </>
                      )}

                      {pred?.puntos !== '' && pred?.puntos !== undefined && pred?.puntos !== null && (
                        <>
                          <div className="w-px h-8 bg-[var(--color-border)]" />
                          <div className="text-center">
                            <p className="text-[9px] font-body uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-0.5">
                              Puntos
                            </p>
                            <p className="font-display text-xl text-[var(--color-warn)] leading-none">
                              {pred.puntos}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Premio destacado */}
        {bet.premio && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(244,180,42,0.12) 0%, rgba(244,180,42,0.04) 100%)',
              border: '1px solid rgba(244,180,42,0.3)',
            }}
          >
            <div
              className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(244,180,42,0.15)' }}
            >
              <TrophyIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-body font-bold uppercase tracking-[0.15em] text-[var(--color-warn)] mb-0.5">
                Premio
              </p>
              <p className="font-body font-semibold style={{ color: '#d0daf0' }} text-sm truncate">
                {bet.premio}
              </p>
            </div>
          </div>
        )}

        {/* Acción */}
        {actionLabel && (
          <button
            onClick={() => onPredict(bet)}
            disabled={!open && !hasAnyPrediction}
            className="w-full font-body font-bold text-sm py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: open && (!esGrupal || esJefe)
                ? 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-bright) 100%)'
                : 'transparent',
              color: open && (!esGrupal || esJefe) ? '#020F27' : 'var(--color-accent)',
              border: open && (!esGrupal || esJefe) ? 'none' : '1px solid rgba(34,217,223,0.4)',
              boxShadow: open && (!esGrupal || esJefe) ? '0 6px 20px rgba(34,217,223,0.3)' : 'none',
            }}
            onMouseEnter={e => {
              if (open && (!esGrupal || esJefe)) {
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(34,217,223,0.5)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              } else {
                e.currentTarget.style.background = 'rgba(34,217,223,0.08)'
              }
            }}
            onMouseLeave={e => {
              if (open && (!esGrupal || esJefe)) {
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(34,217,223,0.3)'
                e.currentTarget.style.transform = 'translateY(0)'
              } else {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            {actionLabel}
          </button>
        )}

        {!actionLabel && !open && (
          <p className="text-center text-xs text-[var(--color-text-faint)] font-body py-2">
            Apuesta cerrada
          </p>
        )}

      </div>
    </div>
  )
}