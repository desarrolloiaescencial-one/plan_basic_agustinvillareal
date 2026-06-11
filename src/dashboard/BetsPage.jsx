/**
 * BetsPage.jsx — Fondo crema, cards blancas, navy+gold
 * Ubicación: src/dashboard/BetsPage.jsx
 *
 * CAMBIOS respecto al original:
 *  - handlePredict ahora envía pred_clasificado al backend cuando viene del modal
 *    (necesario para puntuar fases eliminatorias).
 *  - El banner del "Sistema de puntos" ahora muestra una sección extra
 *    explicando la regla del +1 por acertar al clasificado.
 *  - ✅ ARREGLADO: onFinalize cambiado a onClose para que el botón X funcione
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from './AppShell.jsx'
import { useBets } from '../hooks/useBets.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import PredictModal from '../components/user/PredictModal.jsx'

/* ── helpers ── */
function timeLeft(d){const diff=new Date(d)-Date.now();if(diff<=0)return'Cerrada';const h=Math.floor(diff/3600000);const m=Math.floor((diff%3600000)/60000);if(h>=24)return`${Math.floor(h/24)}d ${h%24}h`;if(h>0)return`${h}h ${m}m`;return`${m}m`}
const CARD_BASE={background:'#fff',border:'1px solid #f0eadb',borderRadius:16,boxShadow:'0 1px 0 rgba(12,24,43,.04)'}
const MUTED={fontSize:'.78rem',color:'#5f6e8a'}

function isOpen(b){return b.estado==='abierta'}
const FILTERS=[
  {key:'todas', label:'Todas'},
  {key:'activas', label:'Activas'},
  {key:'cerradas', label:'Cerradas'},
]

const STATE={
  en_vivo:   {label:'EN VIVO',  color:'#e03252', bg:'rgba(224,50,82,.08)',  border:'rgba(224,50,82,.25)'},
  abierta:   {label:'ABIERTA',  color:'#1b8a5a', bg:'rgba(27,138,90,.08)', border:'rgba(27,138,90,.22)'},
  cerrada:   {label:'CERRADA',  color:'#5f6e8a', bg:'rgba(95,110,138,.07)',border:'rgba(95,110,138,.18)'},
  finalizada:{label:'FINALIZADA',color:'#c99f16',bg:'rgba(235,195,43,.08)',border:'rgba(235,195,43,.22)'},
}

/* Toast simple */
function Toast({msg,ok}){
  if(!msg)return null
  return(
    <div style={{position:'fixed',top:'1.2rem',right:'1.2rem',zIndex:999,padding:'.75rem 1.1rem',borderRadius:12,background:ok?'#0c182b':'#fff',border:`1px solid ${ok?'rgba(235,195,43,.4)':'rgba(224,50,82,.3)'}`,boxShadow:'0 8px 28px rgba(12,24,43,.15)',display:'flex',alignItems:'center',gap:'.55rem',fontFamily:"'DM Sans',sans-serif",fontSize:'.84rem',fontWeight:600,color:ok?'#ebc32b':'#e03252',animation:'tin .3s ease both'}}>
      {ok
        ?<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        :<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      }
      {msg}
    </div>
  )
}

/* BetCard grande */
function BetCard({bet,predsMap,onPredict}){
  const open=isOpen(bet)
  const live=bet.partidos?.some(p=>p.estado==='en_vivo')
  const allDone=bet.partidos?.length>0&&bet.partidos.every(p=>p.estado==='finalizado')
  const stateKey=live?'en_vivo':allDone?'finalizada':open?'abierta':'cerrada'
  const s=STATE[stateKey]
  const rem=timeLeft(bet.fecha_cierre)
  const mc=bet.partidos?.length||0
  const anyPred=bet.partidos?.some(p=>predsMap?.[p.id])
  const {user}=useAuth()
  const esJefe=user?.tipo_usuario==='jefe'
  const canPredict=(open&&(bet.tipo!=='grupos'||(esJefe&&String(bet.areas_ids||'').split(',').map(x=>x.trim()).includes(String(user?.area_id)))))

  return(
    <div style={{...CARD_BASE,borderRadius:18,padding:'1.4rem 1.5rem',border:`1px solid ${live?'rgba(224,50,82,.25)':open?'rgba(27,138,90,.18)':'#f0eadb'}`,transition:'transform .2s,box-shadow .2s'}}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 10px 28px rgba(12,24,43,.1)'}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 1px 0 rgba(12,24,43,.04)'}}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'1rem',marginBottom:'1rem'}}>
        <div style={{flex:1,minWidth:0}}>
          <h3 style={{fontWeight:700,fontSize:'1rem',color:'#0c182b',margin:'0 0 .3rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{bet.titulo}</h3>
          <p style={{...MUTED,fontSize:'.75rem',margin:0}}>
            {mc} {mc===1?'partido':'partidos'}
            {bet.premio?` · 🏆 ${bet.premio}`:''}
            {open&&rem!=='Cerrada'?` · ⏱ ${rem}`:''}
          </p>
        </div>
        <span style={{display:'inline-flex',alignItems:'center',gap:'.35rem',padding:'.28rem .7rem',borderRadius:99,fontSize:'.65rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',background:s.bg,color:s.color,border:`1px solid ${s.border}`,flexShrink:0,whiteSpace:'nowrap'}}>
          {live&&<span style={{width:6,height:6,borderRadius:'50%',background:s.color,animation:'ldot 1.4s ease infinite',display:'inline-block'}}/>}
          {s.label}
        </span>
      </div>

      {/* Partidos preview */}
      {bet.partidos?.length>0&&(
        <div style={{display:'flex',flexDirection:'column',gap:'.4rem',marginBottom:'1.1rem'}}>
          {bet.partidos.slice(0,3).map(m=>{
            const pred=predsMap?.[m.id]
            const fin=m.estado==='finalizado'||m.estado==='en_vivo'
            return(
              <div key={m.id} style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:'.6rem',padding:'.55rem .75rem',borderRadius:9,background:pred?'rgba(235,195,43,.05)':'rgba(12,24,43,.02)',border:pred?'1px solid rgba(235,195,43,.2)':'1px solid #f0eadb'}}>
                <span style={{fontWeight:500,fontSize:'.8rem',color:'#0c182b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.equipo_local}</span>
                <div style={{textAlign:'center',minWidth:60}}>
                  {pred?(
                    <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.05rem',color:'#c99f16',letterSpacing:'.04em'}}>{pred.pred_local} - {pred.pred_visitante}</span>
                  ):(
                    <span style={{fontSize:'.75rem',color:'#a8b2c4'}}>— vs —</span>
                  )}
                  {fin&&m.goles_local!=null&&(
                    <div style={{fontSize:'.6rem',color:'#5f6e8a',marginTop:1}}>Real: {m.goles_local}-{m.goles_visitante}</div>
                  )}
                </div>
                <span style={{fontWeight:500,fontSize:'.8rem',color:'#0c182b',textAlign:'right',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.equipo_visitante}</span>
              </div>
            )
          })}
          {bet.partidos.length>3&&<p style={{...MUTED,fontSize:'.72rem',textAlign:'center',margin:'.2rem 0 0'}}>+{bet.partidos.length-3} partidos más</p>}
        </div>
      )}

      {/* Footer */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem',paddingTop:'.85rem',borderTop:'1px solid #f0eadb'}}>
        <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
          {anyPred&&(
            <span style={{display:'inline-flex',alignItems:'center',gap:'.3rem',fontSize:'.72rem',fontWeight:600,color:'#1b8a5a'}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Predicción guardada
            </span>
          )}
          {bet.participantes>0&&<span style={{...MUTED,fontSize:'.72rem'}}>{bet.participantes} participantes</span>}
        </div>
        {canPredict&&(
          <button onClick={()=>onPredict(bet)} style={{fontWeight:700,fontSize:'.8rem',padding:'.55rem 1.1rem',borderRadius:99,border:'none',background:'#ebc32b',color:'#05090f',cursor:'pointer',transition:'all .17s',boxShadow:'0 4px 14px rgba(235,195,43,.25)',whiteSpace:'nowrap'}}
            onMouseEnter={e=>{e.currentTarget.style.background='#f5d75a';e.currentTarget.style.transform='translateY(-1px)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='#ebc32b';e.currentTarget.style.transform=''}}>
            {anyPred?'Editar prode':'Cargar prode'}
          </button>
        )}
      </div>
    </div>
  )
}

/* ══ PAGE ══ */
export default function BetsPage(){
  const {bets,predictions,loading,savePrediction}=useBets()
  const [filter,setFilter]=useState('todas')
  const [activeBet,setActiveBet]=useState(null)
  const [toast,setToast]=useState(null)
  const [showPuntos, setShowPuntos] = useState(false)

  function showToast(msg,ok=true){setToast({msg,ok});setTimeout(()=>setToast(null),3200)}

const filtered = bets.filter(b => {
  // Mostrar solo apuestas con estado "abierta"
  if (filter === 'activas') return b.estado === 'abierta'
  if (filter === 'cerradas') return b.estado === 'cerrada' || b.estado === 'finalizada'
  // "Todas" muestra solo abiertas
  return b.estado === 'abierta'
})

  // Guardar predicciones una por una (funciona pero es más lento)
  async function handlePredict(betId,preds){
    try{
      for(const p of preds){
        const payload = {
          apuesta_id: betId,
          partido_id: p.partido_id,
          pred_local: p.pred_local,
          pred_visitante: p.pred_visitante,
        }
        if (p.pred_clasificado) payload.pred_clasificado = p.pred_clasificado
        await savePrediction(payload)
      }
      setActiveBet(null)
      showToast('Predicciones guardadas exitosamente',true)
    }catch(err){
      console.error('Error guardando:', err)
      showToast(err.message||'Error al guardar',false)
    }
  }

  return(
    <AppShell>
      <style>{`
        @keyframes tin{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ldot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.38;transform:scale(.68)}}
        @keyframes din{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        .din{animation:din .38s ease both}
      `}</style>

      <Toast msg={toast?.msg} ok={toast?.ok}/>

      <div style={{maxWidth:1400,margin:'0 auto',padding:'2rem 1.5rem 3rem'}}>

        {/* Header */}
        <div className="mb-4 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-display leading-none tracking-wide mb-2"
                style={{ fontSize: 'clamp(2.8rem,7vw,4rem)', color: '#0c182b' }}>
                APUESTAS
              </h1>
<p className="font-body text-sm" style={{ color: '#5f6e8a' }}>
  {filtered.length} {filtered.length === 1 ? 'apuesta disponible' : 'apuestas disponibles'}
</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="inline-flex gap-1 p-1 rounded-xl self-start md:self-auto"
            style={{ background: '#fff', border: '1px solid #f0eadb', boxShadow: '0 1px 0 rgba(12,24,43,.04)' }}>
            {FILTERS.map(f => {
              const active = filter === f.key
              return (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className="px-4 py-2 text-xs font-body font-bold uppercase tracking-wider rounded-lg transition-all"
                  style={{
                    background: active ? '#0c182b' : 'transparent',
                    color: active ? '#ebc32b' : '#5f6e8a',
                    boxShadow: active ? '0 2px 8px rgba(12,24,43,.25)' : 'none',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#0c182b' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#5f6e8a' }}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Banner sistema de puntos */}
        <div className="mb-6 animate-fade-in bg-white rounded-2xl border border-[#f0eadb] overflow-hidden">

          {/* Cabecera */}
          <button
            onClick={() => setShowPuntos(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 bg-transparent border-none cursor-pointer transition-all hover:bg-[rgba(12,24,43,.02)]"
            style={{ borderBottom: showPuntos ? '1px solid #f0eadb' : 'none' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#0c182b,#425b8b)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ebc32b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-body font-bold text-sm text-[#0c182b] m-0">Sistema de puntos</p>
                <p className="font-body text-xs text-[#5f6e8a] m-0">Así se calcula tu puntaje en cada partido</p>
              </div>
            </div>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a8b2c4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className="flex-shrink-0 transition-transform duration-200"
              style={{ transform: showPuntos ? 'rotate(180deg)' : 'rotate(0)' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* Contenido */}
          {showPuntos && (
            <div className="px-5 pb-5 pt-4">
              {/* Bloque grupos */}
              <p className="font-body font-bold uppercase mb-2" style={{ fontSize: '.6rem', letterSpacing: '.12em', color: '#5f6e8a' }}>
                Fase de grupos
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { pts: 1, titulo: 'Resultado',       desc: 'Acertás quién gana, pierde o empata',           accent: '#425b8b', bg: 'rgba(66,91,139,.06)',   border: 'rgba(66,91,139,.2)'   },
                  { pts: 3, titulo: 'Res. + diferencia', desc: 'Acertás resultado y diferencia de goles',      accent: '#0c182b', bg: 'rgba(12,24,43,.04)',    border: 'rgba(12,24,43,.12)'   },
                  { pts: 5, titulo: 'Marcador exacto',  desc: 'Acertás el resultado final exacto del partido', accent: '#c99f16', bg: 'rgba(235,195,43,.07)',  border: 'rgba(235,195,43,.28)' },
                ].map(({ pts, titulo, desc, accent, bg, border }) => (
                  <div key={pts} className="flex items-center gap-3 rounded-xl p-4"
                    style={{ background: bg, border: `1px solid ${border}` }}>
                    <div className="w-13 h-13 rounded-xl flex-shrink-0 bg-white flex flex-col items-center justify-center"
                      style={{ width: 52, height: 52, border: `1.5px solid ${border}` }}>
                      <span className="font-display leading-none" style={{ fontSize: '1.9rem', color: accent }}>{pts}</span>
                      <span className="font-body font-bold uppercase" style={{ fontSize: '.5rem', letterSpacing: '.1em', color: accent, opacity: .7 }}>pts</span>
                    </div>
                    <div>
                      <p className="font-body font-bold text-sm m-0 mb-1" style={{ color: '#0c182b' }}>{titulo}</p>
                      <p className="font-body text-xs leading-snug m-0" style={{ color: '#5f6e8a' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bloque eliminatorias */}
              <p className="font-body font-bold uppercase mt-5 mb-2" style={{ fontSize: '.6rem', letterSpacing: '.12em', color: '#5f6e8a' }}>
                Fase eliminatoria · Eliminación directa
              </p>
              <div className="rounded-xl p-4" style={{ background: 'rgba(244,180,42,.06)', border: '1px solid rgba(244,180,42,.25)' }}>
                <p className="font-body text-xs mb-3" style={{ color: '#0c182b' }}>
                  En 16avos, octavos, cuartos, semis, 3er puesto y final tenés que predecir <strong>el marcador (90')</strong> y <strong>quién clasifica</strong>.
                  Si terminan empatados, el clasificado se define por <strong>penales</strong>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { pts: 5, titulo: 'Exacto + clasificado', desc: 'Marcador exacto Y acertás quién pasa' },
                    { pts: 3, titulo: 'Diferencia + clasif.',  desc: 'Misma diferencia (no empate) Y acertás quién pasa' },
                    { pts: 3, titulo: 'Exacto sin clasif.',    desc: 'Marcador exacto pero errás el clasificado por penales' },
                    { pts: 1, titulo: 'Solo clasificado',      desc: 'Acertás quién pasa aunque no le pegues al marcador' },
                  ].map(({ pts, titulo, desc }) => (
                    <div key={titulo} className="flex items-center gap-3 rounded-lg p-2.5" style={{ background: '#fff', border: '1px solid #f0eadb' }}>
                      <div className="flex flex-col items-center justify-center flex-shrink-0"
                        style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(244,180,42,.1)', border: '1px solid rgba(244,180,42,.3)' }}>
                        <span className="font-display leading-none" style={{ fontSize: '1.25rem', color: '#c99f16' }}>{pts}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-body font-bold text-xs m-0 mb-0.5" style={{ color: '#0c182b' }}>{titulo}</p>
                        <p className="font-body m-0" style={{ fontSize: '.7rem', color: '#5f6e8a', lineHeight: 1.3 }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="font-body text-center mt-3" style={{ fontSize: '.68rem', color: '#a8b2c4' }}>
                Los puntos se acreditan automáticamente al finalizar cada partido
              </p>
            </div>
          )}
        </div>

        {/* Lista */}
        {loading?(
          <div style={{display:'grid',gap:'1rem'}}>
            {[1,2,3].map(i=><div key={i} style={{height:200,borderRadius:18,background:'#fff',border:'1px solid #f0eadb',animation:'skp 1.4s ease-in-out infinite'}}/>)}
          </div>
        ):filtered.length===0?(
          <div style={{borderRadius:18,padding:'3.5rem 1.5rem',textAlign:'center',background:'#fff',border:'1.5px dashed #f0eadb'}}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#a8b2c4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{margin:'0 auto 1rem'}}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            <p style={{fontWeight:600,fontSize:'.92rem',color:'#5f6e8a',margin:0}}>{filter==='activas'?'No hay apuestas activas':filter==='cerradas'?'No hay apuestas cerradas':'No hay apuestas publicadas'}</p>
            <p style={{fontSize:'.78rem',color:'#a8b2c4',margin:'.4rem 0 0'}}>Volvé a revisar más tarde</p>
          </div>
        ):(
          <div style={{display:'grid',gap:'1rem',animation:'din .38s ease both'}}>
            {filtered.map(bet=>(
              <BetCard key={bet.id} bet={bet} predsMap={predictions} onPredict={setActiveBet}/>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Modal de predicción - ARREGLADO onClose */}
      {activeBet&&(
        <PredictModal bet={activeBet} onSubmit={(id,preds)=>handlePredict(id,preds)} onClose={()=>setActiveBet(null)} loading={loading}/>
      )}
    </AppShell>
  )
}