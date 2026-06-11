/**
 * MisPredesPage.jsx — Fondo crema, cards blancas, navy+gold
 * Ubicación: src/dashboard/MisPredesPage.jsx
 *
 * CAMBIOS respecto al original:
 *  - PartidoRow ahora muestra "Pasa: <equipo>" cuando la predicción tiene
 *    pred_clasificado, y "Real: pasa <equipo> (pen X-Y)" cuando el partido
 *    fue de eliminación directa y ya tiene resultado/penales.
 */
import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import AppShell from './AppShell.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { useBets } from '../hooks/useBets.jsx'
import sheetsApi from '../services/sheetsApi.js'

const CARD={background:'#fff',border:'1px solid #f0eadb',borderRadius:14,boxShadow:'0 1px 0 rgba(12,24,43,.04)'}
const MUTED={fontSize:'.76rem',color:'#5f6e8a'}

function timeLeft(d){const diff=new Date(d)-Date.now();if(diff<=0)return'Cerrada';const h=Math.floor(diff/3600000);const m=Math.floor((diff%3600000)/60000);if(h>=24)return`${Math.floor(h/24)}d ${h%24}h`;if(h>0)return`${h}h ${m}m`;return`${m}m`}

// ─── Helper: obtener nombre de equipo a partir de un código (AR / FRA / ...) ─
// El backend siempre nos da match.codigo_local / match.codigo_visitante junto
// con match.equipo_local / match.equipo_visitante (los nombres ya resueltos).
// Por eso, traducir un código → nombre solo requiere mirar al partido mismo.
function nombreDesdeCodigo(match, codigo) {
  if (!codigo) return ''
  if (match.codigo_local === codigo) return match.equipo_local
  if (match.codigo_visitante === codigo) return match.equipo_visitante
  return codigo // fallback: mostrar el código si no matchea
}

// Devuelve qué selección clasifica realmente, según goles + penales.
// Devuelve null si todavía no hay datos suficientes (empate sin penales).
function clasificadoReal(match) {
  const gl = parseInt(match.goles_local)
  const gv = parseInt(match.goles_visitante)
  if (isNaN(gl) || isNaN(gv)) return null
  if (gl > gv) return match.codigo_local
  if (gv > gl) return match.codigo_visitante
  const pl = parseInt(match.penales_local)
  const pv = parseInt(match.penales_visit)
  if (isNaN(pl) || isNaN(pv)) return null
  return pl > pv ? match.codigo_local : match.codigo_visitante
}

function StatCard({label,value,color='#0c182b'}){
  return(
    <div style={{...CARD,padding:'1.1rem',textAlign:'center'}}>
      <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(1.8rem,4vw,2.5rem)',color,margin:0,lineHeight:1,letterSpacing:'.02em'}}>{value}</p>
      <p style={{fontSize:'.65rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.12em',color:'#a8b2c4',margin:'.25rem 0 0'}}>{label}</p>
    </div>
  )
}

function PartidoRow({match,pred}){
  const fin=match.estado==='finalizado'
  const live=match.estado==='en_vivo'
  const pts=pred?.puntos
  const esElim = match.es_eliminatoria || (match.fase && String(match.fase).toLowerCase() !== 'grupos')
  const tienePenales = match.penales_local != null && match.penales_local !== '' &&
                       match.penales_visit != null && match.penales_visit !== ''
  const clasifPred = pred?.pred_clasificado
  const clasifRealCode = clasificadoReal(match)
  const aciertoClasif = clasifPred && clasifRealCode && String(clasifPred).trim() === String(clasifRealCode).trim()

  return(
    <div style={{padding:'.7rem .85rem',borderRadius:10,background:pts>0?'rgba(27,138,90,.04)':'rgba(12,24,43,.02)',border:`1px solid ${pts>0?'rgba(27,138,90,.2)':'#f0eadb'}`}}>
      {/* Equipos */}
      <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:'.5rem',marginBottom:'.45rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:'.4rem',minWidth:0}}>
          {match.bandera_local&&<img src={match.bandera_local} alt="" style={{width:22,height:16,objectFit:'cover',borderRadius:2,border:'1px solid #f0eadb',flexShrink:0}}/>}
          <span style={{fontWeight:600,fontSize:'.82rem',color:'#0c182b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{match.equipo_local}</span>
        </div>
        <span style={{fontSize:'.72rem',color:'#a8b2c4'}}>vs</span>
        <div style={{display:'flex',alignItems:'center',gap:'.4rem',minWidth:0,justifyContent:'flex-end'}}>
          <span style={{fontWeight:600,fontSize:'.82rem',color:'#0c182b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textAlign:'right'}}>{match.equipo_visitante}</span>
          {match.bandera_visitante&&<img src={match.bandera_visitante} alt="" style={{width:22,height:16,objectFit:'cover',borderRadius:2,border:'1px solid #f0eadb',flexShrink:0}}/>}
        </div>
      </div>

      {/* Scores */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'1.2rem',paddingTop:'.45rem',borderTop:'1px solid #f5f3ee',flexWrap:'wrap'}}>
        {pred?(
          <div style={{textAlign:'center'}}>
            <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:'#a8b2c4',margin:'0 0 2px'}}>{pred.es_grupal?'Área':'Tu predicción'}</p>
            <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',color:'#c99f16',margin:0,lineHeight:1}}>{pred.pred_local} - {pred.pred_visitante}</p>
          </div>
        ):(
          <p style={{...MUTED,fontSize:'.72rem',textAlign:'center',margin:0}}>Sin predicción</p>
        )}
        {(fin||live)&&match.goles_local!=null&&(
          <>
            <div style={{width:1,height:28,background:'#f0eadb'}}/>
            <div style={{textAlign:'center'}}>
              <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:'#a8b2c4',margin:'0 0 2px'}}>{live?'En vivo':'Resultado'}</p>
              <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',color:live?'#e03252':'#0c182b',margin:0,lineHeight:1}}>{match.goles_local} - {match.goles_visitante}</p>
              {tienePenales && (
                <p style={{fontSize:'.6rem',fontWeight:700,color:'#c99f16',margin:'2px 0 0',textTransform:'uppercase',letterSpacing:'.06em'}}>
                  pen {match.penales_local}-{match.penales_visit}
                </p>
              )}
            </div>
          </>
        )}
        {pts!=null&&pts!==''&&(
          <>
            <div style={{width:1,height:28,background:'#f0eadb'}}/>
            <div style={{textAlign:'center'}}>
              <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:'#a8b2c4',margin:'0 0 2px'}}>Puntos</p>
              <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',color:Number(pts)>0?'#1b8a5a':'#a8b2c4',margin:0,lineHeight:1}}>+{pts}</p>
            </div>
          </>
        )}
      </div>

      {/* ★ NUEVO: línea de "clasificado" para fases eliminatorias */}
      {esElim && (clasifPred || clasifRealCode) && (
        <div style={{marginTop:'.45rem',paddingTop:'.45rem',borderTop:'1px dashed #f0eadb',display:'flex',flexWrap:'wrap',gap:'.4rem .9rem',alignItems:'center',justifyContent:'center'}}>
          {clasifPred && (
            <span style={{display:'inline-flex',alignItems:'center',gap:'.3rem',fontSize:'.7rem',fontFamily:"'DM Sans',sans-serif"}}>
              <span style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'#a8b2c4'}}>
                Tu clasif.:
              </span>
              <span style={{fontWeight:700, color: clasifRealCode ? (aciertoClasif ? '#1b8a5a' : '#e03252') : '#c99f16'}}>
                {nombreDesdeCodigo(match, clasifPred)}
              </span>
              {clasifRealCode && (aciertoClasif
                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1b8a5a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#e03252" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              )}
            </span>
          )}
          {clasifRealCode && (
            <span style={{display:'inline-flex',alignItems:'center',gap:'.3rem',fontSize:'.7rem',fontFamily:"'DM Sans',sans-serif"}}>
              <span style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'#a8b2c4'}}>
                Pasó:
              </span>
              <span style={{fontWeight:700, color:'#0c182b'}}>{nombreDesdeCodigo(match, clasifRealCode)}</span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default function MisPredesPage(){
  const {user}=useAuth()
  const {bets,loading:lb}=useBets()
  const [misPredes,setMisPredes]=useState({})
  const [loading,setLoading]=useState(false)
  const [filtro,setFiltro]=useState('todas')
  const [open,setOpen]=useState(null)

  useEffect(()=>{
    if(!bets.length)return
    setLoading(true)
    sheetsApi.predicciones.mias().then(r=>{
      const map={}
      ;(r.predicciones||[]).forEach(p=>{map[p.partido_id]=p})
      setMisPredes(map)
    }).catch(()=>{}).finally(()=>setLoading(false))
  },[bets.length])

  const betsConPred=useMemo(()=>bets.filter(b=>b.partidos?.some(p=>misPredes[p.id])),[bets,misPredes])
  const betsSinPred=useMemo(()=>bets.filter(b=>b.estado==='abierta'&&!b.partidos?.some(p=>misPredes[p.id])),[bets,misPredes])

  const filtradas=useMemo(()=>{
    if(filtro==='con') return betsConPred
    if(filtro==='sin') return betsSinPred
    return bets
  },[filtro,bets,betsConPred,betsSinPred])

  const totalPts=Object.values(misPredes).reduce((a,p)=>a+(Number(p.puntos)||0),0)
  const totalExactos=Object.values(misPredes).filter(p=>p.acierto_tipo==='exacto').length
  const totalPred=Object.keys(misPredes).length

  return(
    <AppShell>
      <style>{`
        @keyframes din{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        .din{animation:din .38s ease both}
        @keyframes skp{0%,100%{opacity:.7}50%{opacity:.3}}
      `}</style>
      <div style={{maxWidth:1400,margin:'0 auto',padding:'2rem 1.5rem 3rem'}}>

        {/* Header */}
        <div className="din" style={{marginBottom:'1.6rem'}}>
          <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(2.4rem,6vw,3.5rem)',color:'#0c182b',margin:'0 0 .3rem',lineHeight:1,letterSpacing:'.02em'}}>MIS PREDICCIONES</h1>
          <p style={{...MUTED,margin:0}}>Historial de todos tus pronósticos</p>
        </div>

        {/* Stats */}
        <div className="din" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'.85rem',marginBottom:'1.75rem',animationDelay:'60ms'}}>
          <StatCard label="Puntos totales" value={loading?'—':totalPts} color="#c99f16"/>
          <StatCard label="Predicciones" value={loading?'—':totalPred} color="#425b8b"/>
          <StatCard label="Exactos" value={loading?'—':totalExactos} color="#1b8a5a"/>
          <StatCard label="Apuestas" value={loading?'—':betsConPred.length} color="#0c182b"/>
        </div>

        {/* Filtros */}
        <div className="din" style={{display:'flex',gap:'.3rem',marginBottom:'1.4rem',animationDelay:'80ms'}}>
          {[{k:'todas',l:'Todas'},{k:'con',l:`Con predicción (${betsConPred.length})`},{k:'sin',l:`Sin predicción (${betsSinPred.length})`}].map(({k,l})=>(
            <button key={k} onClick={()=>setFiltro(k)} style={{padding:'.34rem .82rem',borderRadius:99,border:'none',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'.72rem',textTransform:'uppercase',letterSpacing:'.05em',cursor:'pointer',transition:'all .15s',background:filtro===k?'#0c182b':'#fff',color:filtro===k?'#ebc32b':'#5f6e8a',border:filtro===k?'1px solid transparent':'1px solid #f0eadb',boxShadow:filtro===k?'0 2px 8px rgba(12,24,43,.18)':'none'}}>
              {l}
            </button>
          ))}
        </div>

        {/* Lista de apuestas */}
        {(loading||lb)?(
          <div style={{display:'flex',flexDirection:'column',gap:'.8rem'}}>
            {[1,2,3].map(i=><div key={i} style={{height:100,...CARD,animation:'skp 1.4s ease infinite'}}/>)}
          </div>
        ):filtradas.length===0?(
          <div style={{...CARD,borderRadius:16,padding:'3rem',textAlign:'center'}}>
            <p style={{fontWeight:600,color:'#5f6e8a',margin:0}}>No hay apuestas en esta categoría</p>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
            {filtradas.map(bet=>{
              const hasPred=bet.partidos?.some(p=>misPredes[p.id])
              const isOpenBet=bet.estado==='abierta'
              const rem=timeLeft(bet.fecha_cierre)
              const isExpanded=open===bet.id

              return(
                <div key={bet.id} style={{...CARD,borderRadius:16,overflow:'hidden'}}>
                  {/* Cabecera */}
                  <div style={{padding:'1rem 1.2rem',display:'flex',alignItems:'center',gap:'1rem',cursor:'pointer'}}
                    onClick={()=>setOpen(isExpanded?null:bet.id)}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(12,24,43,.02)'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='transparent'}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:'.55rem',marginBottom:'.22rem'}}>
                        <h3 style={{fontWeight:700,fontSize:'.92rem',color:'#0c182b',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{bet.titulo}</h3>
                        {hasPred&&<span style={{display:'inline-flex',alignItems:'center',gap:'.25rem',fontSize:'.62rem',fontWeight:700,color:'#1b8a5a',flexShrink:0}}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Guardada
                        </span>}
                      </div>
                      <p style={{...MUTED,margin:0,fontSize:'.73rem'}}>
                        {bet.partidos?.length||0} partidos
                        {isOpenBet&&rem!=='Cerrada'?` · ⏱ ${rem}`:''}
                        {bet.estado==='finalizada'?' · Finalizada':''}
                      </p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8b2c4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,transition:'transform .2s',transform:isExpanded?'rotate(180deg)':'rotate(0)'}}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>

                  {/* Expandido */}
                  {isExpanded&&(
                    <div style={{padding:'0 1.2rem 1.2rem',borderTop:'1px solid #f5f3ee'}}>
                      <div style={{display:'flex',flexDirection:'column',gap:'.5rem',paddingTop:'.9rem'}}>
                        {bet.partidos?.map(m=>(
                          <PartidoRow key={m.id} match={m} pred={misPredes[m.id]}/>
                        ))}
                      </div>
                      {isOpenBet&&(
                        <Link to="/apuestas" style={{display:'block',textAlign:'center',marginTop:'1rem',padding:'.55rem',fontFamily:"'DM Sans',sans-serif",fontSize:'.8rem',fontWeight:700,color:'#c99f16',textDecoration:'none',borderRadius:99,border:'1px solid rgba(235,195,43,.3)',background:'rgba(235,195,43,.06)',transition:'all .17s'}}
                          onMouseEnter={e=>{e.currentTarget.style.background='rgba(235,195,43,.12)'}}
                          onMouseLeave={e=>{e.currentTarget.style.background='rgba(235,195,43,.06)'}}>
                          Editar predicciones →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
