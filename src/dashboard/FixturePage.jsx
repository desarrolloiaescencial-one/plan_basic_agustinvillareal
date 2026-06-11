  /**
   * FixturePage.jsx — src/dashboard/FixturePage.jsx
   * 
   * CAMBIO: useBets() → useFixtureSWR() 
   * BENEFICIO: Datos se cargan al instante desde localStorage, se actualizan en background
   */
  import { useState, useMemo } from 'react'
  import AppShell from './AppShell.jsx'
  import { useFixtureSWR } from '../hooks/useFixtureSWR.js'
  import Eliminatorias from './Eliminatorias.jsx'


  const ESTADO = {
    programado: { label:'Programado', color:'#5f6e8a', bg:'rgba(95,110,138,.07)', border:'rgba(95,110,138,.18)' },
    en_vivo:    { label:'EN VIVO',    color:'#e03252', bg:'rgba(224,50,82,.08)',  border:'rgba(224,50,82,.25)'  },
    finalizado: { label:'Finalizado', color:'#c99f16', bg:'rgba(235,195,43,.08)', border:'rgba(235,195,43,.22)' },
    cancelado:  { label:'Cancelado',  color:'#a8b2c4', bg:'rgba(168,178,196,.07)',border:'rgba(168,178,196,.2)' },
  }
  const FASES = {
    grupos:'Fase de grupos','16avos':'16avos de final',octavos:'Octavos',
    cuartos:'Cuartos',semis:'Semifinales','3er_puesto':'3er puesto',final:'Final'
  }

  function Chip({ active, onClick, children }) {
    return (
      <button onClick={onClick} style={{ padding:'.32rem .75rem', borderRadius:99, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'.72rem', textTransform:'uppercase', letterSpacing:'.05em', cursor:'pointer', transition:'all .15s', background:active?'#0c182b':'#fff', color:active?'#ebc32b':'#5f6e8a', border:active?'1px solid transparent':'1px solid #f0eadb', boxShadow:active?'0 2px 8px rgba(12,24,43,.18)':'none' }}>
        {children}
      </button>
    )
  }
  function TabBtn({ active, onClick, icon, label }) {
    return (
      <button onClick={onClick} style={{ display:'flex', alignItems:'center', gap:'.4rem', padding:'.52rem 1.1rem', borderRadius:10, border:'none', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'.78rem', textTransform:'uppercase', letterSpacing:'.05em', cursor:'pointer', transition:'all .17s', background:active?'#0c182b':'transparent', color:active?'#ebc32b':'#5f6e8a', boxShadow:active?'0 2px 10px rgba(12,24,43,.2)':'none' }}>
        {icon}{label}
      </button>
    )
  }

  function PartidoCard({ match }) {
    const C = {
      cream:    '#f7f1e1',
      creamHi:  '#fcf8ec',
      ink:      '#0a1226',
      inkSoft:  '#1a2540',
      steel:    '#5f6e8a',
      mute:     '#a8b2c4',
      line:     '#e7dec6',
      gold:     '#d4a017',
      goldHi:   '#ebc32b',
      goldDeep: '#a87a0b',
      red:      '#e03252',
    }

    const s = ESTADO[match.estado] || ESTADO.programado
    const live = match.estado === 'en_vivo'
    const fin = match.estado === 'finalizado'
    const d = match.fecha_partido ? new Date(match.fecha_partido) : null
    
    const fecha = d ? {
      dia: d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }).toUpperCase().replace('.', ''),
      hora: d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    } : null

    const tienePenales = match.penales_local != null && match.penales_local !== '' &&
                        match.penales_visit != null && match.penales_visit !== ''

    return (
      <div
        className="group relative overflow-hidden rounded-[14px] transition-all duration-300"
        style={{
          background: '#fff',
          border: `1px solid ${fin ? C.gold + '55' : C.line}`,
          boxShadow: fin
            ? `0 1px 0 ${C.line}, 0 18px 40px -22px ${C.gold}55`
            : '0 1px 0 rgba(12,24,43,.04)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = fin
            ? `0 1px 0 ${C.line}, 0 18px 40px -22px ${C.gold}55`
            : '0 8px 22px rgba(12,24,43,.09)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = fin
            ? `0 1px 0 ${C.line}, 0 18px 40px -22px ${C.gold}55`
            : '0 1px 0 rgba(12,24,43,.04)'
        }}
      >
        {fin && (
          <span
            className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r"
            style={{ background: `linear-gradient(to bottom, ${C.goldHi}, ${C.goldDeep})` }}
          />
        )}

        <div
          style={{
            background: `linear-gradient(180deg, ${C.creamHi} 0%, #ffffff 100%)`,
            borderBottom: `1px solid ${C.line}`,
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: '0.62rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.12em',
                color: C.steel,
              }}
            >
              {match.fase ? FASES[match.fase] || match.fase : 'Sin fase'}
            </span>
            {match.grupo && (
              <>
                <span
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    background: C.line,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.12em',
                    color: C.steel,
                  }}
                >
                  {match.grupo}
                </span>
              </>
            )}
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 8px',
              borderRadius: 99,
              fontSize: '0.58rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              color: s.color,
              background: s.bg,
              border: `1px solid ${s.border}`,
              fontFamily: "'DM Sans',sans-serif",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: s.color,
                animation: live ? 'ldot 1.4s ease infinite' : 'none',
              }}
            />
            {live && match.minuto ? `${match.minuto}'` : s.label}
          </span>
        </div>

        <div style={{ padding: '14px 16px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              {match.bandera_local ? (
                <img
                  src={match.bandera_local}
                  alt=""
                  style={{
                    width: 26,
                    height: 18,
                    objectFit: 'cover',
                    borderRadius: 3,
                    border: `1px solid ${C.line}`,
                    flexShrink: 0,
                    boxShadow: '0 1px 3px rgba(12,24,43,.08)',
                  }}
                />
              ) : (
                <div style={{ width: 26, height: 18, borderRadius: 3, background: C.line, flexShrink: 0 }} />
              )}
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: C.ink,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {match.equipo_local || 'TBD'}
              </span>
            </div>

            <div style={{ textAlign: 'center', minWidth: 80 }}>
              {fin || live ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                    <span
                      style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: '1.5rem',
                        color: live ? C.red : C.ink,
                        letterSpacing: '.05em',
                        lineHeight: 1,
                      }}
                    >
                      {match.goles_local ?? 0}
                    </span>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.7rem', color: C.mute, fontWeight: 600 }}>:</span>
                    <span
                      style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: '1.5rem',
                        color: live ? C.red : C.ink,
                        letterSpacing: '.05em',
                        lineHeight: 1,
                      }}
                    >
                      {match.goles_visitante ?? 0}
                    </span>
                  </div>
                  {tienePenales && (
                    <div
                      style={{
                        marginTop: 4,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: `${C.gold}15`,
                        border: `1px solid ${C.gold}30`,
                        display: 'inline-block',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'DM Sans',sans-serif",
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          color: C.goldDeep,
                          textTransform: 'uppercase',
                          letterSpacing: '.08em',
                        }}
                      >
                        PEN {match.penales_local}-{match.penales_visit}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {fecha ? (
                    <>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.7rem', color: C.steel, marginBottom: 2 }}>
                        {fecha.dia}
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.1rem', color: C.ink, letterSpacing: '.04em' }}>
                        {fecha.hora}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.1rem', color: C.mute, letterSpacing: '.04em' }}>
                      — : —
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, justifyContent: 'flex-end' }}>
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: C.ink,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: 'right',
                }}
              >
                {match.equipo_visitante || 'TBD'}
              </span>
              {match.bandera_visitante ? (
                <img
                  src={match.bandera_visitante}
                  alt=""
                  style={{
                    width: 26,
                    height: 18,
                    objectFit: 'cover',
                    borderRadius: 3,
                    border: `1px solid ${C.line}`,
                    flexShrink: 0,
                    boxShadow: '0 1px 3px rgba(12,24,43,.08)',
                  }}
                />
              ) : (
                <div style={{ width: 26, height: 18, borderRadius: 3, background: C.line, flexShrink: 0 }} />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const C = {
    cream:    '#f7f1e1',
    creamHi:  '#fcf8ec',
    ink:      '#0a1226',
    inkSoft:  '#1a2540',
    steel:    '#5f6e8a',
    mute:     '#a8b2c4',
    line:     '#e7dec6',
    gold:     '#d4a017',
    goldHi:   '#ebc32b',
    goldDeep: '#a87a0b',
    red:      '#e03252',
    green:    '#1b8a5a',
  }

  function TablaGrupos({ matches }) {
    const [grupoSel, setGrupoSel] = useState(null)
    
    const grupos = useMemo(() => {
      const map = {}
      matches.filter(m => m.fase === 'grupos' && m.grupo).forEach(m => {
        const g = m.grupo
        if (!map[g]) map[g] = { letra: g, equipos: {}, partidos: [] }
        map[g].partidos.push(m)
        
        const proc = (nombre, bandera, gf, gc) => {
          if (!nombre) return
          if (!map[g].equipos[nombre]) {
            map[g].equipos[nombre] = { nombre, bandera, j: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0 }
          }
          const eq = map[g].equipos[nombre]
          if (m.estado === 'finalizado' && gf != null && gc != null) {
            eq.j++
            eq.gf += Number(gf)
            eq.gc += Number(gc)
            if (Number(gf) > Number(gc)) { eq.g++; eq.pts += 3 }
            else if (Number(gf) === Number(gc)) { eq.e++; eq.pts += 1 }
            else { eq.p++ }
          }
        }
        
        proc(m.equipo_local, m.bandera_local, m.goles_local, m.goles_visitante)
        proc(m.equipo_visitante, m.bandera_visitante, m.goles_visitante, m.goles_local)
      })
      
      return Object.values(map)
        .sort((a, b) => a.letra.localeCompare(b.letra))
        .map(g => ({
          ...g,
          sel: Object.values(g.equipos)
            .sort((a, b) => 
              b.pts - a.pts || 
              (b.gf - b.gc) - (a.gf - a.gc) || 
              b.gf - a.gf
            )
            .map((s, i) => ({ ...s, pos: i + 1, dif: s.gf - s.gc })),
        }))
    }, [matches])

    if (!grupos.length) {
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
            <span className="text-xl" style={{ color: C.goldHi }}>📊</span>
          </div>
          <p
            className="mb-1 text-[1.05rem] font-black tracking-tight"
            style={{ fontFamily: "'DM Sans',sans-serif", color: C.creamHi, letterSpacing: '-0.02em' }}
          >
            Tablas no disponibles
          </p>
          <p
            className="text-[0.78rem]"
            style={{ fontFamily: "'DM Sans',sans-serif", color: C.mute }}
          >
            Se calcularán automáticamente con los partidos del backend
          </p>
        </div>
      )
    }

    return (
      <div className="overflow-hidden rounded-[20px]" style={{ background: C.cream }}>
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
                Fase de Grupos - <span style={{ color: C.goldHi }}>Clasificación</span>
              </h2>
              <p
                className="mt-1.5 text-[0.72rem] font-medium"
                style={{ color: C.mute, fontFamily: "'DM Sans',sans-serif" }}
              >
                48 equipos · 12 grupos · Clasifican los 2 primeros
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.line}` }}>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setGrupoSel(null)}
              style={{
                padding: '6px 14px',
                borderRadius: 99,
                border: `1px solid ${!grupoSel ? C.gold : C.line}`,
                background: !grupoSel ? C.gold : '#fff',
                color: !grupoSel ? '#fff' : C.steel,
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.06em',
                cursor: 'pointer',
                transition: 'all .2s ease',
              }}
              onMouseEnter={e => {
                if (grupoSel !== null) {
                  e.currentTarget.style.borderColor = C.gold
                  e.currentTarget.style.color = C.goldDeep
                }
              }}
              onMouseLeave={e => {
                if (grupoSel !== null) {
                  e.currentTarget.style.borderColor = C.line
                  e.currentTarget.style.color = C.steel
                }
              }}
            >
              Todos los grupos
            </button>
            {grupos.map(g => (
              <button
                key={g.letra}
                onClick={() => setGrupoSel(g.letra)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 99,
                  border: `1px solid ${grupoSel === g.letra ? C.gold : C.line}`,
                  background: grupoSel === g.letra ? C.gold : '#fff',
                  color: grupoSel === g.letra ? '#fff' : C.steel,
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.06em',
                  cursor: 'pointer',
                  transition: 'all .2s ease',
                }}
                onMouseEnter={e => {
                  if (grupoSel !== g.letra) {
                    e.currentTarget.style.borderColor = C.gold
                    e.currentTarget.style.color = C.goldDeep
                  }
                }}
                onMouseLeave={e => {
                  if (grupoSel !== g.letra) {
                    e.currentTarget.style.borderColor = C.line
                    e.currentTarget.style.color = C.steel
                  }
                }}
              >
                Grupo {g.letra}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-6">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {grupos
              .filter(g => !grupoSel || g.letra === grupoSel)
              .map(g => (
                <GrupoCard key={g.letra} grupo={g} />
              ))}
          </div>
        </div>

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
            Actualización automática
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: `${C.gold}25`,
                  border: `1px solid ${C.gold}40`,
                }}
              />
              <span
                className="text-[0.6rem] font-semibold uppercase tracking-[0.1em]"
                style={{ color: C.steel, fontFamily: "'DM Sans',sans-serif" }}
              >
                Clasifica
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function GrupoCard({ grupo }) {
    const g = grupo
    const partidosJugados = g.partidos.filter(p => p.estado === 'finalizado').length

    return (
      <div
        className="overflow-hidden rounded-[14px] transition-all duration-300"
        style={{
          background: '#fff',
          border: `1px solid ${C.line}`,
          boxShadow: '0 1px 0 rgba(12,24,43,.04)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(12,24,43,.12)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = '0 1px 0 rgba(12,24,43,.04)'
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${C.ink}, ${C.inkSoft})`,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: `1px solid ${C.line}`,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${C.gold}15`,
              border: `1px solid ${C.gold}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: '1.3rem',
                color: C.goldHi,
                lineHeight: 1,
              }}
            >
              {g.letra}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: '1.1rem',
                color: C.creamHi,
                margin: 0,
                letterSpacing: '.05em',
                lineHeight: 1,
              }}
            >
              GRUPO {g.letra}
            </p>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,.5)',
                margin: '4px 0 0',
              }}
            >
              {g.sel.length} equipos · {partidosJugados}/{g.partidos.length} jugados
            </p>
          </div>
        </div>

        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: C.creamHi }}>
                <th
                  style={{
                    width: '36px',
                    padding: '8px 4px',
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.1em',
                    color: C.mute,
                    textAlign: 'center',
                    borderBottom: `1px solid ${C.line}`,
                  }}
                >
                  #
                </th>
                <th
                  style={{
                    padding: '8px 8px',
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.1em',
                    color: C.mute,
                    textAlign: 'left',
                    borderBottom: `1px solid ${C.line}`,
                  }}
                >
                  Equipo
                </th>
                {['J', 'G', 'E', 'P', 'GF', 'GC', 'DIF', 'PTS'].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      width: h === 'PTS' ? '46px' : h === 'DIF' ? '42px' : '32px',
                      padding: '8px 2px',
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.1em',
                      color: C.mute,
                      textAlign: 'center',
                      borderBottom: `1px solid ${C.line}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {g.sel.map((s, i) => {
                const clasifica = s.pos <= 2
                return (
                  <tr
                    key={s.nombre}
                    style={{
                      background: clasifica ? `${C.gold}05` : 'transparent',
                      borderBottom: i === g.sel.length - 1 ? 'none' : `1px solid ${C.line}`,
                    }}
                  >
                    <td style={{ padding: '10px 4px', textAlign: 'center' }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          background: clasifica ? `${C.gold}15` : `${C.ink}04`,
                          border: clasifica ? `1px solid ${C.gold}30` : `1px solid ${C.line}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Bebas Neue',sans-serif",
                            fontSize: '0.9rem',
                            color: clasifica ? C.goldDeep : C.mute,
                          }}
                        >
                          {s.pos}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        {s.bandera ? (
                          <img
                            src={s.bandera}
                            alt=""
                            style={{
                              width: 20,
                              height: 14,
                              objectFit: 'cover',
                              borderRadius: 2,
                              border: `1px solid ${C.line}`,
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 20,
                              height: 14,
                              borderRadius: 2,
                              background: C.line,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            color: C.ink,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontFamily: "'DM Sans',sans-serif",
                          }}
                        >
                          {s.nombre}
                        </span>
                        {clasifica && (
                          <span
                            style={{
                              fontSize: '0.5rem',
                              fontWeight: 700,
                              color: C.goldDeep,
                              background: `${C.gold}12`,
                              border: `1px solid ${C.gold}25`,
                              borderRadius: 3,
                              padding: '1px 4px',
                              fontFamily: "'DM Sans',sans-serif",
                              flexShrink: 0,
                            }}
                          >
                            CL
                          </span>
                        )}
                      </div>
                    </td>

                    {[s.j, s.g, s.e, s.p, s.gf, s.gc].map((v, idx) => (
                      <td
                        key={idx}
                        style={{
                          padding: '10px 2px',
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          color: C.steel,
                          fontFamily: "'DM Sans',sans-serif",
                        }}
                      >
                        {v}
                      </td>
                    ))}

                    <td
                      style={{
                        padding: '10px 2px',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: s.dif > 0 ? C.green : s.dif < 0 ? C.red : C.steel,
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      {s.dif > 0 ? `+${s.dif}` : s.dif}
                    </td>

                    <td style={{ padding: '10px 4px', textAlign: 'center' }}>
                      <span
                        style={{
                          fontFamily: "'Bebas Neue',sans-serif",
                          fontSize: '1.15rem',
                          color: C.ink,
                        }}
                      >
                        {s.pts}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: '8px 14px',
            borderTop: `1px solid ${C.line}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: C.creamHi,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: `${C.gold}25`,
              border: `1px solid ${C.gold}40`,
            }}
          />
          <span
            style={{
              fontSize: '0.62rem',
              color: C.mute,
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Clasifica a 16avos de final
          </span>
        </div>
      </div>
    )
  }

  export { TablaGrupos }

  export default function FixturePage() {
    // ✅ CAMBIO: useFixtureSWR() en lugar de useBets()
    // Esto hace que los datos se carguen desde localStorage (al instante)
    // y se actualicen en background sin bloquear la UI
    const { fixture: matches, isLoading: loading } = useFixtureSWR()

    const [tab, setTab] = useState('fixture')
    const [faseFilter, setFaseFilter] = useState('')
    const [estadoFilter, setEstadoFilter] = useState('')
    const [search, setSearch] = useState('')

  const fases = useMemo(()=>[...new Set((matches || []).map(m=>m.fase).filter(Boolean))],[matches])  
  const filtered = useMemo(()=>(matches || []).filter(m=>{
      if(faseFilter && m.fase!==faseFilter) return false
      if(estadoFilter && m.estado!==estadoFilter) return false
      if(search){const s=search.toLowerCase();if(!m.equipo_local?.toLowerCase().includes(s)&&!m.equipo_visitante?.toLowerCase().includes(s)) return false}
      return true
    }),[matches,faseFilter,estadoFilter,search])
    
    const groups = useMemo(()=>{
      const map={}
      filtered.forEach(m=>{
        const key=[FASES[m.fase]||m.fase||'Sin fase',m.jornada].filter(Boolean).join(' · ')
        if(!map[key]) map[key]=[]
        map[key].push(m)
      })
      return map
    },[filtered])

    return (
      <AppShell>
        <style>{`
          @keyframes ldot{0%,100%{opacity:1}50%{opacity:.35}}
          @keyframes din{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
          .din{animation:din .38s ease both}
          @keyframes skp{0%,100%{opacity:.7}50%{opacity:.3}}
        `}</style>

        <div style={{ maxWidth:1400, margin:'0 auto', padding:'2rem 1.5rem 3rem' }}>

<div className="din" style={{ marginBottom:'1.5rem' }}>
  <h1 style={{
    fontFamily:"'Bebas Neue',sans-serif",
    fontSize:'clamp(2.4rem,6vw,3.5rem)',
    margin:'0 0 .3rem',
    lineHeight:1,
    letterSpacing:'.02em',
  }}>
    <span style={{color:'#0c182b'}}>CRONOGRAMA </span>
    <span style={{color:'#ebc32b'}}>MUNDIALISTA</span>
  </h1>
  <p style={{ fontSize:'.84rem', color:'#5f6e8a', margin:0 }}>{matches?.length || 0} partidos del Mundial 2026</p>
</div>

          <div className="din" style={{ display:'flex', gap:'.3rem', padding:'.3rem', background:'#fff', border:'1px solid #f0eadb', borderRadius:14, width:'fit-content', marginBottom:'1.75rem', animationDelay:'40ms' }}>
            <TabBtn active={tab==='fixture'} onClick={()=>setTab('fixture')} label="Fixture"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
            />
            <TabBtn active={tab==='grupos'} onClick={()=>setTab('grupos')} label="Grupos"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>}
            />
            <TabBtn active={tab==='Eliminatoria'} onClick={()=>setTab('Eliminatoria')} label="Eliminatoria"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>}
            />
          </div>

          {loading && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1rem' }}>
              {[...Array(6)].map((_,i)=><div key={i} style={{ height:100, borderRadius:14, background:'#fff', border:'1px solid #f0eadb', animation:'skp 1.4s ease-in-out infinite' }}/>)}
            </div>
          )}

          {!loading && tab==='fixture' && (
            <div className="din">
              <div style={{ display:'flex', flexWrap:'wrap', gap:'.6rem', marginBottom:'1.5rem' }}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar equipo..."
                  style={{ padding:'.42rem .9rem', borderRadius:99, border:'1px solid #f0eadb', background:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:'.82rem', color:'#0c182b', outline:'none', minWidth:180 }}
                  onFocus={e=>{ e.target.style.borderColor='rgba(235,195,43,.5)' }}
                  onBlur={e=>{ e.target.style.borderColor='#f0eadb' }}/>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'.25rem' }}>
                  <Chip active={!faseFilter} onClick={()=>setFaseFilter('')}>Todas</Chip>
                  {fases.map(f=><Chip key={f} active={faseFilter===f} onClick={()=>setFaseFilter(f)}>{FASES[f]||f}</Chip>)}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'.25rem' }}>
                  <Chip active={!estadoFilter} onClick={()=>setEstadoFilter('')}>Todos</Chip>
                  {['en_vivo','programado','finalizado'].map(e=><Chip key={e} active={estadoFilter===e} onClick={()=>setEstadoFilter(e)}>{ESTADO[e].label}</Chip>)}
                </div>
              </div>
              {filtered.length===0
                ? <div style={{ borderRadius:18,padding:'3rem',textAlign:'center',background:'#fff',border:'1.5px dashed #f0eadb' }}><p style={{ fontWeight:600,color:'#5f6e8a',margin:0 }}>No hay partidos que coincidan</p></div>
                : <div style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>
                    {Object.entries(groups).map(([group,items])=>(
                      <div key={group}>
                        <p style={{ fontSize:'.7rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.12em',color:'rgba(235,195,43,.85)',marginBottom:'.7rem' }}>{group}</p>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'.8rem' }}>
                          {items.map(m=><PartidoCard key={m.id} match={m}/>)}
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {!loading && tab==='grupos' && <div className="din"><TablaGrupos matches={matches}/></div>}

          {!loading && tab==='Eliminatoria' && <div className="din"><Eliminatorias matches={matches}/></div>}

        </div>
      </AppShell>
    )
  }