/**
 * RankingPageUser.jsx — Diseño premium v6 (USER VERSION)
 * Ubicación: src/pages/RankingPageUser.jsx
 *
 * Mismo diseño que RankingPage.jsx pero:
 * - Sin expandir predicciones
 * - Solo muestra TOP 3
 * - Solo puntajes totales visibles
 *
 * v6.1 — Dimensiones alineadas con FixturePage (maxWidth:1400, padding:'2rem 1.5rem 3rem')
 *        y header con estilo navy + dorado (RANKING + en dorado)
 */
import { useState, useMemo, useEffect } from 'react'
import AppShell from '../dashboard/AppShell.jsx'
import { useBets } from '../hooks/useBets.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import sheetsApi from '../services/sheetsApi.js'

/* ─── helpers ─── */
function isOpen(b)   { return b.estado==='abierta' && new Date(b.fecha_cierre)>Date.now() }
function initials(n) { return (n||'').trim().split(/\s+/).slice(0,2).map(w=>w[0]?.toUpperCase()||'').join('')||'?' }

/* ─── estilos globales ─── */
const CSS = `
@keyframes rk-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes rk-fade { from{opacity:0} to{opacity:1} }
@keyframes rk-shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
.rk-in { animation: rk-in .28s ease both }

/* Panel izquierdo */
.rk-sidebar { width:380px;flex-shrink:0;display:flex;flex-direction:column;overflow:hidden;background:#fcfaf6;border-right:1px solid #f0eadb }
.rk-sidebar-scroll::-webkit-scrollbar { width:2px }
.rk-sidebar-scroll::-webkit-scrollbar-thumb { background:#e2ddd6;border-radius:99px }

/* Fila apuesta */
.rk-row { display:flex;align-items:center;gap:10px;padding:11px 16px;cursor:pointer;border-bottom:1px solid #f5f3ee;position:relative;transition:background .13s }
.rk-row:hover { background:rgba(12,24,43,.03) }
.rk-row.sel { background:#0c182b;border-bottom-color:rgba(255,255,255,.06) }
.rk-row::before { content:'';position:absolute;left:0;top:25%;bottom:25%;width:3px;background:#ebc32b;border-radius:0 3px 3px 0;opacity:0;transition:opacity .13s }
.rk-row.sel::before { opacity:1 }

/* Panel derecho */
.rk-content { flex:1;min-width:0;overflow-y:auto;background:#faf7f0 }
.rk-content::-webkit-scrollbar { width:4px }
.rk-content::-webkit-scrollbar-thumb { background:#e2ddd6;border-radius:99px }

/* Podio cards */
.rk-pcard { border-radius:16px;text-align:center;position:relative;overflow:visible;transition:transform .16s,box-shadow .16s }

/* Skeleton */
.rk-sk { background:linear-gradient(90deg,rgba(12,24,43,.06) 25%,rgba(12,24,43,.1) 50%,rgba(12,24,43,.06) 75%);background-size:400px 100%;animation:rk-shimmer 1.4s ease infinite;border-radius:8px }

/* Mobile */
@media(max-width:720px) {
  .rk-shell { flex-direction:column!important;height:auto!important }
  .rk-sidebar { width:100%;max-height:220px;border-right:none!important;border-bottom:1px solid rgba(255,255,255,.08) }
  .rk-content { padding:16px!important }
  .rk-podio-grid { grid-template-columns:1fr!important;max-width:220px!important }
}
`

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
export default function RankingPageUser() {
  const { bets, loading:lb } = useBets()
  const { user }  = useAuth()

  const [sel, setSel]             = useState(null)
  const [tabla, setTabla]         = useState([])
  const [meta, setMeta]           = useState({})
  const [loading, setLoading]     = useState(false)

  async function cargarRanking(bet) {
    if (sel?.id===bet.id) return
    setSel(bet); setLoading(true); setTabla([]); setMeta({})
    try {
      const [rT, rA] = await Promise.all([sheetsApi.predicciones.tabla(bet.id), sheetsApi.apuestas.obtener(bet.id)])
      setTabla(rT.tabla||[])
      setMeta({ total:rT.total, mi_posicion:rT.mi_posicion, esta_en_top:rT.esta_en_top })
      setSel(prev=>({...(prev||bet),...rA.apuesta}))
    } catch(e) { alert('Error: '+e.message) }
    finally { setLoading(false) }
  }

  return (
    <AppShell>
      <style>{CSS}</style>

      {/* ⚡ Dimensiones alineadas con FixturePage */}
      <div style={{ maxWidth:1400, margin:'0 auto', padding:'2rem 1.5rem 3rem' }}>

        {/* Título página — RANKING navy + (subtítulo gris debajo) */}
        <div className="rk-in" style={{ marginBottom:'1.5rem' }}>
          <h1 style={{
            fontFamily:"'Bebas Neue',sans-serif",
            fontSize:'clamp(2.4rem,6vw,3.5rem)',
            margin:'0 0 .3rem',
            lineHeight:1,
            letterSpacing:'.02em',
          }}>
            <span style={{color:'#0c182b'}}>RANKING</span>
          </h1>
          <p style={{ fontSize:'.84rem', color:'#5f6e8a', margin:0 }}>
            {sel ? sel.titulo : 'Seleccioná una apuesta para ver el ranking'}
          </p>
        </div>

        {/* Shell principal — altura ajustada al nuevo padding */}
        <div className="rk-shell" style={{display:'flex',height:'calc(100vh - 200px)',minHeight:520,borderRadius:20,overflow:'hidden',boxShadow:'0 8px 48px rgba(12,24,43,.14)'}}>

          {/* ══ SIDEBAR CREAM ══ */}
          <div className="rk-sidebar">
            {/* Header sidebar */}
            <div style={{padding:'20px 16px 14px',borderBottom:'1px solid #f0eadb'}}>
              <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,letterSpacing:'.2em',color:'#94a3b8',margin:'0 0 10px'}}>APUESTAS</p>
              <div style={{display:'flex',gap:6}}>
                <Pill color="#22c55e" label={`${bets.filter(b=>isOpen(b)).length} activas`}/>
                <Pill color="#64748b" label={`${bets.filter(b=>!isOpen(b)).length} cerradas`}/>
              </div>
            </div>

            <div className="rk-sidebar-scroll">
              {lb ? (
                <div style={{padding:12,display:'flex',flexDirection:'column',gap:4}}>
                  {[...Array(6)].map((_,i)=><div key={i} className="rk-sk" style={{height:52}}/>)}
                </div>
              ) : (
                <>
                  {bets.filter(b=>isOpen(b)).length>0 && (
                    <SideSection label="Activas" dot="#22c55e">
                      {bets.filter(b=>isOpen(b)).map(b=>(
                        <BetRow key={b.id} bet={b} sel={sel?.id===b.id} onPick={cargarRanking}/>
                      ))}
                    </SideSection>
                  )}
                  <SideSection label="Historial">
                    {bets.filter(b=>!isOpen(b)).map(b=>(
                      <BetRow key={b.id} bet={b} sel={sel?.id===b.id} onPick={cargarRanking}/>
                    ))}
                  </SideSection>
                </>
              )}
            </div>
          </div>

          {/* ══ CONTENIDO DERECHO ══ */}
          <div className="rk-content" style={{padding:'24px 32px 32px'}}>

            {!sel ? (
              <EmptySelect/>
            ) : (
              <div className="rk-in">

                {/* Banner */}
                <Banner apuesta={sel} meta={meta} loading={loading}/>

                {loading ? (
                  <SkeletonContent/>
                ) : tabla.length===0 ? (
                  <SinParticipantes/>
                ) : (
                  <>
                    <Podio
                      top={tabla.slice(0,3)}
                      miId={user?.id}
                      apuesta={sel}
                    />

                    {!meta.esta_en_top && meta.mi_posicion && (
                      <MiPosicion pos={meta.mi_posicion}/>
                    )}

                    {tabla.length > 3 && (
                      <OtrosParticipantes tabla={tabla} user={user} />
                    )}

                    <LeyendaPuntos apuesta={sel} total={meta.total}/>

                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

/* ══════════════════════════════════════════
   SIDEBAR COMPONENTS
══════════════════════════════════════════ */
function Pill({ color, label }) {
  return (
    <span style={{fontSize:9,fontWeight:700,color,background:`${color}18`,border:`1px solid ${color}30`,borderRadius:99,padding:'2px 8px'}}>
      {label}
    </span>
  )
}

function SideSection({ label, dot, children }) {
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px 4px',position:'sticky',top:0,background:'#fcfaf6',zIndex:2}}>
        {dot && <span style={{width:5,height:5,borderRadius:'50%',background:dot,display:'inline-block',boxShadow:`0 0 6px ${dot}`}}/>}
        <span style={{fontSize:8,fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',color:'#b8c0cc'}}>{label}</span>
      </div>
      {children}
    </div>
  )
}

function BetRow({ bet, sel, onPick }) {
  const open = isOpen(bet)
  const fin  = bet.estado==='finalizada'
  const col  = fin?'#ebc32b':open?'#22c55e':'#475569'
  const parts = bet.partidos_ids?bet.partidos_ids.split(',').filter(Boolean).length:0
  return (
    <div className={`rk-row${sel?' sel':''}`} onClick={()=>onPick(bet)}>
      <div style={{width:7,height:7,borderRadius:'50%',background:col,flexShrink:0,boxShadow:open?`0 0 6px ${col}`:sel?`0 0 4px ${col}`:'none'}}/>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontSize:12,fontWeight:600,color:sel?'#fff':'#0c182b',margin:'0 0 2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
          {bet.titulo}
        </p>
        <p style={{fontSize:10,color:'#94a3b8',margin:0}}>
          {bet.participantes||0} part · {parts} partidos
        </p>
      </div>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={sel?'#ebc32b':'#c8d0dc'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  )
}

/* ══════════════════════════════════════════
   BANNER
══════════════════════════════════════════ */
function Banner({ apuesta, meta, loading }) {
  return (
    <div style={{borderRadius:14,marginBottom:24,background:'linear-gradient(125deg,#0c182b 0%,#1a3060 100%)',padding:'18px 22px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:-30,right:-30,width:180,height:180,borderRadius:'50%',background:'rgba(235,195,43,.08)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:-40,right:80,width:120,height:120,borderRadius:'50%',background:'rgba(235,195,43,.05)',pointerEvents:'none'}}/>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,position:'relative'}}>
        <div>
          <span style={{fontSize:9,fontWeight:800,textTransform:'uppercase',letterSpacing:'.22em',color:'rgba(235,195,43,.55)',display:'block',marginBottom:4}}>
            TABLA DE POSICIONES
          </span>
          <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(22px,3vw,32px)',color:'#fff',margin:'0 0 6px',letterSpacing:'.02em',lineHeight:1}}>
            {apuesta.titulo}
          </h2>
          {apuesta.premio && (
            <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(235,195,43,.1)',border:'1px solid rgba(235,195,43,.2)',borderRadius:99,padding:'3px 10px'}}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ebc32b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
              </svg>
              <span style={{fontSize:10,color:'rgba(235,195,43,.8)',fontWeight:600}}>{apuesta.premio}</span>
            </div>
          )}
        </div>

        {!loading && (
          <div style={{display:'flex',gap:20,flexShrink:0}}>
            {meta.total>0 && <BannerStat n={meta.total} label="Part."/>}
            {meta.mi_posicion && <BannerStat n={`#${meta.mi_posicion.posicion}`} label="Tu pos." gold/>}
          </div>
        )}
      </div>
    </div>
  )
}

function BannerStat({ n, label, gold }) {
  return (
    <div style={{textAlign:'center'}}>
      <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:gold?'#ebc32b':'rgba(255,255,255,.9)',margin:'0 0 1px',lineHeight:1}}>{n}</p>
      <p style={{fontSize:9,textTransform:'uppercase',letterSpacing:'.14em',color:'rgba(255,255,255,.35)',margin:0}}>{label}</p>
    </div>
  )
}

/* ══════════════════════════════════════════
   PODIO (SIN EXPANDIR)
══════════════════════════════════════════ */
const PODIO_CFG = {
  0: { grad:'linear-gradient(145deg,#f5d75a 0%,#c99f16 100%)', shadow:'rgba(235,195,43,.5)', border:'rgba(235,195,43,.7)', ring:'rgba(235,195,43,.3)', emoji:'🥇', label:'1°' },
  1: { grad:'linear-gradient(145deg,#e2e8f0 0%,#94a3b8 100%)', shadow:'rgba(148,163,184,.4)', border:'rgba(148,163,184,.5)', ring:'rgba(148,163,184,.2)', emoji:'🥈', label:'2°' },
  2: { grad:'linear-gradient(145deg,#fed7aa 0%,#c2720e 100%)', shadow:'rgba(194,114,14,.4)',  border:'rgba(194,114,14,.5)',  ring:'rgba(194,114,14,.2)',  emoji:'🥉', label:'3°' },
}

function Podio({ top, miId, apuesta }) {
  if (!top.length) return null

  const orden   = top.length===1?[top[0]]:top.length===2?[top[1],top[0]]:[top[1],top[0],top[2]]
  const rankOf  = u => top.findIndex(x=>x.user_id===u.user_id)

  return (
    <div style={{marginBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,letterSpacing:'.18em',color:'#94a3b8'}}>TOP 3</span>
        <div style={{flex:1,height:1,background:'linear-gradient(90deg,#e2ddd6,transparent)'}}/>
      </div>

      <div className="rk-podio-grid" style={{
        display:'grid',
        gridTemplateColumns:top.length===1?'1fr':top.length===2?'1fr 1fr':'1fr 1.08fr 1fr',
        gap:12, alignItems:'end',
        maxWidth:top.length===1?200:top.length===2?420:'100%',
        margin:'0 auto',
      }}>
        {orden.map(u => {
          const rank   = rankOf(u)
          const cfg    = PODIO_CFG[rank]
          const isTop  = rank===0
          const me     = u.user_id===miId
          const sz     = isTop ? 60 : 48

          return (
            <div key={u.user_id} className="rk-pcard"
              style={{
                background:'#fff',
                border:`${isTop?2:1.5}px solid ${isTop?cfg.border:'#e8e3db'}`,
                padding: isTop ? '20px 14px 14px' : '16px 12px 12px',
                boxShadow: isTop
                  ? `0 0 0 4px ${cfg.ring}, 0 12px 40px ${cfg.shadow}`
                  : '0 2px 12px rgba(12,24,43,.06)',
              }}>

              {isTop && (
                <div style={{position:'absolute',top:-13,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(90deg,#c99f16,#ebc32b)',color:'#fff',fontSize:8,fontWeight:800,letterSpacing:'.16em',textTransform:'uppercase',padding:'3px 14px',borderRadius:99,whiteSpace:'nowrap',boxShadow:'0 2px 10px rgba(235,195,43,.5)'}}>
                  ★ LÍDER
                </div>
              )}

              <div style={{fontSize:isTop?28:20,marginBottom:10,lineHeight:1}}>{cfg.emoji}</div>

              <div style={{
                width:sz, height:sz, borderRadius:'50%',
                background:cfg.grad,
                margin:'0 auto 10px',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize:isTop?22:17,
                color:'#fff',
                boxShadow:`0 0 0 3px #fff, 0 0 0 ${isTop?6:5}px ${cfg.ring}, 0 6px 20px ${cfg.shadow}`,
                letterSpacing:'.04em',
              }}>{initials(u.nombre)}</div>

              <p style={{fontWeight:700,fontSize:isTop?15:13,color:'#0c182b',margin:'0 0 2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {u.nombre}
                {me && <span style={{fontSize:10,color:'#94a3b8',fontWeight:400,marginLeft:4}}>(vos)</span>}
              </p>

              <p style={{fontSize:10,color:'#94a3b8',margin:'0 0 12px'}}>
                {u.predicciones} pred · {u.aciertos_exactos} ✓
              </p>

              <div style={{
                background: isTop ? 'linear-gradient(135deg,rgba(235,195,43,.12),rgba(235,195,43,.06))' : 'rgba(12,24,43,.04)',
                border: isTop ? '1px solid rgba(235,195,43,.25)' : '1px solid #f0eadb',
                borderRadius:10, padding:'8px 0',
              }}>
                <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:isTop?36:28,color:isTop?'#c99f16':'#0c182b',margin:0,lineHeight:1}}>
                  {u.puntos_totales}
                </p>
                <p style={{fontSize:8,fontWeight:700,textTransform:'uppercase',letterSpacing:'.14em',color:'#94a3b8',margin:'2px 0 0'}}>puntos</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   MI POSICIÓN (sticky) - SIN EXPANDIR
══════════════════════════════════════════ */
function MiPosicion({ pos }) {
  return (
    <div style={{position:'sticky',bottom:12,marginTop:12,zIndex:10}}>
      <div style={{borderRadius:13,overflow:'hidden',boxShadow:'0 8px 32px rgba(12,24,43,.28)',border:'2px solid rgba(235,195,43,.45)'}}>
        <div style={{
          display:'grid',gridTemplateColumns:'44px 1fr 100px 68px',
          padding:'10px 16px',gap:8,alignItems:'center',
          background:'linear-gradient(90deg,#0c182b,#17376a)',
        }}>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:'#ebc32b'}}>#{pos.posicion}</span>
          <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#ebc32b,#c99f16)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue',sans-serif",fontSize:12,color:'#0c182b',flexShrink:0}}>
              {initials(pos.nombre)}
            </div>
            <div style={{minWidth:0}}>
              <p style={{fontWeight:700,fontSize:13,color:'#fff',margin:'0 0 1px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {pos.nombre}<span style={{fontSize:10,color:'#ebc32b',fontWeight:400,marginLeft:4}}>(vos)</span>
              </p>
              <p style={{fontSize:10,color:'rgba(255,255,255,.4)',margin:0}}>{pos.predicciones} predicciones</p>
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'center',gap:8}}>
            {[['#22c55e',pos.aciertos_exactos],['#ebc32b',pos.aciertos_diferencia||0],['rgba(255,255,255,.45)',pos.aciertos_resultado]].map(([c,n],i)=>(
              <span key={i} style={{display:'inline-flex',alignItems:'center',gap:3,fontSize:11,fontWeight:600,color:n>0?c:'rgba(255,255,255,.2)'}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:n>0?c:'rgba(255,255,255,.1)',display:'inline-block'}}/>
                {n}
              </span>
            ))}
          </div>
          <div style={{textAlign:'center'}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:'#ebc32b'}}>{pos.puntos_totales}</span>
            <span style={{fontSize:8,color:'rgba(255,255,255,.3)',marginLeft:2,letterSpacing:'.1em',fontWeight:700,display:'block'}}>PTS</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   LEYENDA Y ESTADOS VACÍOS
══════════════════════════════════════════ */
function LeyendaPuntos({ apuesta, total }) {
  const e=parseInt(apuesta?.puntos_exacto)||5, d=parseInt(apuesta?.puntos_diferencia)||3, r=parseInt(apuesta?.puntos_resultado)||1
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8,fontSize:10,color:'#94a3b8',paddingTop:12,borderTop:'1px solid #e8e3db',marginTop:12}}>
      <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
        {[['#22c55e',`Exacto +${e}pts`],['#ebc32b',`Diferencia +${d}pts`],['#94a3b8',`Resultado +${r}pt${r===1?'':'s'}`],['#f43f5e','Sin acierto 0pts']].map(([c,l])=>(
          <span key={l} style={{display:'inline-flex',alignItems:'center',gap:5}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:c,display:'inline-block'}}/>
            {l}
          </span>
        ))}
      </div>
      {total>0 && <span>Mostrando top 3 de {total} participantes</span>}
    </div>
  )
}

function EmptySelect() {
  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:40,textAlign:'center',gap:20}}>
      <div style={{width:80,height:80,borderRadius:24,background:'linear-gradient(145deg,#0c182b,#1a3060)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 12px 40px rgba(12,24,43,.2)'}}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(235,195,43,.6)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      </div>
      <div>
        <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:'#0c182b',margin:'0 0 6px',letterSpacing:'.04em'}}>SELECCIONÁ UNA APUESTA</p>
        <p style={{fontSize:13,color:'#94a3b8',margin:0,lineHeight:1.7}}>Elegí una apuesta del panel de la<br/>izquierda para ver su ranking</p>
      </div>
      <div style={{display:'flex',gap:8,alignItems:'flex-end',opacity:.15,marginTop:8,pointerEvents:'none'}}>
        {[80,110,80].map((h,i)=>(
          <div key={i} style={{width:56,height:h,borderRadius:12,background:`linear-gradient(180deg,${i===1?'#ebc32b':'#cbd5e1'},transparent)`}}/>
        ))}
      </div>
    </div>
  )
}

function SinParticipantes() {
  return (
    <div style={{textAlign:'center',padding:'48px 24px',background:'#fff',borderRadius:14,border:'1.5px solid #e8e3db'}}>
      <p style={{fontWeight:700,color:'#64748b',margin:'0 0 6px',fontSize:15}}>Sin participantes todavía</p>
      <p style={{fontSize:12,color:'#94a3b8',margin:0,lineHeight:1.6}}>Las predicciones aparecerán cuando los participantes las carguen</p>
    </div>
  )
}

function SkeletonContent() {
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1.08fr 1fr',gap:12,marginBottom:24,alignItems:'end'}}>
        {[110,145,110].map((h,i)=><div key={i} className="rk-sk" style={{height:h,borderRadius:16}}/>)}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   OTROS PARTICIPANTES — Con toggle
══════════════════════════════════════════ */
function OtrosParticipantes({ tabla, user }) {
  const [exp, setExp] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('otros_participantes_expanded')) ?? true
    } catch {
      return true
    }
  })

  useEffect(() => {
    sessionStorage.setItem('otros_participantes_expanded', JSON.stringify(exp))
  }, [exp])

  const otros = tabla.slice(3)

  return (
    <div style={{marginTop:20}}>
      <button
        onClick={() => setExp(!exp)}
        style={{
          width:'100%',
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
          padding:'10px 0',
          background:'none',
          border:'none',
          cursor:'pointer',
          transition:'opacity .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <div style={{display:'flex',alignItems:'center',gap:8,flex:1}}>
          <span style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.14em',color:'#94a3b8'}}>
            Otros participantes
          </span>
          <span style={{fontSize:8,fontWeight:700,background:'rgba(12,24,43,.05)',color:'#c8d0dc',padding:'1px 6px',borderRadius:4}}>
            +{otros.length}
          </span>
          <div style={{flex:1,height:'1px',background:'linear-gradient(90deg,#e8e3db,transparent)',marginLeft:8}}/>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{transition:'transform .2s',transform:exp?'rotate(180deg)':'rotate(0deg)',flexShrink:0,marginLeft:8}}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {exp && (
        <div style={{display:'flex',flexDirection:'column',gap:6,paddingTop:12}}>
          {otros.map((u, idx) => (
            <div key={u.user_id} style={{
              display:'grid',
              gridTemplateColumns:'32px 1fr 64px 56px',
              gap:10,
              padding:'9px 12px',
              background: u.user_id === user?.id ? 'rgba(235,195,43,.1)' : '#fff',
              border: u.user_id === user?.id ? '1.5px solid #ebc32b' : '1px solid #f5f3ee',
              boxShadow: u.user_id === user?.id ? '0 0 0 1px rgba(235,195,43,.3), 0 2px 8px rgba(235,195,43,.12)' : 'none',
              borderRadius:10,
              alignItems:'center',
              transition:'all .15s',
            }}
              onMouseEnter={e => {
                if (u.user_id !== user?.id) {
                  e.currentTarget.style.background='#fcfaf6'
                  e.currentTarget.style.borderColor='#e8e3db'
                }
              }}
              onMouseLeave={e => {
                if (u.user_id !== user?.id) {
                  e.currentTarget.style.background='#fff'
                  e.currentTarget.style.borderColor='#f5f3ee'
                }
              }}>

              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,color:'#94a3b8',textAlign:'center'}}>#{idx+4}</span>

              <div style={{minWidth:0}}>
                <p style={{fontWeight: u.user_id === user?.id ? 700 : 500,fontSize:11,color: u.user_id === user?.id ? '#ebc32b' : '#0c182b',margin:'0 0 1px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {u.nombre}
                  {u.user_id === user?.id && (
                    <span style={{
                      fontSize:8,
                      color:'#ebc32b',
                      marginLeft:6,
                      fontWeight:700,
                      background:'rgba(235,195,43,.15)',
                      border:'1px solid rgba(235,195,43,.3)',
                      padding:'1px 5px',
                      borderRadius:3,
                      textTransform:'uppercase',
                      letterSpacing:'.05em'
                    }}>
                      (vos)
                    </span>
                  )}
                </p>
                <p style={{fontSize:8,color:'#c8d0dc',margin:0}}>{u.predicciones} pred</p>
              </div>

              <div style={{display:'flex',gap:4,justifyContent:'flex-start'}}>
                {[{v:u.aciertos_exactos,c:'#22c55e'},{v:u.aciertos_diferencia||0,c:'#ebc32b'}].map((x,i)=>(
                  x.v > 0 && (
                    <span key={i} style={{display:'flex',alignItems:'center',justifyContent:'center',width:22,height:22,borderRadius:5,background:`${x.c}12`,border:`1px solid ${x.c}25`,fontSize:9,fontWeight:600,color:x.c}}>{x.v}</span>
                  )
                ))}
              </div>

              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,fontWeight:700,color:'#0c182b',textAlign:'right'}}>{u.puntos_totales}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}