import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../dashboard/AppShell.jsx'

/* ══════════════════════════════════════════════════════════════
   MANUAL DEL USUARIO — Prode
   Mismo diseño editorial que el manual admin
══════════════════════════════════════════════════════════════ */

/* ── Paleta ── */
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
  { id:'intro',        num:'01', label:'¿Qué puedo hacer?',      group:'Introducción'        },
  { id:'apuestas',     num:'02', label:'Apuestas',               group:'Usar el Sistema'     },
  { id:'fixture',      num:'03', label:'Fixture',                group:'Usar el Sistema'     },
  { id:'predicciones', num:'04', label:'Mis Predicciones',       group:'Usar el Sistema'     },
  { id:'puntos',       num:'05', label:'Sistema de Puntos',      group:'Referencia'          },
  { id:'faq',          num:'06', label:'Preguntas Frecuentes',   group:'Referencia'          },
]

const GROUPS = ['Introducción','Usar el Sistema','Referencia']

/* ──────────────────────────────────────────────
   COMPONENTES DE UI
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

function SectionHeader({ num, kicker, title, icon }) {
  return (
    <div style={{ marginBottom:30, position:'relative' }}>
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

function StateCard({ tag, tagColor, name, desc, accent=C.gold }) {
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
    </div>
  )
}

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
            {['Tipo','Puntos','Descripción'].map(h=>(
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
              <td style={{ padding:'12px 16px' }}>
                <span style={{
                  fontFamily:"'Bebas Neue',sans-serif", fontSize:20,
                  color:r.color, letterSpacing:'.02em',
                }}>{r.pts}</span>
              </td>
              <td style={{
                padding:'12px 16px',
                fontFamily:"'DM Sans',sans-serif",
                color:C.ink500,
              }}>{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

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

const Icon = (path) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:20, height:20 }}>
    {path}
  </svg>
)

const ICONS = {
  intro:    Icon(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>),
  apuestas: Icon(<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></>),
  fixture:  Icon(<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>),
  predes:   Icon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>),
  puntos:   Icon(<><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></>),
  faq:      Icon(<><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>),
}

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════ */

export default function ManualUser() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('intro')
  const contentRef = useRef(null)

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
    <AppShell>
      <div style={{
        background:C.cream,
        minHeight:'calc(100vh - 180px)',
        fontFamily:"'DM Sans',sans-serif",
        position:'relative',
      }}>
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

          {/* SIDEBAR */}
          <aside style={{
            position:'sticky', top:0, height:'100vh',
            padding:'32px 0 24px 24px',
            overflowY:'auto',
            borderRight:`1px solid ${C.cream2}`,
          }}>
            <div style={{ paddingRight:18, marginBottom:24 }}>
              <div style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize:24, color:C.navy, letterSpacing:'.04em',
                lineHeight:1, marginBottom:4,
              }}>
                MANUAL <span style={{ color:C.goldDk }}>USER</span>
              </div>
              <div style={{
                fontSize:10, fontWeight:700,
                textTransform:'uppercase', letterSpacing:'.2em',
                color:C.ink500, marginBottom:12,
              }}>
                Prode Talento · Mundial 2026
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
                Participante
              </span>
            </div>

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

          {/* CONTENIDO PRINCIPAL */}
          <main ref={contentRef} style={{
            padding:'0 36px 80px',
            minWidth:0,
          }}>

            {/* HERO */}
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
                Manual del Participante · v1.0
              </span>

              <h1 style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize:'clamp(3.5rem, 7vw, 6rem)',
                color:C.navy, letterSpacing:'.01em',
                lineHeight:.92, margin:'0 0 12px',
              }}>
                PARTICIPÁ Y<br/>
                <span style={{
                  color:C.goldDk,
                  textShadow:'0 0 32px rgba(235,195,43,.25)',
                }}>GANÁ PREMIOS</span>
              </h1>

              <p style={{
                fontFamily:"'DM Sans',sans-serif",
                fontSize:17, lineHeight:1.7, color:C.ink500,
                maxWidth:560, margin:'0 0 28px',
              }}>
                Guía completa para participar del prode interno del Mundial 2026. Aprendé a cargar tus predicciones, seguir tus puntos y competir por los premios.
              </p>
            </header>

            {/* 01 INTRO */}
            <section id="manual-intro" style={{ marginBottom:48, scrollMarginTop:24 }}>
              <SectionHeader num="01" kicker="Introducción" title="¿QUÉ PUEDE HACER EL USUARIO?" icon={ICONS.intro}/>
              <P>
                Como participante del prode interno, tenés acceso a tres secciones principales:
              </P>
              <div style={{
                display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',
                gap:14, margin:'24px 0',
              }}>
                <StateCard tag="Sección 1" tagColor={C.blueMed} accent={C.blueMed}
                  name="Apuestas"
                  desc="Donde cargás tus predicciones"/>
                <StateCard tag="Sección 2" tagColor={C.green} accent={C.green}
                  name="Fixture"
                  desc="Donde ves todos los partidos del Mundial"/>
                <StateCard tag="Sección 3" tagColor={C.goldDk} accent={C.gold}
                  name="Mis Predicciones"
                  desc="Donde seguís tu puntaje y tus aciertos"/>
              </div>
              <P>
                Eso es todo. No podés crear apuestas, aprobar usuarios ni modificar nada del sistema. <B>Solo predecís y seguís tus resultados.</B>
              </P>
            </section>

            <Divider/>

            {/* 02 APUESTAS */}
            <section id="manual-apuestas" style={{ marginBottom:48, scrollMarginTop:24 }}>
              <SectionHeader num="02" kicker="Usar el Sistema" title="SECCIÓN 1: APUESTAS" icon={ICONS.apuestas}/>
              
              <h3 style={{
                fontFamily:"'Bebas Neue',sans-serif", fontSize:22,
                color:C.navy, margin:'24px 0 12px', letterSpacing:'.03em',
              }}>¿Qué es una apuesta?</h3>
              <P>
                Una apuesta es un conjunto de partidos agrupados por el admin para que puedas predecir. Por ejemplo: <I>"Fase de Grupos"</I>, <I>"Octavos de Final"</I>, <I>"Final"</I>, etc. Cada apuesta tiene un premio definido para quien más puntos acumule en esos partidos.
              </P>

              <h3 style={{
                fontFamily:"'Bebas Neue',sans-serif", fontSize:22,
                color:C.navy, margin:'24px 0 12px', letterSpacing:'.03em',
              }}>¿Cómo cargar una predicción?</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8, margin:'14px 0' }}>
                {[
                  'Entrá a la sección Apuestas desde el menú.',
                  'Vas a ver las apuestas disponibles con su estado (abierta, cerrada, finalizada).',
                  'Hacé clic en una apuesta abierta.',
                  'Dentro de la apuesta, vas a ver la lista de partidos que la componen.',
                  'Para cada partido, ingresá cuántos goles creés que va a hacer cada equipo. Por ejemplo: Argentina 2 - Francia 1.',
                  'Guardá tu predicción con el botón correspondiente.',
                ].map((item,i)=>(
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
              <Callout type="warn">
                <B>Podés modificar tu predicción cuantas veces quieras mientras la apuesta esté abierta.</B> Una vez que la apuesta se cierra o el partido empieza, ya no podés cambiar nada.
              </Callout>

              <h3 style={{
                fontFamily:"'Bebas Neue',sans-serif", fontSize:22,
                color:C.navy, margin:'24px 0 12px', letterSpacing:'.03em',
              }}>Estados de una apuesta</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:12, margin:'18px 0' }}>
                <StateCard tag="Estado 1" tagColor={C.green} accent={C.green}
                  name="Abierta"
                  desc="Podés cargar y modificar tus predicciones libremente. El contador de tiempo muestra cuánto falta para que cierre."/>
                <StateCard tag="Estado 2" tagColor={C.ink300} accent={C.ink300}
                  name="Cerrada"
                  desc="El período de predicciones terminó. Los partidos están por jugarse o ya se están jugando. No podés modificar nada."/>
                <StateCard tag="Estado 3" tagColor={C.goldDk} accent={C.gold}
                  name="Finalizada"
                  desc="Todos los partidos terminaron y los puntos ya están calculados. Podés ver cuántos puntos sumaste en esa apuesta y tu posición en el ranking."/>
              </div>

              <h3 style={{
                fontFamily:"'Bebas Neue',sans-serif", fontSize:22,
                color:C.navy, margin:'24px 0 12px', letterSpacing:'.03em',
              }}>¿Qué pasa si no cargo una predicción?</h3>
              <P>
                Si no cargás predicción para un partido, ese partido te da <B style={{ color:C.red }}>0 puntos</B> automáticamente. No hay penalización extra, pero perdés la oportunidad de sumar. <B>Te conviene predecir todos los partidos</B> aunque no estés seguro del resultado.
              </P>

              <h3 style={{
                fontFamily:"'Bebas Neue',sans-serif", fontSize:22,
                color:C.navy, margin:'24px 0 12px', letterSpacing:'.03em',
              }}>¿Hasta cuándo puedo predecir?</h3>
              <P>
                Cada apuesta tiene una <B>fecha y hora de cierre</B> visible en la tarjeta. El sistema también muestra el tiempo restante en formato "2d 5h" o "45m". Una vez que ese contador llega a cero, la apuesta se cierra sola y no podés cargar más.
              </P>
            </section>

            <Divider/>

            {/* 03 FIXTURE */}
            <section id="manual-fixture" style={{ marginBottom:48, scrollMarginTop:24 }}>
              <SectionHeader num="03" kicker="Usar el Sistema" title="SECCIÓN 2: FIXTURE" icon={ICONS.fixture}/>
              
              <h3 style={{
                fontFamily:"'Bebas Neue',sans-serif", fontSize:22,
                color:C.navy, margin:'24px 0 12px', letterSpacing:'.03em',
              }}>¿Qué es el fixture?</h3>
              <P>
                El fixture muestra todos los partidos del Mundial 2026, organizados por fecha. Podés ver:
              </P>
              <ul style={{ margin:'14px 0', paddingLeft:24 }}>
                <li style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.ink700, marginBottom:8 }}>Los equipos que juegan</li>
                <li style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.ink700, marginBottom:8 }}>La fecha y hora de cada partido</li>
                <li style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.ink700, marginBottom:8 }}>El estado del partido: próximo, en vivo o finalizado</li>
                <li style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.ink700, marginBottom:8 }}>El resultado una vez que terminó</li>
              </ul>

              <h3 style={{
                fontFamily:"'Bebas Neue',sans-serif", fontSize:22,
                color:C.navy, margin:'24px 0 12px', letterSpacing:'.03em',
              }}>¿Para qué sirve?</h3>
              <P>
                El fixture es <B>solo de consulta</B>. No podés predecir desde acá, solo podés ver la información de los partidos. Te sirve para saber cuándo juegan los equipos y planificar tus predicciones antes del cierre de cada apuesta.
              </P>

              <h3 style={{
                fontFamily:"'Bebas Neue',sans-serif", fontSize:22,
                color:C.navy, margin:'24px 0 12px', letterSpacing:'.03em',
              }}>Estados de un partido</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12, margin:'18px 0' }}>
                <StateCard tagColor={C.ink300} accent={C.ink300}
                  name="Próximo"
                  desc="Todavía no empezó. Si la apuesta está abierta, podés predecir este partido."/>
                <StateCard tagColor={C.green} accent={C.green}
                  name="En vivo"
                  desc="El partido está en curso. Si ya cargaste predicción, podés ver tu pronóstico junto al marcador en tiempo real."/>
                <StateCard tagColor={C.goldDk} accent={C.gold}
                  name="Finalizado"
                  desc="El partido terminó. Vas a ver el resultado final y, si predijiste, cuántos puntos obtuviste."/>
              </div>
            </section>

            <Divider/>

            {/* 04 MIS PREDICCIONES */}
            <section id="manual-predicciones" style={{ marginBottom:48, scrollMarginTop:24 }}>
              <SectionHeader num="04" kicker="Usar el Sistema" title="SECCIÓN 3: MIS PREDICCIONES" icon={ICONS.predes}/>
              
              <h3 style={{
                fontFamily:"'Bebas Neue',sans-serif", fontSize:22,
                color:C.navy, margin:'24px 0 12px', letterSpacing:'.03em',
              }}>¿Qué muestra esta sección?</h3>
              <P>
                Acá ves todo tu <B>historial de predicciones</B>. Es tu panel personal donde podés seguir tu rendimiento a lo largo del torneo. Muestra:
              </P>
              <ul style={{ margin:'14px 0', paddingLeft:24 }}>
                <li style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.ink700, marginBottom:8 }}><B>Puntos totales</B> acumulados en todas las apuestas en las que participaste</li>
                <li style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.ink700, marginBottom:8 }}><B>Cantidad de predicciones</B> que cargaste en total</li>
                <li style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.ink700, marginBottom:8 }}><B>Exactos</B> — cuántas veces acertaste el marcador exacto</li>
                <li style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.ink700, marginBottom:8 }}><B>Cantidad de apuestas</B> en las que participaste</li>
              </ul>

              <h3 style={{
                fontFamily:"'Bebas Neue',sans-serif", fontSize:22,
                color:C.navy, margin:'24px 0 12px', letterSpacing:'.03em',
              }}>¿Cómo se organiza?</h3>
              <P>
                Las apuestas aparecen como tarjetas. Podés expandir cada una haciendo clic para ver el detalle partido por partido. En cada partido vas a ver:
              </P>
              <ul style={{ margin:'14px 0', paddingLeft:24 }}>
                <li style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.ink700, marginBottom:8 }}>Tu predicción (ej: 2-1)</li>
                <li style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.ink700, marginBottom:8 }}>El resultado real (una vez que terminó)</li>
                <li style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.ink700, marginBottom:8 }}>Los puntos que obtuviste en ese partido</li>
                <li style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.ink700, marginBottom:8 }}>Un indicador de si fue exacto, diferencia, resultado o cero</li>
              </ul>

              <h3 style={{
                fontFamily:"'Bebas Neue',sans-serif", fontSize:22,
                color:C.navy, margin:'24px 0 12px', letterSpacing:'.03em',
              }}>¿Dónde veo mi posición en el ranking?</h3>
              <P>
                Desde <B>Mis Predicciones</B> ves tus puntos. Para ver tu posición exacta respecto a los demás, vas a la sección <B>Ranking</B> desde el menú. Ahí podés seleccionar una apuesta y ver la tabla completa con todos los participantes. Tu posición aparece destacada, y si estás fuera del top visible, el sistema muestra tu fila pegada al final para que siempre sepas dónde estás.
              </P>
            </section>

            <Divider/>

            {/* 05 SISTEMA DE PUNTOS */}
            <section id="manual-puntos" style={{ marginBottom:48, scrollMarginTop:24 }}>
              <SectionHeader num="05" kicker="Referencia" title="SISTEMA DE PUNTOS" icon={ICONS.puntos}/>
              <P>
                Para que sepas cuánto vale cada tipo de acierto:
              </P>
              <ScoreTable rows={[
                { tipo:'Exacto',          pts:'+5 pts', desc:'Acertás el marcador exacto. Ejemplo: predices 2-1 y el resultado es 2-1.',                                        color:C.green },
                { tipo:'Diferencia',      pts:'+3 pts', desc:'Acertás la diferencia de goles pero no el marcador exacto. Ejemplo: predices 2-1 y el resultado es 3-2 (ambos tienen diferencia de 1 gol).', color:C.goldDk },
                { tipo:'Resultado',       pts:'+1 pt',  desc:'Acertás quién gana o que va a empatar, pero sin acertar la diferencia ni el marcador. Ejemplo: predices 2-1 y el resultado es 3-1 (acertaste que ganaba ese equipo).', color:C.blueMed },
                { tipo:'Falla',           pts:'0 pts',  desc:'No acertás el resultado. Predices que gana uno y gana el otro, o predices empate y hay un ganador, etc.',              color:C.red },
                { tipo:'Sin predicción',  pts:'0 pts',  desc:'No cargaste ningún pronóstico para ese partido.',                                    color:C.ink300 },
              ]}/>
            </section>

            <Divider/>

            {/* 06 FAQ */}
            <section id="manual-faq" style={{ marginBottom:48, scrollMarginTop:24 }}>
              <SectionHeader num="06" kicker="Referencia" title="PREGUNTAS FRECUENTES" icon={ICONS.faq}/>
              
              {[
                { q:'¿Puedo ver las predicciones de otros usuarios?', a:'No podés ver las predicciones de otros participantes mientras la apuesta está abierta. Una vez finalizada, el ranking muestra los puntos de todos, pero el detalle de las predicciones individuales de cada persona es privado.' },
                { q:'¿Me avisan cuando hay una nueva apuesta?', a:'El admin se encarga de comunicar cuando abre una nueva apuesta. Revisá la sección Apuestas periódicamente, especialmente cuando empieza una nueva fase del torneo.' },
                { q:'¿Qué pasa si hay un empate en puntos en el ranking?', a:'El sistema ordena por puntos totales. En caso de igualdad, el ranking muestra a ambos participantes con la misma posición.' },
                { q:'¿Puedo cargar predicciones desde el celular?', a:'Sí, la plataforma funciona en el navegador del celular. No necesitás instalar nada.' },
                { q:'¿Qué significa el indicador "Cerrada" en el tiempo restante?', a:'Significa que la fecha límite ya pasó y no se aceptan más predicciones para esa apuesta.' },
                { q:'¿Puedo cambiar mi predicción después de guardarla?', a:'Sí, podés modificarla cuantas veces quieras mientras la apuesta esté abierta. Solo el último valor guardado cuenta.' },
              ].map((faq,i)=>(
                <div key={i} style={{ marginBottom:20 }}>
                  <h3 style={{
                    fontFamily:"'DM Sans',sans-serif", fontSize:16, fontWeight:700,
                    color:C.navy, margin:'0 0 8px',
                  }}>{faq.q}</h3>
                  <p style={{
                    fontFamily:"'DM Sans',sans-serif", fontSize:14, lineHeight:1.65,
                    color:C.ink700, margin:0,
                  }}>{faq.a}</p>
                </div>
              ))}
            </section>

            {/* Cierre */}
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
                Prode Talento — Manual del Participante · Mundial 2026
              </p>
            </div>

          </main>
        </div>

        <style>{`
          @media (max-width: 900px) {
            aside { display: none !important; }
            main { padding: 0 20px 60px !important; }
          }
        `}</style>
      </div>
    </AppShell>
  )
}