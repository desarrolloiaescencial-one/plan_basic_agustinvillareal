/**
 * RankingPage.jsx — Diseño premium v6
 * Ubicación: src/dashboard/RankingPage.jsx
 *
 * Estética: dark panel izquierdo navy profundo + contenido derecho cream
 * Con micro-detalles, tipografía marcada y jerarquía visual fuerte.
 */
import { useState, useMemo } from 'react'
import AppShell from './AppShell.jsx'
import { useBets } from '../hooks/useBets.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import sheetsApi from '../services/sheetsApi.js'
import { fmtFecha } from '../utils/index.js'

/* ─── helpers ─── */
function isOpen(b)   { return b.estado==='abierta' && new Date(b.fecha_cierre)>Date.now() }
function initials(n) { return (n||'').trim().split(/\s+/).slice(0,2).map(w=>w[0]?.toUpperCase()||'').join('')||'?' }
function clasificar(p,ap) {
  const e=parseInt(ap?.puntos_exacto)||5,d=parseInt(ap?.puntos_diferencia)||3,r=parseInt(ap?.puntos_resultado)||1
  const n=parseInt(p); if(isNaN(n)) return null
  if(n===e) return 'exacto'; if(n===d) return 'diferencia'; if(n===r) return 'resultado'; return 'cero'
}

const CAT_COLOR = {
  exacto:     '#22c55e',
  diferencia: '#ebc32b',
  resultado:  '#94a3b8',
  cero:       '#f43f5e',
}

/* ─── estilos globales ─── */
const CSS = `
@keyframes rk-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes rk-fade { from{opacity:0} to{opacity:1} }
@keyframes rk-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
@keyframes rk-shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
.rk-in { animation: rk-in .28s ease both }

/* Panel izquierdo */
.rk-sidebar { width:380px;flex-shrink:0;display:flex;flex-direction:column;overflow:hidden;background:#fcfaf6;border-right:1px solid #f0eadb }
.rk-sidebar-scroll { overflow-y:auto;flex:1 }
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
.rk-pcard { border-radius:16px;text-align:center;position:relative;overflow:visible;transition:transform .16s,box-shadow .16s;cursor:pointer }
.rk-pcard:hover { transform:translateY(-4px) }

/* Tabla filas */
.rk-trow { transition:background .12s;cursor:pointer }
.rk-trow:hover { background:rgba(12,24,43,.03) !important }

/* Skeleton */
.rk-sk { background:linear-gradient(90deg,rgba(12,24,43,.06) 25%,rgba(12,24,43,.1) 50%,rgba(12,24,43,.06) 75%);background-size:400px 100%;animation:rk-shimmer 1.4s ease infinite;border-radius:8px }
.rk-sk-dark { background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 75%);background-size:400px 100%;animation:rk-shimmer 1.4s ease infinite;border-radius:8px }

/* Mobile */
@media(max-width:720px) {
  .rk-shell { flex-direction:column!important;height:auto!important }
  .rk-sidebar { width:100%;max-height:220px;border-right:none!important;border-bottom:1px solid rgba(255,255,255,.08) }
  .rk-content { padding:16px!important }
  .rk-hide-mob { display:none!important }
  .rk-podio-grid { grid-template-columns:1fr!important;max-width:220px!important }
}
`

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
export default function RankingPage() {
  const { bets, loading:lb } = useBets()
  const { user }  = useAuth()
  const esAdmin   = user?.rol==='admin'||user?.es_admin===true||user?.tipo_usuario==='admin'

  const [sel, setSel]             = useState(null)
  const [tabla, setTabla]         = useState([])
  const [meta, setMeta]           = useState({})
  const [loading, setLoading]     = useState(false)
  const [expandido, setExpandido] = useState(null)
  const [detalles, setDetalles]   = useState({})
  const [q, setQ]                 = useState('')

  async function cargarRanking(bet) {
    if (sel?.id===bet.id) return
    setSel(bet); setLoading(true); setTabla([]); setMeta({}); setExpandido(null); setDetalles({}); setQ('')
    try {
      const [rT, rA] = await Promise.all([sheetsApi.predicciones.tabla(bet.id), sheetsApi.apuestas.obtener(bet.id)])
      setTabla(rT.tabla||[])
      setMeta({ total:rT.total, mi_posicion:rT.mi_posicion, esta_en_top:rT.esta_en_top })
      setSel(prev=>({...(prev||bet),...rA.apuesta}))
    } catch(e) { alert('Error: '+e.message) }
    finally { setLoading(false) }
  }

  async function toggleExpandir(uid) {
    if (!(esAdmin||uid===user?.id)) return
    if (expandido===uid) { setExpandido(null); return }
    setExpandido(uid)
    if (detalles[uid]&&!detalles[uid].error) return
    setDetalles(p=>({...p,[uid]:{loading:true,preds:[],error:null}}))
    try {
      const resp = uid===user?.id
        ? await sheetsApi.predicciones.mias(sel.id)
        : typeof sheetsApi.predicciones.deUsuario==='function'
          ? await sheetsApi.predicciones.deUsuario(sel.id,uid)
          : (() => { throw new Error('Actualizá sheetsApi.js para ver predicciones de otros usuarios.') })()
      setDetalles(p=>({...p,[uid]:{loading:false,preds:resp.predicciones||[],error:null}}))
    } catch(e) {
      setDetalles(p=>({...p,[uid]:{loading:false,preds:[],error:e.message}}))
    }
  }

  const filasFiltradas = useMemo(()=>{
    if (!q.trim()) return tabla
    return tabla.filter(u=>u.nombre?.toLowerCase().includes(q.toLowerCase()))
  },[tabla,q])

  return (
    <AppShell>
      <style>{CSS}</style>

      <div style={{maxWidth:1400,margin:'0 auto',padding:'2rem 1.5rem 3rem'}}>

        {/* Título página */}
<div className="rk-in" style={{marginBottom:'1.25rem'}}>
            <div style={{display:'flex',alignItems:'baseline',gap:12}}>
            <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(2.4rem,6vw,3.5rem)',color:'#0c182b',margin:'0 0 .3rem',lineHeight:1,letterSpacing:'.02em'}}>RANKING</h1>
            {sel && <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'#94a3b8',fontWeight:500}}>— {sel.titulo}</span>}
          </div>
        </div>

        {/* Shell principal */}
<div className="rk-shell" style={{display:'flex',height:'calc(100vh - 162px)',minHeight:520,borderRadius:20,overflow:'hidden',boxShadow:'0 8px 48px rgba(12,24,43,.14)'}}>
          {/* ══ SIDEBAR OSCURO ══ */}
          <div className="rk-sidebar">
            {/* Header sidebar */}
            <div style={{padding:'20px 16px 14px',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
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
                    {tabla.length>5 && <Buscador q={q} setQ={setQ}/>}

                    {!q && (
                      <Podio
                        top={tabla.slice(0,3)}
                        miId={user?.id} esAdmin={esAdmin}
                        expandido={expandido} detalles={detalles}
                        apuesta={sel} onToggle={toggleExpandir}
                      />
                    )}

                    {(q?filasFiltradas:tabla.slice(3)).length>0 && (
                      <TablaResto
                        filas={q?filasFiltradas:tabla.slice(3)}
                        offset={q?0:3} tabla={tabla} hayQ={!!q}
                        miId={user?.id} esAdmin={esAdmin}
                        expandido={expandido} detalles={detalles}
                        apuesta={sel} onToggle={toggleExpandir}
                      />
                    )}

                    {q && filasFiltradas.length===0 && <SinResultados q={q} clear={()=>setQ('')}/>}
                    {!q && tabla.length<=3 && tabla.length>0 && (
                      <p style={{textAlign:'center',fontSize:12,color:'#94a3b8',marginTop:8}}>
                        {tabla.length===1?'Único participante de la apuesta':`Los ${tabla.length} participantes de la apuesta`}
                      </p>
                    )}
                    {!q && meta.mi_posicion && !meta.esta_en_top && (
                      <MiPosicion
                        pos={meta.mi_posicion} apuesta={sel}
                        expandida={expandido===user?.id}
                        detalle={detalles[user?.id]}
                        onToggle={()=>toggleExpandir(user?.id)}
                      />
                    )}
                    <LeyendaPuntos apuesta={sel} total={meta.total} mostrando={q?filasFiltradas.length:tabla.length}/>
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
      {/* Dot estado */}
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
      {/* glow deco */}
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
   BUSCADOR
══════════════════════════════════════════ */
function Buscador({ q, setQ }) {
  return (
    <div style={{position:'relative',maxWidth:240,marginBottom:16}}>
      <svg style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar participante..."
        style={{width:'100%',paddingLeft:28,paddingRight:q?28:10,paddingTop:7,paddingBottom:7,borderRadius:99,border:'1.5px solid #e2ddd6',background:'#fff',fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'#0c182b',outline:'none',boxSizing:'border-box',transition:'border-color .15s'}}
        onFocus={e=>e.target.style.borderColor='rgba(235,195,43,.6)'}
        onBlur={e=>e.target.style.borderColor='#e2ddd6'}
      />
      {q && (
        <button onClick={()=>setQ('')} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',cursor:'pointer',color:'#94a3b8',padding:1,display:'flex'}}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   PODIO
══════════════════════════════════════════ */
const PODIO_CFG = {
  0: { grad:'linear-gradient(145deg,#f5d75a 0%,#c99f16 100%)', shadow:'rgba(235,195,43,.5)', border:'rgba(235,195,43,.7)', ring:'rgba(235,195,43,.3)', emoji:'🥇', label:'1°' },
  1: { grad:'linear-gradient(145deg,#e2e8f0 0%,#94a3b8 100%)', shadow:'rgba(148,163,184,.4)', border:'rgba(148,163,184,.5)', ring:'rgba(148,163,184,.2)', emoji:'🥈', label:'2°' },
  2: { grad:'linear-gradient(145deg,#fed7aa 0%,#c2720e 100%)', shadow:'rgba(194,114,14,.4)',  border:'rgba(194,114,14,.5)',  ring:'rgba(194,114,14,.2)',  emoji:'🥉', label:'3°' },
}

function Podio({ top, miId, esAdmin, expandido, detalles, apuesta, onToggle }) {
  if (!top.length) return null

  const orden   = top.length===1?[top[0]]:top.length===2?[top[1],top[0]]:[top[1],top[0],top[2]]
  const rankOf  = u => top.findIndex(x=>x.user_id===u.user_id)
  const expPod  = top.find(u=>u.user_id===expandido)?.user_id

  return (
    <div style={{marginBottom:20}}>
      {/* Label sección */}
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
          const puede  = esAdmin||me
          const isExp  = expandido===u.user_id
          const sz     = isTop ? 60 : 48

          return (
            <div key={u.user_id} className="rk-pcard"
              onClick={puede?()=>onToggle(u.user_id):undefined}
              style={{
                background:'#fff',
                border:`${isTop||isExp?2:1.5}px solid ${isExp?'#ebc32b':isTop?cfg.border:'#e8e3db'}`,
                padding: isTop ? '20px 14px 14px' : '16px 12px 12px',
                boxShadow: isTop
                  ? `0 0 0 4px ${cfg.ring}, 0 12px 40px ${cfg.shadow}`
                  : isExp ? `0 0 0 3px rgba(235,195,43,.2)` : '0 2px 12px rgba(12,24,43,.06)',
                cursor: puede ? 'pointer' : 'default',
              }}>

              {/* Badge posición */}
              {isTop && (
                <div style={{position:'absolute',top:-13,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(90deg,#c99f16,#ebc32b)',color:'#fff',fontSize:8,fontWeight:800,letterSpacing:'.16em',textTransform:'uppercase',padding:'3px 14px',borderRadius:99,whiteSpace:'nowrap',boxShadow:'0 2px 10px rgba(235,195,43,.5)'}}>
                  ★ LÍDER
                </div>
              )}

              {/* Medalla */}
              <div style={{fontSize:isTop?28:20,marginBottom:10,lineHeight:1}}>{cfg.emoji}</div>

              {/* Avatar */}
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

              {/* Nombre */}
              <p style={{fontWeight:700,fontSize:isTop?15:13,color:'#0c182b',margin:'0 0 2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {u.nombre}
                {me && <span style={{fontSize:10,color:'#94a3b8',fontWeight:400,marginLeft:4}}>(vos)</span>}
              </p>

              {/* Sub */}
              <p style={{fontSize:10,color:'#94a3b8',margin:'0 0 12px'}}>
                {u.predicciones} pred · {u.aciertos_exactos} ✓
              </p>

              {/* Puntos — el elemento más importante */}
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

              {/* CTA */}
              {puede && (
                <button style={{marginTop:10,background:'transparent',border:'none',cursor:'pointer',fontSize:10,fontWeight:700,color:isExp?'#c99f16':'#94a3b8',display:'flex',alignItems:'center',justifyContent:'center',gap:3,width:'100%',padding:'4px 0',transition:'color .14s'}}
                  onMouseEnter={e=>e.currentTarget.style.color='#c99f16'}
                  onMouseLeave={e=>e.currentTarget.style.color=isExp?'#c99f16':'#94a3b8'}>
                  {isExp?'Ocultar detalle':'Ver detalle'}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{transform:isExp?'rotate(180deg)':'none',transition:'transform .2s'}}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Detalle expandido del podio */}
      {expPod && (
        <DetallePanel
          nombre={top.find(u=>u.user_id===expPod)?.nombre}
          det={detalles?.[expPod]} apuesta={apuesta}
          onClose={()=>onToggle(expPod)}
          style={{marginTop:14}}
        />
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   TABLA RESTO (4 en adelante)
══════════════════════════════════════════ */
function TablaResto({ filas, offset, tabla, hayQ, miId, esAdmin, expandido, detalles, apuesta, onToggle }) {
  return (
    <div style={{marginBottom:12}}>
      {/* Label sección */}
      {!hayQ && (
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,letterSpacing:'.18em',color:'#94a3b8'}}>RESTO DEL RANKING</span>
          <div style={{flex:1,height:1,background:'linear-gradient(90deg,#e2ddd6,transparent)'}}/>
        </div>
      )}

      <div style={{borderRadius:14,overflow:'hidden',border:'1.5px solid #e8e3db',background:'#fff'}}>
        {/* Header */}
        <div style={{display:'grid',gridTemplateColumns:'44px 1fr 100px 68px 18px',padding:'8px 16px',background:'rgba(12,24,43,.02)',borderBottom:'1px solid #f0eadb',gap:8,alignItems:'center'}}>
          {['#','Participante','Aciertos','Pts',''].map((h,i)=>(
            <span key={i} className="rk-hide-mob" style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.12em',color:'#b8c0cc',textAlign:i>=2?'center':'left',display:i===3?'block':'inherit'}}>{h}</span>
          ))}
        </div>

        {filas.map((u,i)=>{
          const pos   = hayQ ? (tabla.findIndex(x=>x.user_id===u.user_id)+1) : (offset+i+1)
          const me    = u.user_id===miId
          const puede = esAdmin||me
          const isExp = expandido===u.user_id
          const det   = detalles[u.user_id]

          return (
            <div key={u.user_id} style={{borderBottom:i<filas.length-1?'1px solid #f5f3ee':'none'}}>
              <div className="rk-trow"
                onClick={puede?()=>onToggle(u.user_id):undefined}
                style={{
                  display:'grid',gridTemplateColumns:'44px 1fr 100px 68px 18px',
                  padding:'11px 16px',gap:8,alignItems:'center',
                  background:me?'rgba(235,195,43,.04)':isExp?'rgba(12,24,43,.015)':'#fff',
                  cursor:puede?'pointer':'default',
                }}>

                {/* Posición */}
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:pos<=3?'#ebc32b':'#c8d0dc',lineHeight:1}}>{pos}</span>

                {/* Participante */}
                <div style={{display:'flex',alignItems:'center',gap:10,minWidth:0}}>
                  <div style={{
                    width:34,height:34,borderRadius:'50%',flexShrink:0,
                    background:me?'linear-gradient(135deg,#ebc32b,#c99f16)':'linear-gradient(135deg,#e2e8f0,#cbd5e1)',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontFamily:"'Bebas Neue',sans-serif",fontSize:13,
                    color:me?'#0c182b':'#64748b',
                    boxShadow:me?'0 0 0 2px rgba(235,195,43,.3)':'none',
                  }}>{initials(u.nombre)}</div>
                  <div style={{minWidth:0}}>
                    <p style={{fontWeight:me?700:600,fontSize:13,color:me?'#c99f16':'#0c182b',margin:'0 0 1px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {u.nombre}
                      {me&&<span style={{fontSize:10,color:'#94a3b8',fontWeight:400,marginLeft:4}}>(vos)</span>}
                    </p>
                    <p style={{fontSize:10,color:'#94a3b8',margin:0}}>{u.predicciones} predicciones</p>
                  </div>
                </div>

                {/* Aciertos */}
                <div className="rk-hide-mob" style={{display:'flex',justifyContent:'center',gap:8}}>
                  {[['#22c55e',u.aciertos_exactos,'Exactos'],['#ebc32b',u.aciertos_diferencia||0,'Dif.'],['#94a3b8',u.aciertos_resultado,'Res.']].map(([c,n,t])=>(
                    <span key={t} title={t} style={{display:'inline-flex',alignItems:'center',gap:3,fontSize:11,fontWeight:600,color:n>0?c:'#cbd5e1'}}>
                      <span style={{width:6,height:6,borderRadius:'50%',background:n>0?c:'#e2e8f0',display:'inline-block'}}/>
                      {n}
                    </span>
                  ))}
                </div>

                {/* Puntos */}
                <div style={{textAlign:'center'}}>
                  <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:'#0c182b',lineHeight:1}}>{u.puntos_totales}</span>
                  <span style={{fontSize:8,color:'#94a3b8',marginLeft:2,letterSpacing:'.1em',fontWeight:700,display:'block'}}>PTS</span>
                </div>

                {/* Chevron */}
                {puede
                  ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isExp?'#ebc32b':'#cbd5e1'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{transform:isExp?'rotate(180deg)':'none',transition:'transform .2s'}}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  : <span/>
                }
              </div>

              {/* Detalle expandido inline */}
              {isExp && (
                <DetallePanel
                  nombre={u.nombre} det={det} apuesta={apuesta}
                  onClose={()=>onToggle(u.user_id)} inline
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   DETALLE PANEL
══════════════════════════════════════════ */
function DetallePanel({ nombre, det, apuesta, onClose, inline, style: extraStyle }) {
  const base = {
    borderRadius: inline?0:14,
    overflow:'hidden',
    border: inline ? 'none' : '2px solid rgba(235,195,43,.4)',
    borderTop: inline ? '2px solid rgba(235,195,43,.25)' : undefined,
    boxShadow: inline ? 'none' : '0 4px 24px rgba(235,195,43,.1)',
    animation:'rk-in .22s ease both',
    ...extraStyle,
  }

  const loadingUI = (
    <div style={base}>
      <div style={{background:'#0c182b',padding:'10px 16px',display:'flex',alignItems:'center',gap:8}}>
        <span style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.14em',color:'rgba(235,195,43,.7)'}}>Cargando…</span>
      </div>
      <div style={{background:'#faf7f0',padding:'12px 14px',display:'flex',flexDirection:'column',gap:4}}>
        {[1,2,3].map(i=><div key={i} className="rk-sk" style={{height:42}}/>)}
      </div>
    </div>
  )

  if (!det||det.loading) return loadingUI

  if (det.error) return (
    <div style={base}>
      <div style={{background:'#0c182b',padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.14em',color:'#f43f5e'}}>Error al cargar</span>
        <CloseBtn onClick={onClose}/>
      </div>
      <div style={{background:'#faf7f0',padding:'12px 14px',fontSize:12,color:'#f43f5e'}}>{det.error}</div>
    </div>
  )

  const parts   = apuesta?.partidos||[]
  const predMap = new Map((det.preds||[]).map(p=>[p.partido_id,p]))
  const resumen = (det.preds||[]).reduce((a,p)=>{
    const cat=clasificar(p.puntos,apuesta)
    if(cat&&cat!=='cero') a[cat]=(a[cat]||0)+1
    else if(cat==='cero') a.fallos=(a.fallos||0)+1
    a.total=(a.total||0)+(parseInt(p.puntos)||0)
    return a
  },{})

  return (
    <div style={base}>
      {/* Header */}
      <div style={{background:'linear-gradient(90deg,#0c182b,#17376a)',padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:24,height:24,borderRadius:6,background:'rgba(235,195,43,.15)',border:'1px solid rgba(235,195,43,.25)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue',sans-serif",fontSize:10,color:'#ebc32b'}}>
            {initials(nombre)}
          </div>
          <span style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.12em',color:'rgba(235,195,43,.85)'}}>{nombre}</span>
        </div>
        <CloseBtn onClick={onClose}/>
      </div>

      {/* Body */}
      <div style={{background:'#faf7f0',padding:'12px 14px 14px'}}>
        {/* Resumen chips */}
        {det.preds?.length>0 && (
          <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap',alignItems:'center'}}>
            {[['exacto','#22c55e','Exactos'],['diferencia','#ebc32b','Diferencia'],['resultado','#94a3b8','Resultado'],['fallos','#f43f5e','Fallos']].map(([k,c,l])=>resumen[k]>0&&(
              <span key={k} style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 9px',borderRadius:99,background:`${c}12`,border:`1px solid ${c}25`,fontSize:10,fontWeight:700,color:c}}>
                <span style={{width:5,height:5,borderRadius:'50%',background:c,display:'inline-block'}}/>
                {resumen[k]} {l}
              </span>
            ))}
            {resumen.total>0 && (
              <span style={{marginLeft:'auto',fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:'#0c182b'}}>
                {resumen.total} <span style={{fontSize:9,color:'#94a3b8',fontWeight:400}}>PTS</span>
              </span>
            )}
          </div>
        )}

        {/* Label */}
        <p style={{fontSize:8,fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',color:'#b8c0cc',margin:'0 0 8px 2px'}}>Partido a partido</p>

        {/* Filas de partidos */}
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          {parts.length===0 && <p style={{fontSize:12,color:'#94a3b8',textAlign:'center',margin:'10px 0',fontStyle:'italic'}}>Sin partidos cargados</p>}
          {parts.map(p=><FilaPartido key={p.id} partido={p} pred={predMap.get(p.id)} apuesta={apuesta}/>)}
        </div>
      </div>
    </div>
  )
}

function CloseBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{background:'transparent',border:'none',cursor:'pointer',color:'rgba(255,255,255,.35)',display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600,padding:0,transition:'color .14s'}}
      onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,.8)'}
      onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.35)'}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      Cerrar
    </button>
  )
}

/* ══════════════════════════════════════════
   FILA DE PARTIDO
══════════════════════════════════════════ */
function FilaPartido({ partido, pred, apuesta }) {
  const fin        = partido.estado==='finalizado'
  const live       = partido.estado==='en_vivo'
  const tieneScore = partido.goles_local!==''&&partido.goles_local!==null&&!isNaN(parseInt(partido.goles_local))
  const cat        = pred?clasificar(pred.puntos,apuesta):null
  const catColor   = cat?CAT_COLOR[cat]:null
  const isExacto   = cat==='exacto'

  return (
    <div style={{
      display:'grid',gridTemplateColumns:'1fr 62px 62px 54px',
      alignItems:'center',gap:8,
      padding:'8px 10px',borderRadius:10,
      background:isExacto?'rgba(34,197,94,.04)':'#fff',
      border:`1px solid ${isExacto?'rgba(34,197,94,.18)':'#ece8e0'}`,
      transition:'border-color .14s',
    }}>
      {/* Partido */}
      <div>
        <div style={{display:'flex',alignItems:'center',gap:4,overflow:'hidden',marginBottom:2}}>
          {partido.bandera_local && <img src={partido.bandera_local} alt="" style={{width:14,height:10,objectFit:'cover',borderRadius:1,border:'1px solid #e8e3db',flexShrink:0}}/>}
          <span style={{fontSize:11,fontWeight:600,color:'#0c182b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{partido.equipo_local}</span>
          <span style={{fontSize:9,color:'#b8c0cc',flexShrink:0}}>vs</span>
          <span style={{fontSize:11,fontWeight:600,color:'#0c182b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{partido.equipo_visitante}</span>
          {partido.bandera_visitante && <img src={partido.bandera_visitante} alt="" style={{width:14,height:10,objectFit:'cover',borderRadius:1,border:'1px solid #e8e3db',flexShrink:0}}/>}
          {live && <span style={{fontSize:7,fontWeight:800,color:'#f43f5e',background:'rgba(244,63,94,.08)',border:'1px solid rgba(244,63,94,.2)',borderRadius:99,padding:'1px 5px',flexShrink:0}}>EN VIVO</span>}
        </div>
        <p style={{fontSize:9,color:'#94a3b8',margin:0}}>{partido.fase||''}{partido.fecha_partido?` · ${fmtFecha(partido.fecha_partido)}`:''}</p>
      </div>

      {/* Predicción */}
      <div style={{textAlign:'center'}}>
        <p style={{fontSize:7,fontWeight:700,textTransform:'uppercase',letterSpacing:'.12em',color:'#b8c0cc',margin:'0 0 1px'}}>Pred.</p>
        {pred
          ? <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:'#c99f16',margin:0,lineHeight:1}}>{pred.pred_local}-{pred.pred_visitante}</p>
          : <p style={{fontSize:10,color:'#b8c0cc',margin:0,fontStyle:'italic'}}>—</p>
        }
      </div>

      {/* Real */}
      <div style={{textAlign:'center'}}>
        <p style={{fontSize:7,fontWeight:700,textTransform:'uppercase',letterSpacing:'.12em',color:'#b8c0cc',margin:'0 0 1px'}}>Real</p>
        {tieneScore
          ? <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:'#0c182b',margin:0,lineHeight:1}}>{partido.goles_local}-{partido.goles_visitante}</p>
          : <p style={{fontSize:10,color:'#b8c0cc',margin:0}}>-</p>
        }
      </div>

      {/* Badge puntos */}
      <div style={{textAlign:'right'}}>
        {pred&&(fin||live)&&catColor
          ? <span style={{display:'inline-block',background:`${catColor}14`,color:catColor,fontSize:10,fontWeight:700,padding:'3px 7px',borderRadius:99,border:`1px solid ${catColor}28`,minWidth:28,textAlign:'center'}}>
              +{parseInt(pred.puntos)||0}
            </span>
          : <span style={{fontSize:10,color:'#b8c0cc'}}>—</span>
        }
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   MI POSICIÓN (sticky)
══════════════════════════════════════════ */
function MiPosicion({ pos, apuesta, expandida, detalle, onToggle }) {
  return (
    <div style={{position:'sticky',bottom:12,marginTop:12,zIndex:10}}>
      <div style={{borderRadius:13,overflow:'hidden',boxShadow:'0 8px 32px rgba(12,24,43,.28)',border:'2px solid rgba(235,195,43,.45)'}}>
        <div onClick={onToggle} style={{
          display:'grid',gridTemplateColumns:'44px 1fr 100px 68px 18px',
          padding:'10px 16px',gap:8,alignItems:'center',
          background:'linear-gradient(90deg,#0c182b,#17376a)',cursor:'pointer',
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
          <div className="rk-hide-mob" style={{display:'flex',justifyContent:'center',gap:8}}>
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
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ebc32b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{transform:expandida?'rotate(180deg)':'none',transition:'transform .2s'}}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        {expandida && (
          <div style={{background:'#faf7f0'}}>
            <DetallePanel nombre={pos.nombre} det={detalle} apuesta={apuesta} onClose={onToggle} inline/>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   LEYENDA Y ESTADOS VACÍOS
══════════════════════════════════════════ */
function LeyendaPuntos({ apuesta, total, mostrando }) {
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
      {total>0 && <span>{mostrando>=total?`${total} participantes`:`${mostrando} de ${total}`}</span>}
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
      {/* Deco podio skeleton */}
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

function SinResultados({ q, clear }) {
  return (
    <div style={{textAlign:'center',padding:32,background:'#fff',borderRadius:14,border:'1.5px solid #e8e3db',marginBottom:12}}>
      <p style={{fontWeight:600,color:'#64748b',margin:'0 0 8px',fontSize:14}}>Sin resultados para "{q}"</p>
      <button onClick={clear} style={{background:'transparent',border:'1.5px solid #e2ddd6',borderRadius:99,padding:'5px 16px',fontSize:12,fontWeight:600,color:'#64748b',cursor:'pointer',transition:'all .14s'}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='#0c182b';e.currentTarget.style.color='#0c182b'}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='#e2ddd6';e.currentTarget.style.color='#64748b'}}>
        Limpiar búsqueda
      </button>
    </div>
  )
}

function SkeletonContent() {
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1.08fr 1fr',gap:12,marginBottom:24,alignItems:'end'}}>
        {[110,145,110].map((h,i)=><div key={i} className="rk-sk" style={{height:h,borderRadius:16}}/>)}
      </div>
      <div style={{borderRadius:14,overflow:'hidden',border:'1.5px solid #e8e3db'}}>
        <div className="rk-sk" style={{height:38,borderRadius:0}}/>
        {[1,2,3,4].map(i=><div key={i} className="rk-sk" style={{height:56,borderRadius:0,marginTop:1,animationDelay:`${i*.07}s`}}/>)}
      </div>
    </div>
  )
}