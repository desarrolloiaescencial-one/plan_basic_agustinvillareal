/**
 * Eliminatorias.jsx — src/dashboard/Eliminatorias.jsx
 *
 * Bracket FIFA-style del Mundial 2026.
 * Diseño broadcast / editorial deportivo.
 * 
 * ✨ NUEVO: 
 * - Sistema de tamaños dinámicos (TBD → Programado → Live/Final)
 * - Sistema de colapso por fase (mostrar solo ganadores con banderas)
 *
 * 🎨 Paleta centralizada en THEME (editá una vez, cambia todo).
 */
import { useMemo, useState } from 'react'

// ──────────────────────────────────────────────────────────────────
// 🎨 PALETA — crema · azul medianoche · dorado · negro
// ──────────────────────────────────────────────────────────────────
const C = {
  cream:    '#f7f1e1',
  creamHi:  '#fcf8ec',
  ink:      '#0a1226',  // azul medianoche
  inkSoft:  '#1a2540',
  steel:    '#5f6e8a',
  mute:     '#a8b2c4',
  line:     '#e7dec6',
  gold:     '#d4a017',
  goldHi:   '#ebc32b',
  goldDeep: '#a87a0b',
  red:      '#e03252',
}

const FASES_ORDEN = ['16avos', 'octavos', 'cuartos', 'semis', '3er_puesto', 'final']
const FASES_LABEL = {
  '16avos':     'Round of 32',
  octavos:      'Round of 16',
  cuartos:      'Quarter-finals',
  semis:        'Semi-finals',
  '3er_puesto': 'Third place',
  final:        'Final',
}
const FASES_ES = {
  '16avos':     '16avos',
  octavos:      'Octavos',
  cuartos:      'Cuartos',
  semis:        'Semis',
  '3er_puesto': '3er puesto',
  final:        'Final',
}

const ESTADO = {
  programado: { label: 'Próximo',    dot: C.steel, fg: C.steel,  bg: 'rgba(95,110,138,.10)' },
  en_vivo:    { label: 'EN VIVO',    dot: C.red,   fg: C.red,    bg: 'rgba(224,50,82,.12)'  },
  finalizado: { label: 'FT',         dot: C.gold,  fg: C.goldDeep, bg: 'rgba(212,160,23,.12)' },
  cancelado:  { label: 'Cancelado',  dot: C.mute,  fg: C.mute,   bg: 'rgba(168,178,196,.12)' },
}

function formatFecha(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  return {
    dia:  d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }).toUpperCase().replace('.', ''),
    hora: d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
  }
}

// ──────────────────────────────────────────────────────────────────
// Fila de equipo — versión compacta o completa
// ──────────────────────────────────────────────────────────────────
function EquipoRow({ nombre, bandera, goles, golesPenales, ganador, perdedor, pendiente, compact }) {
  const tienePenales = golesPenales != null && golesPenales !== ''
  
  return (
    <div
      className="group/row flex items-center transition-colors"
      style={{
        padding: compact ? '4px 8px' : '10px 14px',
        gap: compact ? '6px' : '10px',
        background: ganador ? `linear-gradient(90deg, ${C.gold}1a 0%, transparent 70%)` : 'transparent',
        opacity: perdedor ? 0.55 : 1,
      }}
    >
      {/* Marca de ganador */}
      <span
        className="rounded-full transition-all"
        style={{ 
          width: compact ? '2px' : '3px',
          height: compact ? '16px' : '28px',
          background: ganador ? C.gold : 'transparent'
        }}
      />

      {/* Bandera */}
      {bandera ? (
        <img
          src={bandera}
          alt=""
          className="flex-shrink-0 rounded-[2px] object-cover shadow-sm"
          style={{ 
            width: compact ? '18px' : '26px',
            height: compact ? '12px' : '18px',
            border: `1px solid ${C.line}` 
          }}
        />
      ) : (
        <div
          className="flex-shrink-0 rounded-[2px]"
          style={{ 
            width: compact ? '18px' : '26px',
            height: compact ? '12px' : '18px',
            background: C.cream, 
            border: `1px dashed ${C.line}` 
          }}
        />
      )}

      {/* Nombre */}
      <span
        className="min-w-0 flex-1 truncate tracking-tight"
        style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: compact ? '0.65rem' : '0.82rem',
          fontWeight: ganador ? 800 : 600,
          color: pendiente ? C.mute : C.ink,
          fontStyle: pendiente ? 'italic' : 'normal',
          letterSpacing: ganador ? '-0.01em' : 'normal',
        }}
      >
        {nombre || 'TBD'}
      </span>

      {/* Penales */}
      {tienePenales && !compact && (
        <span
          className="rounded tabular-nums"
          style={{
            padding: '2px 6px',
            fontSize: '0.6rem',
            fontWeight: 700,
            color: ganador ? C.goldDeep : C.mute,
            background: ganador ? `${C.gold}25` : `${C.mute}1f`,
            fontFamily: "'DM Sans',sans-serif",
          }}
          title="Penales"
        >
          ({golesPenales})
        </span>
      )}

      {/* Goles */}
      <span
        className="text-right font-extrabold tabular-nums"
        style={{
          width: compact ? '16px' : '24px',
          fontSize: compact ? '0.85rem' : '1.05rem',
          fontFamily: "'DM Sans',sans-serif",
          color: ganador ? C.ink : (goles == null || goles === '' ? C.mute : C.steel),
        }}
      >
        {goles != null && goles !== '' ? goles : '–'}
      </span>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────
// Card de partido — TAMAÑO DINÁMICO según estado
// ──────────────────────────────────────────────────────────────────
function MatchCard({ match, faseLabel }) {
  const s = ESTADO[match.estado] || ESTADO.programado
  const live = match.estado === 'en_vivo'
  const fin  = match.estado === 'finalizado'
  const gl = match.goles_local
  const gv = match.goles_visitante
  const pl = match.penales_local
  const pv = match.penales_visit
  const tienePenales = pl != null && pl !== '' && pv != null && pv !== ''

  let ganaLocal = false
  let ganaVisit = false
  if (fin && gl != null && gv != null) {
    if (Number(gl) > Number(gv))      ganaLocal = true
    else if (Number(gv) > Number(gl)) ganaVisit = true
    else if (tienePenales) {
      if (Number(pl) > Number(pv))      ganaLocal = true
      else if (Number(pv) > Number(pl)) ganaVisit = true
    }
  }

  const sinEquipos = !match.equipo_local || !match.equipo_visitante
  const fecha = formatFecha(match.fecha_partido)

  // 🎯 SISTEMA DE TAMAÑOS DINÁMICOS — MÁS COMPACTOS
  // TBD (sin equipos) → 180px ultra-compacto
  // Con equipos programados → 220px intermedio  
  // En vivo o finalizado → 240px completo
  const anchoCard = sinEquipos ? 'w-[180px]' : (live || fin) ? 'w-[240px]' : 'w-[220px]'
  const compact = sinEquipos

  return (
    <div
      className={`group relative ${anchoCard} overflow-hidden rounded-[${compact ? '12px' : '14px'}] transition-all duration-300`}
      style={{
        background: '#ffffff',
        border: `1px solid ${fin ? C.gold + '55' : C.line}`,
        boxShadow: fin
          ? `0 1px 0 ${C.line}, 0 ${compact ? '12px' : '18px'} 40px -22px ${C.gold}55`
          : `0 1px 0 ${C.line}, 0 ${compact ? '8px' : '12px'} 28px -20px rgba(10,18,38,.18)`,
      }}
    >
      {/* Header tipo broadcast */}
      <div
        className="flex items-center justify-between gap-2"
        style={{
          padding: compact ? '6px 10px' : '8px 14px',
          background: `linear-gradient(180deg, ${C.creamHi} 0%, #ffffff 100%)`,
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Mostrar sede solo si existe y NO es "TBD" */}
          {!compact && match.sede && match.sede.toUpperCase() !== 'TBD' && (
            <>
              <span
                className="uppercase tracking-[0.14em]"
                style={{ 
                  fontSize: '0.58rem',
                  fontWeight: 800,
                  color: C.steel, 
                  fontFamily: "'DM Sans',sans-serif" 
                }}
              >
                {match.sede}
              </span>
              {fecha && (
                <span className="h-1 w-1 rounded-full" style={{ background: C.line }} />
              )}
            </>
          )}
          {/* Fecha y hora */}
          {fecha && !compact && (
            <span
              className="font-bold tabular-nums"
              style={{ 
                fontSize: '0.6rem',
                color: C.ink, 
                fontFamily: "'DM Sans',sans-serif" 
              }}
            >
              {fecha.dia} · {fecha.hora}
            </span>
          )}
          {/* Para partidos compact (sin equipos), mostrar solo "Por definir" */}
          {compact && (
            <span
              className="uppercase tracking-[0.14em] italic"
              style={{ 
                fontSize: '0.52rem',
                fontWeight: 600,
                color: C.mute, 
                fontFamily: "'DM Sans',sans-serif" 
              }}
            >
              Por definir
            </span>
          )}
        </div>

        {/* Status pill */}
        {!compact && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full text-[0.58rem] font-extrabold uppercase tracking-[0.1em]"
            style={{
              padding: '2px 8px',
              color: s.fg,
              background: s.bg,
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${live ? 'animate-pulse' : ''}`}
              style={{ background: s.dot }}
            />
            {live && match.minuto ? `${match.minuto}'` : s.label}
          </span>
        )}
      </div>

      {/* Equipos */}
      <div style={{ background: '#fff' }}>
        <EquipoRow
          nombre={match.equipo_local}
          bandera={match.bandera_local}
          goles={gl}
          golesPenales={tienePenales ? pl : null}
          ganador={ganaLocal}
          perdedor={fin && ganaVisit}
          pendiente={!match.equipo_local}
          compact={compact}
        />
        <div style={{ 
          height: '1px',
          margin: compact ? '0 10px' : '0 14px',
          background: C.line 
        }} />
        <EquipoRow
          nombre={match.equipo_visitante}
          bandera={match.bandera_visitante}
          goles={gv}
          golesPenales={tienePenales ? pv : null}
          ganador={ganaVisit}
          perdedor={fin && ganaLocal}
          pendiente={!match.equipo_visitante}
          compact={compact}
        />
      </div>

      {/* Footer info */}
      {(tienePenales || sinEquipos) && (
        <div
          className="text-center font-bold uppercase tracking-[0.12em]"
          style={{
            padding: compact ? '4px 10px' : '6px 14px',
            fontSize: compact ? '0.52rem' : '0.58rem',
            background: tienePenales ? `${C.gold}10` : C.creamHi,
            color: tienePenales ? C.goldDeep : C.mute,
            borderTop: `1px solid ${C.line}`,
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          {tienePenales ? 'Definido por penales' : (compact ? 'TBD' : 'Cruce por definir')}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────
// Columna de fase — CON SISTEMA DE COLAPSO
// ──────────────────────────────────────────────────────────────────
function ColumnaFase({ fase, partidos, idx, collapsed, onToggle }) {
  return (
    <div className="flex flex-col items-stretch gap-4">
      {/* Header de fase CLICKEABLE */}
      <div 
        className="relative flex items-center gap-3 cursor-pointer group/header"
        onClick={onToggle}
        style={{ userSelect: 'none' }}
      >
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] font-black tabular-nums transition-transform"
          style={{ 
            background: C.ink, 
            color: C.goldHi, 
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          {idx + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div
            className="text-[0.95rem] font-black leading-none tracking-tight"
            style={{ color: C.ink, fontFamily: "'DM Sans',sans-serif", letterSpacing: '-0.02em' }}
          >
            {FASES_ES[fase]}
          </div>
          <div
            className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em]"
            style={{ color: C.steel, fontFamily: "'DM Sans',sans-serif" }}
          >
            {FASES_LABEL[fase]} · {partidos.length}
          </div>
        </div>
        
        {/* Botón de colapso */}
        <button
          className="flex h-6 w-6 items-center justify-center rounded-md transition-all"
          style={{
            background: collapsed ? C.creamHi : 'rgba(10,18,38,.05)',
            border: `1px solid ${collapsed ? C.line : 'transparent'}`,
          }}
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
        >
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={C.steel} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{
              transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              transition: 'transform .2s ease',
            }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      {/* Cards O vista minimizada */}
      {collapsed ? (
        // ═══════════════════════════════════════════════════════════
        // VISTA MINIMIZADA: Formato VS compacto vertical
        // ═══════════════════════════════════════════════════════════
        <div className="flex flex-col gap-2">
          {partidos.length === 0 ? (
            <div
              className="rounded-lg px-4 py-6 text-center"
              style={{
                border: `1.5px dashed ${C.line}`,
                background: C.creamHi,
              }}
            >
              <span
                className="text-[0.65rem] font-semibold italic"
                style={{ color: C.mute, fontFamily: "'DM Sans',sans-serif" }}
              >
                Sin partidos
              </span>
            </div>
          ) : (
            partidos.map(m => {
              // Determinar ganador
              const gl = m.goles_local
              const gv = m.goles_visitante
              const pl = m.penales_local
              const pv = m.penales_visit
              const fin = m.estado === 'finalizado'
              
              let ganaLocal = false
              let ganaVisit = false
              
              if (fin && gl != null && gv != null) {
                if (Number(gl) > Number(gv)) ganaLocal = true
                else if (Number(gv) > Number(gl)) ganaVisit = true
                else if (pl != null && pl !== '' && pv != null && pv !== '') {
                  if (Number(pl) > Number(pv)) ganaLocal = true
                  else if (Number(pv) > Number(pl)) ganaVisit = true
                }
              }

              return (
                <div
                  key={m.id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2"
                  style={{
                    background: '#fff',
                    border: `1px solid ${C.line}`,
                  }}
                >
                  {/* TBD label - SOLO si NO hay equipos */}
                  {(!m.equipo_local || !m.equipo_visitante) && (
                    <div
                      className="flex h-6 items-center justify-center rounded px-2"
                      style={{
                        background: C.cream,
                        border: `1px solid ${C.line}`,
                      }}
                    >
                      <span
                        className="text-[0.5rem] font-bold uppercase tracking-wider"
                        style={{ color: C.steel, fontFamily: "'DM Sans',sans-serif" }}
                      >
                        TBD
                      </span>
                    </div>
                  )}

                  {/* Bandera Local */}
                  <div
                    className="relative flex-shrink-0 rounded transition-all"
                    style={{
                      padding: ganaLocal ? 2 : 0,
                      background: ganaLocal 
                        ? `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})` 
                        : 'transparent',
                      boxShadow: ganaLocal 
                        ? `0 2px 8px ${C.gold}50` 
                        : 'none',
                    }}
                  >
                    {m.bandera_local ? (
                      <img
                        src={m.bandera_local}
                        alt={m.equipo_local || 'TBD'}
                        className="rounded-sm"
                        style={{
                          width: 28,
                          height: 20,
                          objectFit: 'cover',
                          border: `1px solid ${C.line}`,
                        }}
                      />
                    ) : (
                      <div
                        className="rounded-sm"
                        style={{
                          width: 28,
                          height: 20,
                          background: C.cream,
                          border: `1px dashed ${C.line}`,
                        }}
                      />
                    )}
                  </div>

                  {/* VS */}
                  <span
                    className="text-[0.6rem] font-black uppercase"
                    style={{ color: C.mute, fontFamily: "'DM Sans',sans-serif" }}
                  >
                    vs
                  </span>

                  {/* Bandera Visitante */}
                  <div
                    className="relative flex-shrink-0 rounded transition-all"
                    style={{
                      padding: ganaVisit ? 2 : 0,
                      background: ganaVisit 
                        ? `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})` 
                        : 'transparent',
                      boxShadow: ganaVisit 
                        ? `0 2px 8px ${C.gold}50` 
                        : 'none',
                    }}
                  >
                    {m.bandera_visitante ? (
                      <img
                        src={m.bandera_visitante}
                        alt={m.equipo_visitante || 'TBD'}
                        className="rounded-sm"
                        style={{
                          width: 28,
                          height: 20,
                          objectFit: 'cover',
                          border: `1px solid ${C.line}`,
                        }}
                      />
                    ) : (
                      <div
                        className="rounded-sm"
                        style={{
                          width: 28,
                          height: 20,
                          background: C.cream,
                          border: `1px dashed ${C.line}`,
                        }}
                      />
                    )}
                  </div>

                  {/* Marcador (si está finalizado) */}
                  {fin && gl != null && gv != null && (
                    <div
                      className="ml-auto flex items-center gap-1 rounded px-1.5 py-0.5"
                      style={{
                        background: `${C.gold}15`,
                        border: `1px solid ${C.gold}30`,
                      }}
                    >
                      <span
                        className="text-[0.65rem] font-extrabold tabular-nums"
                        style={{ 
                          color: ganaLocal ? C.goldDeep : C.steel,
                          fontFamily: "'DM Sans',sans-serif" 
                        }}
                      >
                        {gl}
                      </span>
                      <span
                        className="text-[0.5rem] font-bold"
                        style={{ color: C.mute, fontFamily: "'DM Sans',sans-serif" }}
                      >
                        -
                      </span>
                      <span
                        className="text-[0.65rem] font-extrabold tabular-nums"
                        style={{ 
                          color: ganaVisit ? C.goldDeep : C.steel,
                          fontFamily: "'DM Sans',sans-serif" 
                        }}
                      >
                        {gv}
                      </span>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      ) : (
        // VISTA COMPLETA: Cards normales
        <div className="flex flex-col gap-3">
          {partidos.length === 0 ? (
            <div
              className="rounded-[14px] px-4 py-8 text-center"
              style={{
                border: `1.5px dashed ${C.line}`,
                background: C.creamHi,
              }}
            >
              <div
                className="text-[0.7rem] font-semibold"
                style={{ color: C.mute, fontFamily: "'DM Sans',sans-serif" }}
              >
                Sin cruces aún
              </div>
            </div>
          ) : (
            partidos.map(m => <MatchCard key={m.id} match={m} faseLabel={FASES_ES[fase]} />)
          )}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────
// Componente principal — CON SESSIONSTORAGE
// ──────────────────────────────────────────────────────────────────
export default function Eliminatorias({ matches }) {
  // Estado de colapso por fase — persistido en sessionStorage
  const [collapsedFases, setCollapsedFases] = useState(() => {
    try {
      const saved = sessionStorage.getItem('eliminatorias_collapsed')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const toggleFase = (fase) => {
    setCollapsedFases(prev => {
      const newState = {
        ...prev,
        [fase]: !prev[fase]
      }
      // Guardar en sessionStorage
      try {
        sessionStorage.setItem('eliminatorias_collapsed', JSON.stringify(newState))
      } catch (e) {
        console.error('Error saving to sessionStorage:', e)
      }
      return newState
    })
  }

  const porFase = useMemo(() => {
    const map = {}
    FASES_ORDEN.forEach(f => { map[f] = [] })
    ;(matches || []).forEach(m => {
      if (m.fase && map[m.fase]) map[m.fase].push(m)
    })
    Object.keys(map).forEach(f => {
      map[f].sort((a, b) => {
        const da = a.fecha_partido ? new Date(a.fecha_partido).getTime() : 0
        const db = b.fecha_partido ? new Date(b.fecha_partido).getTime() : 0
        return da - db
      })
    })
    return map
  }, [matches])

  const totalPartidos = FASES_ORDEN.reduce((acc, f) => acc + porFase[f].length, 0)
  const enVivo = (matches || []).filter(m => m.estado === 'en_vivo').length
  const finalizados = (matches || []).filter(m => m.estado === 'finalizado' && FASES_ORDEN.includes(m.fase)).length

  if (totalPartidos === 0) {
    return (
      <div
        className="relative overflow-hidden rounded-[20px] px-8 py-16 text-center"
        style={{
          background: `linear-gradient(135deg, ${C.ink} 0%, ${C.inkSoft} 100%)`,
          color: C.cream,
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }}
        />
        <div
          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: `${C.gold}20`, border: `1px solid ${C.gold}50` }}
        >
          <span className="text-xl" style={{ color: C.goldHi }}>🏆</span>
        </div>
        <p
          className="mb-1 text-[1.05rem] font-black tracking-tight"
          style={{ fontFamily: "'DM Sans',sans-serif", color: C.creamHi, letterSpacing: '-0.02em' }}
        >
          Knockout Stage
        </p>
        <p
          className="text-[0.78rem]"
          style={{ fontFamily: "'DM Sans',sans-serif", color: C.mute }}
        >
          Los cruces se completarán al finalizar la fase de grupos
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[20px]" style={{ background: C.cream }}>
      {/* HERO HEADER tipo broadcast FIFA */}
      <div
        className="relative overflow-hidden px-6 py-5"
        style={{
          background: `linear-gradient(120deg, ${C.ink} 0%, ${C.inkSoft} 60%, ${C.ink} 100%)`,
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, ${C.gold}, ${C.goldHi}, ${C.gold})` }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: `${C.gold}60` }}
        />

        <div className="relative flex items-end justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div
              className="mb-1 text-[0.62rem] font-extrabold uppercase tracking-[0.3em]"
              style={{ color: C.goldHi, fontFamily: "'DM Sans',sans-serif" }}
            >
              FIFA World Cup · 2026
            </div>
            <h2
              className="text-[1.6rem] font-black leading-none tracking-tight"
              style={{
                fontFamily: "'DM Sans',sans-serif",
                color: C.creamHi,
                letterSpacing: '-0.035em',
              }}
            >
              Eliminatorias - <span style={{ color: C.goldHi }}>Camino a la Gloria</span>
            </h2>
            <p
              className="mt-1.5 text-[0.72rem] font-medium"
              style={{ color: C.mute, fontFamily: "'DM Sans',sans-serif" }}
            >
            Fase de eliminación directa
            </p>
          </div>

        </div>
      </div>

      {/* BRACKET */}
      <div className="overflow-x-auto px-3 py-6 [-webkit-overflow-scrolling:touch]">
        <div className="flex min-w-min items-start gap-4">
          {FASES_ORDEN.map((f, i) => (
            <ColumnaFase 
              key={f} 
              fase={f} 
              partidos={porFase[f]} 
              idx={i}
              collapsed={collapsedFases[f] || false}
              onToggle={() => toggleFase(f)}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{
          background: C.creamHi,
          borderTop: `1px solid ${C.line}`,
        }}
      >
        <span
          className="text-[0.62rem] font-bold uppercase tracking-[0.16em]"
          style={{ color: C.steel, fontFamily: "'DM Sans',sans-serif" }}
        >
          Live bracket · auto update
        </span>
        <div className="flex items-center gap-3">
          <Legend color={C.gold}  label="Clasifica" />
          <Legend color={C.red}   label="En vivo"  pulse />
          <Legend color={C.steel} label="Próximo"  />
        </div>
      </div>
    </div>
  )
}

function Legend({ color, label, pulse }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em]"
      style={{ color: C.steel, fontFamily: "'DM Sans',sans-serif" }}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${pulse ? 'animate-pulse' : ''}`}
        style={{ background: color }}
      />
      {label}
    </span>
  )
}