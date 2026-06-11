import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

/* ══════════════════════════════════════════════════════════════
   MANUAL DEL ADMINISTRADOR — Prode ONE
   Rediseño editorial sobre paleta CLARA del sitio
   Cream + navy como tinta + dorado como acento
══════════════════════════════════════════════════════════════ */

/* ── Paleta (alineada con el resto del sitio) ── */
const C = {
  navyDeep:  '#05090f',
  navy:      '#0c182b',
  navySoft:  '#18243f',
  blueMed:   '#425b8b',
  blueSoft:  '#6e83ad',
  gold:      '#ebc32b',
  goldLt:    '#f5d75a',
  goldDk:    '#c99f16',
  cream:     '#faf7f0',
  cream2:    '#f0eadb',
  cream3:    '#e8e0c9',
  ink700:    '#2b3a5a',
  ink500:    '#5f6e8a',
  ink300:    '#a8b2c4',
  red:       '#b8452e',
  green:     '#1b8a5a',
  white:     '#ffffff',
}

/* ── Estructura de secciones ── */
const SECTIONS = [
  { id:'intro',         num:'01', label:'¿Qué hace el admin?',     group:'Introducción'         },
  { id:'acceso',        num:'02', label:'Acceso al panel',         group:'Introducción'         },
  { id:'estrategia',    num:'03', label:'Estrategia de apuestas',  group:'Gestión de Torneos'   },
  { id:'fases',         num:'04', label:'Las 6 fases del Mundial', group:'Gestión de Torneos'   },
  { id:'crear-apuesta', num:'05', label:'Crear una apuesta',       group:'Gestión de Torneos'   },
  { id:'partidos',      num:'06', label:'Asignar partidos',        group:'Gestión de Torneos'   },
  { id:'ciclo',         num:'07', label:'Ciclo de vida',           group:'Gestión de Torneos'   },
  { id:'usuarios',      num:'08', label:'Aprobar usuarios',        group:'Usuarios & Premios'   },
  { id:'areas',         num:'09', label:'Gestionar áreas',         group:'Usuarios & Premios'   },
  { id:'premios',       num:'10', label:'Definir premios',         group:'Usuarios & Premios'   },
  { id:'ranking',       num:'11', label:'Ranking & ganadores',     group:'Usuarios & Premios'   },
  { id:'puntuacion',    num:'12', label:'Sistema de puntos',       group:'Referencia'           },
  { id:'checklist',     num:'13', label:'Checklist rápido',        group:'Referencia'           },
]

const GROUPS = ['Introducción','Gestión de Torneos','Usuarios & Premios','Referencia']

/* ──────────────────────────────────────────────
   PIEZAS DE TIPOGRAFÍA / TEXTO
────────────────────────────────────────────── */

function P({ children }) {
  return (
    <p style={{
      fontFamily:"'DM Sans',sans-serif",
      fontSize:15.5, lineHeight:1.75, color:C.ink700,
      margin:'0 0 14px',
    }}>
      {children}
    </p>
  )
}

const B = ({ children }) => <strong style={{ color:C.navy, fontWeight:700 }}>{children}</strong>
const I = ({ children }) => <em style={{ color:C.goldDk, fontStyle:'normal', fontWeight:600 }}>{children}</em>

const Code = ({ children }) => (
  <code style={{
    fontFamily:"'JetBrains Mono','SF Mono',monospace",
    background:'rgba(12,24,43,.06)',
    border:'1px solid rgba(12,24,43,.12)',
    padding:'2px 8px', borderRadius:6,
    fontSize:13, color:C.navy, fontWeight:600,
  }}>{children}</code>
)

/* ──────────────────────────────────────────────
   HEADER DE SECCIÓN — editorial, asimétrico
────────────────────────────────────────────── */

function SectionHeader({ num, kicker, title, icon }) {
  return (
    <div style={{ marginBottom:30, position:'relative' }}>
      {/* Número gigante en marca de agua */}
      <span style={{
        position:'absolute', top:-18, left:-4,
        fontFamily:"'Bebas Neue',sans-serif",
        fontSize:120, lineHeight:.85, letterSpacing:'.02em',
        color:'rgba(12,24,43,.05)',
        pointerEvents:'none', userSelect:'none',
        zIndex:0,
      }}>{num}</span>

      <div style={{ position:'relative', zIndex:1, paddingTop:14 }}>
        {kicker && (
          <span style={{
            display:'inline-flex', alignItems:'center', gap:7,
            fontFamily:"'DM Sans',sans-serif", fontWeight:700,
            fontSize:10, textTransform:'uppercase', letterSpacing:'.22em',
            color:C.goldDk, marginBottom:10,
          }}>
            <span style={{ width:18, height:1, background:C.goldDk }}/>
            {kicker}
          </span>
        )}
        <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
          {icon && (
            <div style={{
              width:42, height:42, borderRadius:12, flexShrink:0,
              background:`linear-gradient(135deg,${C.navy},${C.navySoft})`,
              border:`1px solid rgba(235,195,43,.35)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 6px 18px rgba(12,24,43,.18)',
              marginTop:4,
            }}>{icon}</div>
          )}
          <h2 style={{
            fontFamily:"'Bebas Neue',sans-serif",
            fontSize:'clamp(1.9rem, 3.2vw, 2.6rem)',
            color:C.navy, letterSpacing:'.02em', lineHeight:1,
            margin:0, flex:1,
          }}>{title}</h2>
        </div>
        <div style={{
          height:2, marginTop:14, marginLeft:icon?56:0,
          background:`linear-gradient(90deg,${C.gold} 0%,rgba(235,195,43,.4) 30%,rgba(235,195,43,0) 80%)`,
        }}/>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   CALLOUTS — estilo editorial con borde lateral
────────────────────────────────────────────── */

function Callout({ type='info', title, children }) {
  const variants = {
    tip:    { accent:C.green,   bg:'rgba(27,138,90,.06)',  ic:'✓', tone:'CONSEJO' },
    warn:   { accent:C.goldDk,  bg:'rgba(235,195,43,.08)', ic:'!', tone:'IMPORTANTE' },
    info:   { accent:C.blueMed, bg:'rgba(66,91,139,.06)',  ic:'i', tone:'NOTA' },
    danger: { accent:C.red,     bg:'rgba(184,69,46,.06)',  ic:'⚠', tone:'CUIDADO' },
  }
  const v = variants[type] || variants.info

  return (
    <div style={{
      position:'relative', margin:'20px 0',
      background:v.bg,
      border:`1px solid ${v.accent}33`,
      borderLeft:`3px solid ${v.accent}`,
      borderRadius:'2px 12px 12px 2px',
      padding:'14px 18px 14px 16px',
      display:'flex', gap:14, alignItems:'flex-start',
    }}>
      <div style={{
        width:28, height:28, borderRadius:'50%', flexShrink:0,
        background:v.accent, color:C.white,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:"'Bebas Neue',sans-serif", fontSize:16, fontWeight:400,
        boxShadow:`0 4px 10px ${v.accent}55`,
      }}>{v.ic}</div>
      <div style={{ flex:1 }}>
        <div style={{
          fontFamily:"'DM Sans',sans-serif", fontWeight:700,
          fontSize:9.5, textTransform:'uppercase', letterSpacing:'.22em',
          color:v.accent, marginBottom:5,
        }}>
          {v.tone}{title && ' · '}{title}
        </div>
        <div style={{
          fontFamily:"'DM Sans',sans-serif",
          fontSize:14, color:C.ink700, lineHeight:1.65,
        }}>{children}</div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   STEP — paso numerado horizontal limpio
────────────────────────────────────────────── */

function Step({ num, title, children }) {
  return (
    <div style={{
      display:'flex', gap:16, alignItems:'flex-start',
      marginBottom:14, padding:'14px 16px',
      background:C.white,
      border:`1px solid ${C.cream2}`,
      borderRadius:12,
      transition:'all .18s ease',
    }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(235,195,43,.5)'; e.currentTarget.style.transform='translateX(3px)'; e.currentTarget.style.boxShadow='0 4px 14px rgba(12,24,43,.06)' }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.cream2; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}>
      <div style={{
        width:34, height:34, borderRadius:10, flexShrink:0,
        background:`linear-gradient(135deg,${C.navy},${C.navySoft})`,
        color:C.gold,
        fontFamily:"'Bebas Neue',sans-serif", fontSize:18,
        display:'flex', alignItems:'center', justifyContent:'center',
        marginTop:1, letterSpacing:'.02em',
        boxShadow:'0 4px 10px rgba(12,24,43,.18)',
      }}>{num}</div>
      <div style={{ flex:1 }}>
        <p style={{
          fontFamily:"'DM Sans',sans-serif", fontWeight:700,
          fontSize:14.5, color:C.navy, margin:'0 0 4px',
        }}>{title}</p>
        <div style={{
          fontFamily:"'DM Sans',sans-serif",
          fontSize:14, color:C.ink500, lineHeight:1.65,
        }}>{children}</div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   PHASE CARD — fase del Mundial / opción visual
────────────────────────────────────────────── */

function PhaseCard({ tag, tagColor, name, desc, matches, accent=C.gold }) {
  return (
    <div style={{
      position:'relative', padding:'18px 18px 16px',
      background:C.white,
      border:`1px solid ${C.cream2}`,
      borderRadius:14,
      transition:'all .22s ease',
      overflow:'hidden',
    }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor=accent; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 14px 32px rgba(12,24,43,.1), 0 0 0 1px ${accent}33` }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.cream2; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}>
      {/* línea acento superior */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:2,
        background:`linear-gradient(90deg,${accent},transparent)`,
      }}/>
      {tag && (
        <span style={{
          fontFamily:"'DM Sans',sans-serif", fontWeight:700,
          fontSize:9, textTransform:'uppercase', letterSpacing:'.18em',
          color:tagColor || accent,
          marginBottom:8, display:'block',
        }}>{tag}</span>
      )}
      <p style={{
        fontFamily:"'Bebas Neue',sans-serif",
        fontSize:20, color:C.navy, margin:'0 0 6px',
        letterSpacing:'.02em', lineHeight:1.05,
      }}>{name}</p>
      <p style={{
        fontFamily:"'DM Sans',sans-serif",
        fontSize:13, color:C.ink500, lineHeight:1.55, margin:0,
      }}>{desc}</p>
      {matches && (
        <div style={{
          marginTop:12, paddingTop:10,
          borderTop:`1px dashed ${C.cream2}`,
          display:'flex', alignItems:'center', gap:6,
          fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700,
          color:C.goldDk, textTransform:'uppercase', letterSpacing:'.12em',
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {matches}
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────
   FIELD ITEM — campo de formulario explicado
────────────────────────────────────────────── */

function FieldItem({ name, req, children }) {
  const badge = req==='req'  ? { bg:'rgba(184,69,46,.1)',  color:C.red,   label:'Requerido' }
              : req==='opt'  ? { bg:'rgba(66,91,139,.1)',  color:C.blueMed,label:'Opcional'  }
              : req==='auto' ? { bg:'rgba(27,138,90,.1)',  color:C.green, label:'Auto'      }
              : null
  return (
    <div style={{
      display:'flex', gap:14, alignItems:'flex-start',
      padding:'12px 14px', borderRadius:10,
      background:C.white,
      border:`1px solid ${C.cream2}`,
      marginBottom:6,
    }}>
      <div style={{ minWidth:140, flexShrink:0 }}>
        <div style={{
          fontFamily:"'Bebas Neue',sans-serif", fontSize:15,
          color:C.navy, letterSpacing:'.04em', lineHeight:1.1,
        }}>{name}</div>
        {badge && (
          <span style={{
            display:'inline-block', marginTop:4,
            fontFamily:"'DM Sans',sans-serif", fontWeight:700,
            fontSize:9, textTransform:'uppercase', letterSpacing:'.14em',
            padding:'2px 7px', borderRadius:4,
            background:badge.bg, color:badge.color,
          }}>{badge.label}</span>
        )}
      </div>
      <div style={{
        fontFamily:"'DM Sans',sans-serif",
        fontSize:13.5, color:C.ink700, lineHeight:1.6, paddingTop:2,
      }}>{children}</div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   CHECK ITEM — del checklist final
────────────────────────────────────────────── */

function CheckItem({ accent, children }) {
  const [checked, setChecked] = useState(false)
  return (
    <button onClick={()=>setChecked(!checked)} style={{
      display:'flex', gap:12, alignItems:'flex-start', width:'100%',
      padding:'10px 14px', borderRadius:10,
      background:checked?'rgba(27,138,90,.05)':C.white,
      border:`1px solid ${checked?'rgba(27,138,90,.3)':C.cream2}`,
      marginBottom:6, cursor:'pointer', textAlign:'left',
      fontFamily:"'DM Sans',sans-serif",
      transition:'all .15s ease',
    }}>
      <span style={{
        width:20, height:20, borderRadius:5, flexShrink:0,
        background:checked?C.green:C.white,
        border:`2px solid ${checked?C.green:accent}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        marginTop:1, transition:'all .15s ease',
      }}>
        {checked && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </span>
      <span style={{
        flex:1, fontSize:13.5, color:checked?C.ink500:C.ink700,
        lineHeight:1.55, textDecoration:checked?'line-through':'none',
      }}>{children}</span>
    </button>
  )
}

/* ──────────────────────────────────────────────
   TABLAS — puntuación y acciones
────────────────────────────────────────────── */

function ScoreTable({ rows }) {
  return (
    <div style={{
      borderRadius:14, overflow:'hidden', margin:'18px 0',
      border:`1px solid ${C.cream2}`,
      background:C.white,
    }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13.5 }}>
        <thead>
          <tr style={{ background:`linear-gradient(135deg,${C.navy},${C.navySoft})` }}>
            {['Tipo de acierto','Descripción','Puntos'].map(h=>(
              <th key={h} style={{
                padding:'12px 16px', textAlign:'left',
                fontFamily:"'Bebas Neue',sans-serif", fontSize:14,
                letterSpacing:'.08em', color:C.gold, fontWeight:400,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} style={{
              borderBottom: i<rows.length-1 ? `1px solid ${C.cream2}` : 'none',
              background: i%2 ? 'rgba(250,247,240,.5)' : C.white,
            }}>
              <td style={{
                padding:'12px 16px',
                fontFamily:"'DM Sans',sans-serif", fontWeight:700,
                color:C.navy,
              }}>{r.tipo}</td>
              <td style={{
                padding:'12px 16px',
                fontFamily:"'DM Sans',sans-serif",
                color:C.ink500,
              }}>{r.desc}</td>
              <td style={{ padding:'12px 16px' }}>
                <span style={{
                  fontFamily:"'Bebas Neue',sans-serif", fontSize:20,
                  color:r.color, letterSpacing:'.02em',
                }}>{r.pts}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ActionTable({ rows }) {
  return (
    <div style={{
      borderRadius:14, overflow:'hidden', margin:'18px 0',
      border:`1px solid ${C.cream2}`, background:C.white,
    }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13.5 }}>
        <thead>
          <tr style={{ background:`linear-gradient(135deg,${C.navy},${C.navySoft})` }}>
            {['Acción','Desde estado','Resultado'].map(h=>(
              <th key={h} style={{
                padding:'12px 16px', textAlign:'left',
                fontFamily:"'Bebas Neue',sans-serif", fontSize:14,
                letterSpacing:'.08em', color:C.gold, fontWeight:400,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} style={{
              borderBottom: i<rows.length-1 ? `1px solid ${C.cream2}` : 'none',
              background: i%2 ? 'rgba(250,247,240,.5)' : C.white,
            }}>
              <td style={{
                padding:'12px 16px',
                fontFamily:"'DM Sans',sans-serif", fontWeight:600,
                color:C.navy,
              }}>{r.accion}</td>
              <td style={{
                padding:'12px 16px',
                fontFamily:"'DM Sans',sans-serif",
                color:C.ink500,
              }}>{r.desde}</td>
              <td style={{
                padding:'12px 16px',
                fontFamily:"'DM Sans',sans-serif",
                color:C.ink700,
              }} dangerouslySetInnerHTML={{__html:r.resultado}}/>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ──────────────────────────────────────────────
   BOTÓN GOLD — link al panel admin / dashboard
────────────────────────────────────────────── */

function GoldButton({ onClick, children, variant='solid' }) {
  if (variant==='solid') {
    return (
      <button onClick={onClick} style={{
        display:'inline-flex', alignItems:'center', gap:8,
        padding:'10px 20px', borderRadius:99,
        border:'none', cursor:'pointer',
        background:C.gold, color:C.navyDeep,
        fontFamily:"'DM Sans',sans-serif", fontWeight:700,
        fontSize:13, letterSpacing:'.02em',
        boxShadow:'0 6px 18px rgba(235,195,43,.35)',
        transition:'all .18s ease',
      }}
        onMouseEnter={e=>{ e.currentTarget.style.background=C.goldLt; e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 8px 22px rgba(235,195,43,.5)' }}
        onMouseLeave={e=>{ e.currentTarget.style.background=C.gold; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 6px 18px rgba(235,195,43,.35)' }}>
        {children}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    )
  }
  return (
    <button onClick={onClick} style={{
      display:'inline-flex', alignItems:'center', gap:7,
      padding:'8px 16px', borderRadius:99,
      border:`1.5px solid ${C.gold}`, cursor:'pointer',
      background:'transparent', color:C.goldDk,
      fontFamily:"'DM Sans',sans-serif", fontWeight:700,
      fontSize:12, letterSpacing:'.02em',
      transition:'all .15s ease',
    }}
      onMouseEnter={e=>{ e.currentTarget.style.background=C.gold; e.currentTarget.style.color=C.navyDeep }}
      onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=C.goldDk }}>
      {children}
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  )
}

/* ──────────────────────────────────────────────
   DIVIDER editorial
────────────────────────────────────────────── */

function Divider() {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12,
      margin:'40px 0', opacity:.5,
    }}>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg,transparent,${C.cream3},transparent)` }}/>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.goldDk} strokeWidth="2">
        <circle cx="12" cy="12" r="3" fill={C.gold}/>
      </svg>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg,transparent,${C.cream3},transparent)` }}/>
    </div>
  )
}

/* ──────────────────────────────────────────────
   ICONOS por sección (línea, dorado)
────────────────────────────────────────────── */
const Icon = (path) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:20, height:20 }}>
    {path}
  </svg>
)

const ICONS = {
  intro:    Icon(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>),
  acceso:   Icon(<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>),
  estrategia:Icon(<><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></>),
  fases:    Icon(<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>),
  crear:    Icon(<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>),
  partidos: Icon(<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>),
  ciclo:    Icon(<><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></>),
  usuarios: Icon(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>),
  areas:    Icon(<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></>),
  premios:  Icon(<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></>),
  ranking:  Icon(<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>),
  puntos:   Icon(<><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></>),
  check:    Icon(<><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>),
}

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════ */

export default function Manual() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('intro')
  const contentRef = useRef(null)

  /* Scroll-spy: detecta sección activa al hacer scroll */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('manual-','')
            setActiveSection(id)
          }
        })
      },
      { rootMargin:'-30% 0px -60% 0px', threshold:0 }
    )
    SECTIONS.forEach(s => {
      const el = document.getElementById('manual-'+s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  function goTo(id) {
    setActiveSection(id)
    const el = document.getElementById('manual-'+id)
    if (el) el.scrollIntoView({ behavior:'smooth', block:'start' })
  }

  return (
    <div style={{
      background:C.cream,
      minHeight:'calc(100vh - 180px)',
      fontFamily:"'DM Sans',sans-serif",
      position:'relative',
    }}>
      {/* Decoración de fondo: textura sutil dorada */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden',
        background:`
          radial-gradient(ellipse 600px 400px at 90% 5%, rgba(235,195,43,.08), transparent 60%),
          radial-gradient(ellipse 500px 600px at 5% 60%, rgba(66,91,139,.05), transparent 60%)
        `,
      }}/>

      <div style={{
        position:'relative', zIndex:1,
        display:'grid', gridTemplateColumns:'minmax(0,260px) minmax(0,1fr)',
        gap:0, maxWidth:1280, margin:'0 auto',
      }}>

        {/* ══════════════════════════════════════
            SIDEBAR — claro, minimalista
        ══════════════════════════════════════ */}
        <aside style={{
          position:'sticky', top:0, height:'100vh',
          padding:'32px 0 24px 24px',
          overflowY:'auto',
          borderRight:`1px solid ${C.cream2}`,
        }}>
          {/* Brand */}
          <div style={{ paddingRight:18, marginBottom:24 }}>
            <div style={{
              fontFamily:"'Bebas Neue',sans-serif",
              fontSize:24, color:C.navy, letterSpacing:'.04em',
              lineHeight:1, marginBottom:4,
            }}>
              MANUAL <span style={{ color:C.goldDk }}>ADMIN</span>
            </div>
            <div style={{
              fontSize:10, fontWeight:700,
              textTransform:'uppercase', letterSpacing:'.2em',
              color:C.ink500, marginBottom:12,
            }}>
              Prode ONE · Mundial 2026
            </div>
            <span style={{
              display:'inline-flex', alignItems:'center', gap:6,
              fontSize:9, fontWeight:700,
              textTransform:'uppercase', letterSpacing:'.16em',
              color:C.goldDk,
              background:'rgba(235,195,43,.12)',
              border:`1px solid rgba(235,195,43,.35)`,
              borderRadius:99, padding:'3px 10px',
            }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:C.gold }}/>
              RRHH / Admin
            </span>
          </div>

          {/* Nav groups */}
          {GROUPS.map(group => (
            <div key={group} style={{ marginBottom:18 }}>
              <p style={{
                fontSize:9, fontWeight:700,
                textTransform:'uppercase', letterSpacing:'.22em',
                color:C.ink500,
                margin:'0 0 8px',
                paddingRight:18,
              }}>{group}</p>
              <div>
                {SECTIONS.filter(s=>s.group===group).map(s=>{
                  const active = activeSection===s.id
                  return (
                    <button key={s.id} onClick={()=>goTo(s.id)} style={{
                      display:'flex', alignItems:'center', gap:10,
                      width:'100%', padding:'7px 18px 7px 12px',
                      background:active?'rgba(235,195,43,.1)':'transparent',
                      border:'none',
                      borderLeft:`2px solid ${active?C.gold:'transparent'}`,
                      cursor:'pointer', textAlign:'left',
                      transition:'all .15s ease',
                      fontFamily:"'DM Sans',sans-serif",
                    }}
                      onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background='rgba(235,195,43,.05)' }}}
                      onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background='transparent' }}}>
                      <span style={{
                        fontFamily:"'Bebas Neue',sans-serif", fontSize:12,
                        color:active?C.goldDk:C.ink300,
                        minWidth:18, letterSpacing:'.04em',
                      }}>{s.num}</span>
                      <span style={{
                        fontSize:13, fontWeight:active?600:500,
                        color:active?C.navy:C.ink700,
                      }}>{s.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* ══════════════════════════════════════
            CONTENIDO PRINCIPAL
        ══════════════════════════════════════ */}
        <main ref={contentRef} style={{
          padding:'0 36px 80px',
          minWidth:0,
        }}>

          {/* ── HERO editorial ── */}
          <header style={{
            position:'relative', padding:'56px 0 40px',
            borderBottom:`1px solid ${C.cream2}`,
            marginBottom:48,
          }}>
            <span style={{
              display:'inline-flex', alignItems:'center', gap:7,
              fontSize:10, fontWeight:700,
              textTransform:'uppercase', letterSpacing:'.22em',
              color:C.goldDk, marginBottom:18,
            }}>
              <span style={{ width:24, height:1, background:C.goldDk }}/>
              Manual del Administrador · v1.0
            </span>

            <h1 style={{
              fontFamily:"'Bebas Neue',sans-serif",
              fontSize:'clamp(3.5rem, 7vw, 6rem)',
              color:C.navy, letterSpacing:'.01em',
              lineHeight:.92, margin:'0 0 12px',
            }}>
              GESTIONÁ EL<br/>
              <span style={{
                color:C.goldDk,
                textShadow:'0 0 32px rgba(235,195,43,.25)',
              }}>TORNEO COMPLETO</span>
            </h1>

            <p style={{
              fontFamily:"'DM Sans',sans-serif",
              fontSize:17, lineHeight:1.7, color:C.ink500,
              maxWidth:560, margin:'0 0 28px',
            }}>
              Guía paso a paso para administrar el prode interno del Mundial 2026 — desde la creación de apuestas hasta la entrega de premios a los ganadores.
            </p>

            {/* Stats hero */}
            <div style={{
              display:'flex', flexWrap:'wrap', gap:0,
              borderTop:`1px solid ${C.cream2}`,
              paddingTop:20, marginTop:8,
            }}>
              {[
                ['6','Fases del torneo'],
                ['6','Apuestas a crear'],
                ['5','Ganadores posibles'],
                ['3','Estados por apuesta'],
              ].map(([n,l],i)=>(
                <div key={l} style={{
                  flex:'1 1 140px', padding:'0 24px',
                  borderLeft: i>0 ? `1px solid ${C.cream2}` : 'none',
                }}>
                  <div style={{
                    fontFamily:"'Bebas Neue',sans-serif",
                    fontSize:42, color:C.goldDk,
                    lineHeight:1, letterSpacing:'.02em',
                  }}>{n}</div>
                  <div style={{
                    fontSize:10, fontWeight:700,
                    textTransform:'uppercase', letterSpacing:'.18em',
                    color:C.ink500, marginTop:4,
                  }}>{l}</div>
                </div>
              ))}
            </div>
          </header>

          {/* ════════════ 01 INTRO ════════════ */}
          <section id="manual-intro" style={{ marginBottom:48, scrollMarginTop:24 }}>
            <SectionHeader num="01" kicker="Introducción" title="¿QUÉ HACE EL ADMINISTRADOR?" icon={ICONS.intro}/>
            <P>
              El administrador es quien <B>organiza y controla el torneo de pronósticos</B> para toda la empresa. Sin intervención del admin, los participantes no pueden apostar. El admin tiene un panel exclusivo al que los usuarios comunes no tienen acceso.
            </P>
            <div style={{
              display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',
              gap:14, margin:'24px 0',
            }}>
              <PhaseCard tag="Antes del torneo" tagColor={C.blueMed} accent={C.blueMed}
                name="Preparar el escenario"
                desc="Crear las áreas, aprobar usuarios y armar la primera apuesta."/>
              <PhaseCard tag="Durante el torneo" tagColor={C.green} accent={C.green}
                name="Abrir y cerrar apuestas"
                desc="Crear una apuesta por fase, habilitar los partidos correctos y cerrarla a tiempo."/>
              <PhaseCard tag="Al finalizar" tagColor={C.goldDk} accent={C.gold}
                name="Determinar ganadores"
                desc="Ver el ranking de cada apuesta y entregar los premios."/>
            </div>
            <Callout type="info" title="¿Quién puede ser admin?">
              Solo los usuarios con rol <B>admin</B> pueden acceder al panel. Este rol se asigna directamente en la hoja de Google Sheets del sistema. Contactar al equipo técnico si necesitás agregar más administradores.
            </Callout>
          </section>

          <Divider/>

          {/* ════════════ 02 ACCESO ════════════ */}
          <section id="manual-acceso" style={{ marginBottom:48, scrollMarginTop:24 }}>
            <SectionHeader num="02" kicker="Introducción" title="ACCESO AL PANEL ADMIN" icon={ICONS.acceso}/>
            <Step num="1" title="Iniciar sesión normalmente">
              Entrá con tu email y contraseña de administrador en la pantalla de login. Si tus credenciales tienen el rol <I>admin</I>, el sistema te reconocerá automáticamente.
            </Step>
            <Step num="2" title="Ir a la ruta /admin">
              Una vez dentro, navegá a <Code>/admin</Code> en la barra del navegador, o usá el botón de Admin en el menú superior si tenés acceso.
              <div style={{ marginTop:10 }}>
                <GoldButton variant="outline" onClick={()=>navigate('/admin')}>Ir al Panel Admin</GoldButton>
              </div>
            </Step>
            <Step num="3" title="Navegás por las pestañas del panel">
              El panel admin tiene 4 pestañas principales: <B>Apuestas</B>, <B>Partidos</B>, <B>Usuarios</B> y <B>Áreas</B>.
            </Step>
            <Callout type="danger" title="El panel admin es exclusivo">
              Nunca compartás tu contraseña de admin. Los usuarios comunes no pueden ver ni acceder al panel. Si un usuario necesita acceso, solicitá al equipo técnico que le cambie el rol desde Google Sheets.
            </Callout>
          </section>

          <Divider/>

          {/* ════════════ 03 ESTRATEGIA ════════════ */}
          <section id="manual-estrategia" style={{ marginBottom:48, scrollMarginTop:24 }}>
            <SectionHeader num="03" kicker="Gestión de Torneos" title="ESTRATEGIA DE APUESTAS" icon={ICONS.estrategia}/>
            <P>
              La estrategia recomendada es crear <B>una apuesta por cada fase del Mundial</B>. Esto permite tener ganadores en cada etapa del torneo y mantener la motivación de los participantes durante todo el evento.
            </P>
            <Callout type="tip" title="Recomendación: 6 apuestas en total">
              Una apuesta por fase del torneo genera hasta 6 ganadores distintos. Esto distribuye los premios en el tiempo y mantiene el interés de todos los participantes — incluso los que no van bien en el ranking general.
            </Callout>
            <P>
              También podés hacer <B>apuestas por área</B> para generar competencia interna entre departamentos, o una <B>gran apuesta acumulada</B> con todos los partidos del torneo para el ganador general.
            </P>
            <div style={{ marginTop:16 }}>
              <GoldButton onClick={()=>navigate('/admin')}>Crear una apuesta</GoldButton>
            </div>
          </section>

          <Divider/>

          {/* ════════════ 04 FASES ════════════ */}
          <section id="manual-fases" style={{ marginBottom:48, scrollMarginTop:24 }}>
            <SectionHeader num="04" kicker="Gestión de Torneos" title="LAS 6 FASES DEL MUNDIAL" icon={ICONS.fases}/>
            <P>El Mundial 2026 tiene 6 fases jugables, cada una ideal para una apuesta diferente:</P>
            <div style={{
              display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',
              gap:12, margin:'18px 0',
            }}>
              {[
                { tag:'Fase 1', name:'FASE DE GRUPOS', desc:'128 partidos divididos en 16 grupos de 3 equipos.', matches:'128 partidos', accent:C.blueMed },
                { tag:'Fase 2', name:'16AVOS DE FINAL', desc:'Los 2 primeros de cada grupo avanzan. 32 equipos clasificados.', matches:'32 partidos', accent:C.gold },
                { tag:'Fase 3', name:'OCTAVOS DE FINAL', desc:'16 equipos se enfrentan en formato eliminatorio directo.', matches:'16 partidos', accent:C.gold },
                { tag:'Fase 4', name:'CUARTOS DE FINAL', desc:'Los 8 equipos que sobrevivieron octavos se enfrentan.', matches:'8 partidos', accent:C.green },
                { tag:'Fase 5', name:'SEMIFINALES', desc:'Los 4 mejores equipos juegan por llegar a la gran final.', matches:'2 partidos', accent:C.red },
                { tag:'Fase 6', name:'FINAL + 3° PUESTO', desc:'La gran final y el partido por el tercer puesto.', matches:'2 partidos', accent:C.goldDk },
              ].map((p,i)=><PhaseCard key={i} {...p}/>)}
            </div>
            <Callout type="warn" title="Las eliminatorias se van sabiendo de a poco">
              En cada ronda eliminatoria, los partidos se confirman recién cuando terminan los partidos de la ronda anterior. Podés crear la apuesta anticipadamente y agregar los partidos a medida que se confirman.
            </Callout>
          </section>

          <Divider/>

          {/* ════════════ 05 CREAR APUESTA ════════════ */}
          <section id="manual-crear-apuesta" style={{ marginBottom:48, scrollMarginTop:24 }}>
            <SectionHeader num="05" kicker="Gestión de Torneos" title="CREAR UNA APUESTA" icon={ICONS.crear}/>
            <P>
              Desde la pestaña <B>Apuestas</B> del panel admin, hacé clic en <B>"Nueva Apuesta"</B>. Completá los siguientes campos:
            </P>
            <FieldItem name="Título" req="req">
              Nombre descriptivo. Ej: <I>"Fase de Grupos — Mundial 2026"</I>. Este nombre ven todos los participantes.
            </FieldItem>
            <FieldItem name="Tipo" req="req">
              Categoría de la apuesta. Usualmente se usa el tipo <I>fase</I> para cada ronda del torneo.
            </FieldItem>
            <FieldItem name="Premio" req="req">
              Descripción del premio. Puede ser texto libre: <I>"Tarde libre"</I>, <I>"Gift card $5000"</I>, <I>"Cena para dos"</I>. <B>El admin define libremente qué premiar.</B>
            </FieldItem>
            <FieldItem name="Fecha cierre" req="req">
              Fecha y hora límite para cargar predicciones. Una vez pasada, la apuesta se cierra automáticamente. <B>Recomendación:</B> poner la fecha de inicio del primer partido de la fase.
            </FieldItem>
            <FieldItem name="Partidos" req="req">
              Selección de los partidos que forman parte de esta apuesta. Podés seleccionar múltiples partidos.
            </FieldItem>
            <FieldItem name="Pts. Exacto" req="opt">
              Puntos por acertar el marcador exacto. Por defecto: <B>5 puntos</B>.
            </FieldItem>
            <FieldItem name="Pts. Diferencia" req="opt">
              Puntos por acertar la diferencia de goles. Por defecto: <B>3 puntos</B>.
            </FieldItem>
            <FieldItem name="Pts. Resultado" req="opt">
              Puntos por acertar quién gana o empata. Por defecto: <B>1 punto</B>.
            </FieldItem>
            <Callout type="tip" title="Consejo para los puntos">
              Podés usar los valores por defecto (5/3/1) para todas las fases. Si querés hacer las fases finales más emocionantes, podés aumentar los puntos en octavos, cuartos y semis para que pesen más.
            </Callout>
            <div style={{ marginTop:16 }}>
              <GoldButton onClick={()=>navigate('/admin')}>Ir a Apuestas</GoldButton>
            </div>
          </section>

          <Divider/>

          {/* ════════════ 06 PARTIDOS ════════════ */}
          <section id="manual-partidos" style={{ marginBottom:48, scrollMarginTop:24 }}>
            <SectionHeader num="06" kicker="Gestión de Torneos" title="ASIGNAR PARTIDOS A UNA APUESTA" icon={ICONS.partidos}/>
            <P>
              Al crear o editar una apuesta, el admin selecciona qué partidos incluye esa apuesta. El sistema carga los partidos del fixture del Mundial automáticamente.
            </P>
            <div style={{
              display:'grid', gridTemplateColumns:'1fr 1fr',
              gap:12, margin:'18px 0',
            }}>
              <PhaseCard name="Para Grupos" desc="Seleccionás todos los partidos de la fase de grupos (o un bloque de ellos si querés dividirla)." accent={C.blueMed}/>
              <PhaseCard name="Para Eliminatorias" desc="En cada ronda eliminatoria seleccionás solo los partidos de esa ronda. En 16avos son 32, en Octavos 16, en Cuartos 8." accent={C.gold}/>
            </div>
            <Callout type="warn" title="En eliminatorias los partidos se conocen después">
              Los equipos que juegan cada partido se saben recién cuando terminan los partidos anteriores. Podés crear la apuesta antes de que se definan todos los clasificados y agregar los partidos a medida que se confirman.
            </Callout>
            <P>
              En la pestaña <B>Partidos</B> del panel admin podés ver el fixture completo, filtrar por estado (próximo, en vivo, finalizado) y ver qué partidos ya están asignados a qué apuesta.
            </P>
            <div style={{ marginTop:16 }}>
              <GoldButton onClick={()=>navigate('/partidos')}>Ver Fixture completo</GoldButton>
            </div>
          </section>

          <Divider/>

          {/* ════════════ 07 CICLO DE VIDA ════════════ */}
          <section id="manual-ciclo" style={{ marginBottom:48, scrollMarginTop:24 }}>
            <SectionHeader num="07" kicker="Gestión de Torneos" title="CICLO DE VIDA DE UNA APUESTA" icon={ICONS.ciclo}/>
            <P>Cada apuesta pasa por 3 estados distintos. El admin controla las transiciones entre estados.</P>

            {/* Timeline visual de estados */}
            <div style={{
              position:'relative', margin:'28px 0',
              padding:'0 0 0 32px',
              borderLeft:`2px dashed ${C.cream3}`,
            }}>
              {[
                { dot:C.green, label:'ABIERTA', desc:'Apenas se crea la apuesta, queda en estado abierta. Los participantes pueden ver los partidos y cargar/modificar sus predicciones. Este estado dura hasta la fecha de cierre configurada, o hasta que el admin la cierre manualmente.' },
                { dot:C.red, label:'CERRADA', desc:'Cuando se alcanza la fecha límite (o el admin la cierra manualmente), la apuesta pasa a cerrada. Ya no se aceptan predicciones nuevas. Los partidos se juegan durante esta etapa y el sistema registra los resultados.' },
                { dot:C.gold, label:'FINALIZADA', desc:'Una vez que todos los partidos tienen resultado, el admin puede finalizarla. El sistema calcula los puntos de cada participante y genera el ranking final. Este es el momento donde se decide quién ganó el premio.' },
              ].map((s,i)=>(
                <div key={i} style={{ position:'relative', marginBottom:i<2?22:0 }}>
                  <div style={{
                    position:'absolute', left:-42, top:4,
                    width:18, height:18, borderRadius:'50%',
                    background:s.dot, border:`3px solid ${C.cream}`,
                    boxShadow:`0 0 0 2px ${s.dot}55, 0 4px 10px ${s.dot}55`,
                  }}/>
                  <div style={{
                    fontFamily:"'Bebas Neue',sans-serif", fontSize:22,
                    color:C.navy, letterSpacing:'.04em', lineHeight:1,
                    marginBottom:6,
                  }}>
                    Estado: <span style={{ color:s.dot }}>{s.label}</span>
                  </div>
                  <p style={{
                    fontFamily:"'DM Sans',sans-serif", fontSize:14,
                    color:C.ink700, lineHeight:1.65, margin:0,
                  }}>{s.desc}</p>
                </div>
              ))}
            </div>

            <ActionTable rows={[
              { accion:'Crear apuesta', desde:'—', resultado:'Apuesta queda en <strong style="color:#0c182b">Abierta</strong>' },
              { accion:'Cerrar apuesta (manual)', desde:'Abierta', resultado:'Pasa a <strong style="color:#0c182b">Cerrada</strong>, no más predicciones' },
              { accion:'Finalizar apuesta', desde:'Cerrada', resultado:'Calcula puntos → pasa a <strong style="color:#0c182b">Finalizada</strong>' },
            ]}/>
            <Callout type="info" title="Cierre automático vs. manual">
              Si configurás una fecha de cierre, la apuesta se cierra sola al llegar esa fecha. También podés cerrarla manualmente antes desde el panel. Una vez cerrada, no se puede volver a abrir.
            </Callout>
          </section>

          <Divider/>

          {/* ════════════ 08 USUARIOS ════════════ */}
          <section id="manual-usuarios" style={{ marginBottom:48, scrollMarginTop:24 }}>
            <SectionHeader num="08" kicker="Usuarios & Premios" title="APROBAR USUARIOS" icon={ICONS.usuarios}/>
            <P>
              Cuando un empleado se registra en la plataforma, su cuenta queda en estado <B>pendiente</B> hasta que el admin la apruebe. Desde la pestaña <B>Usuarios</B> del panel admin se ven todos los pendientes.
            </P>
            <Step num="1" title="Ver solicitudes pendientes">
              Entrá al panel admin y hacé clic en la pestaña <B>Usuarios</B>. Vas a ver la lista de todos los registros pendientes con nombre, email y fecha de registro.
            </Step>
            <Step num="2" title="Asignar rol y área (solo Plan Pro)">
              En el Plan Pro tenés que asignar un <B>rol</B> (Participante o Jefe de Área) y el <B>área</B> del usuario. En el Plan Básico, los usuarios se aprueban directamente como participantes generales.
            </Step>
            <Step num="3" title="Confirmar o rechazar">
              Hacé clic en <B>Aprobar</B> para activar la cuenta, o en <B>Rechazar</B> para eliminarla del sistema. Una vez aprobado, el usuario puede participar en todas las apuestas activas.
            </Step>
            <Callout type="warn" title="Rechazar borra la cuenta">
              Al rechazar un usuario, su registro se elimina permanentemente del sistema. Si el usuario necesita intentarlo de nuevo, tendrá que registrarse otra vez.
            </Callout>
            <div style={{ marginTop:16 }}>
              <GoldButton onClick={()=>navigate('/admin')}>Ir a Usuarios</GoldButton>
            </div>
          </section>

          <Divider/>

          {/* ════════════ 09 ÁREAS ════════════ */}
          <section id="manual-areas" style={{ marginBottom:48, scrollMarginTop:24 }}>
            <SectionHeader num="09" kicker="Usuarios & Premios" title="GESTIONAR ÁREAS" icon={ICONS.areas}/>
            <P>
              Las áreas son los departamentos o grupos de la empresa. Permiten organizar a los participantes por sector y generar rankings por área. Esta funcionalidad está disponible en el <B>Plan Pro</B>.
            </P>
            <P>Desde la pestaña <B>Áreas</B> del panel admin podés:</P>
            <div style={{ display:'flex', flexDirection:'column', gap:8, margin:'14px 0' }}>
              {['Crear nuevas áreas con nombre y descripción','Editar el nombre o descripción de un área existente','Desactivar áreas que ya no se usan (sin borrar los usuarios asignados)','Ver cuántos usuarios tiene cada área'].map((item,i)=>(
                <div key={i} style={{
                  display:'flex', gap:14, alignItems:'center',
                  padding:'12px 16px', borderRadius:10,
                  background:C.white, border:`1px solid ${C.cream2}`,
                }}>
                  <span style={{
                    width:28, height:28, borderRadius:8, flexShrink:0,
                    background:`linear-gradient(135deg,${C.navy},${C.navySoft})`,
                    color:C.gold,
                    fontFamily:"'Bebas Neue',sans-serif", fontSize:14,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    letterSpacing:'.04em',
                  }}>{i+1}</span>
                  <span style={{ fontSize:14, color:C.ink700 }}>{item}</span>
                </div>
              ))}
            </div>
            <Callout type="info" title="Creá las áreas antes de aprobar usuarios">
              Si el plan es Pro, es importante que las áreas estén creadas antes de empezar a aprobar usuarios, porque al aprobar un usuario tenés que asignarle un área obligatoriamente.
            </Callout>
          </section>

          <Divider/>

          {/* ════════════ 10 PREMIOS ════════════ */}
          <section id="manual-premios" style={{ marginBottom:48, scrollMarginTop:24 }}>
            <SectionHeader num="10" kicker="Usuarios & Premios" title="DEFINIR PREMIOS" icon={ICONS.premios}/>
            <P>
              Los premios se definen al crear cada apuesta en el campo <B>Premio</B>. El sistema no gestiona la entrega — eso queda a cargo del admin. El campo es texto libre: podés poner lo que quieras.
            </P>
            <div style={{
              display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',
              gap:12, margin:'18px 0',
            }}>
              {[
                { emoji:'🥇', pos:'1° PUESTO', label:'Ganador principal de la apuesta', accent:C.gold,    bg:'rgba(235,195,43,.08)' },
                { emoji:'🥈', pos:'2° PUESTO', label:'Segundo lugar — premio a elección del admin', accent:C.ink300, bg:'rgba(168,178,196,.1)' },
                { emoji:'🥉', pos:'3° PUESTO', label:'Tercer lugar — si el admin decide premiarlo', accent:'#b97a3a', bg:'rgba(185,122,58,.08)' },
                { emoji:'🎖️', pos:'4° Y 5°', label:'El admin puede premiar más puestos si lo desea', accent:C.blueSoft, bg:'rgba(110,131,173,.08)' },
              ].map((p,i)=>(
                <div key={i} style={{
                  padding:'18px 14px 16px', borderRadius:14,
                  textAlign:'center', position:'relative',
                  background:C.white,
                  border:`1px solid ${p.accent}55`,
                  overflow:'hidden',
                }}>
                  <div style={{
                    position:'absolute', inset:0,
                    background:p.bg, pointerEvents:'none',
                  }}/>
                  <div style={{ position:'relative' }}>
                    <div style={{ fontSize:36, marginBottom:8, lineHeight:1 }}>{p.emoji}</div>
                    <p style={{
                      fontFamily:"'Bebas Neue',sans-serif", fontSize:20,
                      color:C.navy, margin:'0 0 6px', letterSpacing:'.03em',
                    }}>{p.pos}</p>
                    <p style={{
                      fontSize:11, color:C.ink500, margin:0,
                      lineHeight:1.4,
                    }}>{p.label}</p>
                  </div>
                </div>
              ))}
            </div>
            <Callout type="tip" title="Ejemplos de premios efectivos">
              Tarde libre (sin usar vacaciones) · Gift card de $5.000 o $10.000 · Cena para dos · Día de home office extra · Entrada a evento deportivo
            </Callout>
          </section>

          <Divider/>

          {/* ════════════ 11 RANKING ════════════ */}
          <section id="manual-ranking" style={{ marginBottom:48, scrollMarginTop:24 }}>
            <SectionHeader num="11" kicker="Usuarios & Premios" title="RANKING & GANADORES" icon={ICONS.ranking}/>
            <P>
              Una vez finalizada una apuesta, el admin puede ver el ranking completo desde la sección <B>Ranking</B> del dashboard.
            </P>
            <Step num="1" title="Finalizar la apuesta">
              Desde el panel admin, una vez que todos los partidos tienen resultado, hacer clic en <B>Finalizar</B> en la apuesta correspondiente.
            </Step>
            <Step num="2" title="Ir al Ranking">
              Navegá a la sección Ranking y seleccioná la apuesta finalizada para ver la tabla de posiciones.
            </Step>
            <Step num="3" title="Ver el podio y la tabla">
              El sistema muestra el <B>top 3 en podio</B> destacado, seguido por la tabla completa con todos los participantes. Podés ver el desglose partido por partido de cualquier jugador.
            </Step>
            <Step num="4" title="Identificar al ganador">
              El participante en el <B>1er puesto</B> es el ganador de esa apuesta.
            </Step>
            <Callout type="tip" title="El admin puede expandir cualquier fila">
              A diferencia de los usuarios comunes (que solo ven su propio desglose), el admin puede hacer clic en <B>cualquier participante</B> del ranking para ver partido por partido qué predijo y cuántos puntos sumó.
            </Callout>
            <div style={{ marginTop:16 }}>
              <GoldButton onClick={()=>navigate('/ranking')}>Ver Ranking</GoldButton>
            </div>
          </section>

          <Divider/>

          {/* ════════════ 12 SISTEMA DE PUNTOS ════════════ */}
          <section id="manual-puntuacion" style={{ marginBottom:48, scrollMarginTop:24 }}>
            <SectionHeader num="12" kicker="Referencia" title="SISTEMA DE PUNTOS" icon={ICONS.puntos}/>
            <P>
              Así se calculan los puntos de cada predicción. Los valores son los predeterminados (configurables por el admin al crear cada apuesta):
            </P>
            <ScoreTable rows={[
              { tipo:'Exacto',          desc:'Acertás el marcador exacto (ej: predices 2-1 y sale 2-1)',                                        pts:'+5 pts', color:C.green },
              { tipo:'Diferencia',      desc:'Acertás la diferencia de goles pero no el marcador exacto (ej: predices 2-1 y sale 3-2)',         pts:'+3 pts', color:C.goldDk },
              { tipo:'Resultado',       desc:'Acertás quién gana o que empata, pero sin acertar diferencia ni marcador exacto',                 pts:'+1 pt',  color:C.blueMed },
              { tipo:'Error',           desc:'No se acierta el resultado (predices que gana local y gana visitante, o viceversa)',              pts:'0 pts',  color:C.red },
              { tipo:'Sin predicción',  desc:'El participante no cargó ninguna predicción para ese partido',                                    pts:'0 pts',  color:C.ink300 },
            ]}/>
            <Callout type="info" title="Los puntos se calculan automáticamente">
              Una vez que el partido termina y el resultado está cargado en el sistema, los puntos se calculan solos. El admin solo necesita <B>finalizar la apuesta</B> cuando todos los partidos hayan terminado.
            </Callout>
          </section>

          <Divider/>

          {/* ════════════ 13 CHECKLIST ════════════ */}
          <section id="manual-checklist" style={{ marginBottom:48, scrollMarginTop:24 }}>
            <SectionHeader num="13" kicker="Referencia" title="CHECKLIST RÁPIDO" icon={ICONS.check}/>
            <P>Usá esta lista para no olvidar nada en cada etapa del torneo. <I>Tocá cada ítem para tildarlo.</I></P>

            <h3 style={{
              fontFamily:"'Bebas Neue',sans-serif", fontSize:22,
              color:C.navy, margin:'24px 0 12px', letterSpacing:'.03em',
              display:'flex', alignItems:'center', gap:10,
            }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:C.green }}/>
              Antes del torneo
            </h3>
            <CheckItem accent={C.green}><B>Crear las áreas</B> de la empresa en la pestaña Áreas del panel admin.</CheckItem>
            <CheckItem accent={C.green}><B>Aprobar los registros</B> de todos los empleados, asignándoles rol y área.</CheckItem>
            <CheckItem accent={C.green}><B>Crear la apuesta de Grupos</B> con todos los partidos de la fase, fecha de cierre y premio.</CheckItem>
            <CheckItem accent={C.green}><B>Comunicar a los empleados</B> que la plataforma está activa y pueden cargar sus predicciones.</CheckItem>

            <h3 style={{
              fontFamily:"'Bebas Neue',sans-serif", fontSize:22,
              color:C.navy, margin:'28px 0 12px', letterSpacing:'.03em',
              display:'flex', alignItems:'center', gap:10,
            }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:C.goldDk }}/>
              Durante cada fase eliminatoria
            </h3>
            <CheckItem accent={C.goldDk}><B>Crear la nueva apuesta</B> para la fase (16avos / Octavos / Cuartos / Semis / etc.) cuando se conozcan los partidos.</CheckItem>
            <CheckItem accent={C.goldDk}><B>Seleccionar los partidos</B> correctos para esa apuesta.</CheckItem>
            <CheckItem accent={C.goldDk}><B>Configurar el premio</B> de esa apuesta.</CheckItem>
            <CheckItem accent={C.goldDk}><B>Avisar a los participantes</B> que hay nueva apuesta disponible para predecir.</CheckItem>

            <h3 style={{
              fontFamily:"'Bebas Neue',sans-serif", fontSize:22,
              color:C.navy, margin:'28px 0 12px', letterSpacing:'.03em',
              display:'flex', alignItems:'center', gap:10,
            }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:C.blueMed }}/>
              Al terminar cada fase
            </h3>
            <CheckItem accent={C.blueMed}><B>Verificar que todos los partidos</B> de la apuesta tengan resultado cargado.</CheckItem>
            <CheckItem accent={C.blueMed}><B>Finalizar la apuesta</B> desde el panel admin (botón Finalizar).</CheckItem>
            <CheckItem accent={C.blueMed}><B>Consultar el ranking</B> de la apuesta y ver quién ganó el 1° puesto.</CheckItem>
            <CheckItem accent={C.blueMed}><B>Entregar el premio</B> al ganador y comunicarlo internamente.</CheckItem>

            <h3 style={{
              fontFamily:"'Bebas Neue',sans-serif", fontSize:22,
              color:C.navy, margin:'28px 0 12px', letterSpacing:'.03em',
              display:'flex', alignItems:'center', gap:10,
            }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:C.red }}/>
              Al finalizar el Mundial
            </h3>
            <CheckItem accent={C.red}><B>Finalizar la apuesta de Final</B> y ver el ganador del partido más importante.</CheckItem>
            <CheckItem accent={C.red}>Opcional: <B>Comparar rankings de todas las apuestas</B> para un ranking acumulado general.</CheckItem>
            <CheckItem accent={C.red}><B>Cerrar la temporada</B> con una comunicación interna celebrando a todos los participantes.</CheckItem>

            {/* Resumen final con onda */}
            <div style={{
              position:'relative', overflow:'hidden',
              background:`linear-gradient(135deg,${C.navy} 0%,${C.navySoft} 100%)`,
              borderRadius:18, padding:'28px 28px 24px',
              margin:'32px 0',
              border:`1px solid rgba(235,195,43,.3)`,
              boxShadow:'0 18px 48px rgba(12,24,43,.25)',
            }}>
              {/* Glow decorativo */}
              <div style={{
                position:'absolute', top:-60, right:-80,
                width:280, height:280,
                background:'radial-gradient(circle,rgba(235,195,43,.18),transparent 65%)',
                pointerEvents:'none',
              }}/>
              <div style={{ position:'relative' }}>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:7,
                  fontSize:10, fontWeight:700,
                  textTransform:'uppercase', letterSpacing:'.22em',
                  color:C.gold, marginBottom:10,
                }}>
                  <span style={{ width:18, height:1, background:C.gold }}/>
                  Resumen final del torneo
                </span>
                <h3 style={{
                  fontFamily:"'Bebas Neue',sans-serif",
                  fontSize:'clamp(1.6rem, 3vw, 2.2rem)',
                  color:C.white, letterSpacing:'.02em',
                  lineHeight:1, margin:'0 0 18px',
                }}>
                  HASTA <span style={{ color:C.gold }}>6 GANADORES</span> DISTINTOS
                </h3>
                <div style={{
                  display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',
                  gap:8, marginBottom:14,
                }}>
                  {[
                    'Ganador Fase de Grupos',
                    'Ganador 16avos de Final',
                    'Ganador Octavos de Final',
                    'Ganador Cuartos de Final',
                    'Ganador Semifinales',
                    'Ganador de la Gran Final',
                  ].map((item,i)=>(
                    <div key={i} style={{
                      display:'flex', alignItems:'center', gap:10,
                      padding:'8px 12px',
                      background:'rgba(235,195,43,.06)',
                      border:'1px solid rgba(235,195,43,.18)',
                      borderRadius:8,
                    }}>
                      <span style={{
                        fontFamily:"'Bebas Neue',sans-serif", fontSize:13,
                        color:C.gold, letterSpacing:'.04em',
                        minWidth:20,
                      }}>{i===5?'🏆':'🥇'}</span>
                      <span style={{
                        fontSize:12.5, color:'rgba(255,255,255,.85)',
                        fontWeight:500,
                      }}>{item}</span>
                    </div>
                  ))}
                </div>
                <p style={{
                  fontSize:12, color:'rgba(255,255,255,.5)',
                  margin:0, lineHeight:1.55,
                }}>
                  Si además el admin quiere premiar Top 3 de cada apuesta, puede haber hasta <B><span style={{ color:C.gold }}>18 premiados distintos</span></B> a lo largo del torneo.
                </p>
              </div>
            </div>

            {/* Accesos rápidos */}
            <div style={{
              background:C.white, borderRadius:14,
              padding:'22px 24px',
              border:`1px solid ${C.cream2}`,
              marginTop:24,
            }}>
              <p style={{
                fontFamily:"'Bebas Neue',sans-serif", fontSize:18,
                color:C.navy, margin:'0 0 4px', letterSpacing:'.04em',
              }}>ACCESOS RÁPIDOS</p>
              <p style={{
                fontSize:12, color:C.ink500, margin:'0 0 14px',
              }}>Saltá directo a las secciones principales del sistema.</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {[
                  { label:'Panel Admin', path:'/admin' },
                  { label:'Apuestas',    path:'/apuestas' },
                  { label:'Fixture',     path:'/partidos' },
                  { label:'Ranking',     path:'/ranking' },
                  { label:'Mis Prodes',  path:'/mis-predicciones' },
                ].map(({ label, path })=>(
                  <button key={path} onClick={()=>navigate(path)}
                    style={{
                      display:'inline-flex', alignItems:'center', gap:6,
                      padding:'8px 16px', borderRadius:99,
                      border:`1px solid ${C.cream3}`,
                      background:C.cream,
                      color:C.navy,
                      fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:12,
                      cursor:'pointer', transition:'all .15s ease',
                    }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.gold; e.currentTarget.style.background='rgba(235,195,43,.08)'; e.currentTarget.style.color=C.goldDk }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.cream3; e.currentTarget.style.background=C.cream; e.currentTarget.style.color=C.navy }}>
                    {label}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Cierre editorial ── */}
          <div style={{
            marginTop:48, paddingTop:32,
            borderTop:`1px solid ${C.cream2}`,
            textAlign:'center',
          }}>
            <div style={{
              fontFamily:"'Bebas Neue',sans-serif", fontSize:14,
              color:C.goldDk, letterSpacing:'.3em',
              marginBottom:8,
            }}>· FIN DEL MANUAL ·</div>
            <p style={{
              fontSize:12, color:C.ink500, margin:0,
            }}>
              Prode ONE — Manual del Administrador · Mundial 2026
            </p>
          </div>

        </main>
      </div>

      {/* Responsive: oculta sidebar en mobile */}
      <style>{`
        @media (max-width: 900px) {
          aside { display: none !important; }
          main { padding: 0 20px 60px !important; }
        }
      `}</style>
    </div>
  )
}