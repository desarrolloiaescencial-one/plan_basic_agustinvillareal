/**
 * RankingPageAdmin.jsx — Versión ADMIN
 * Ubicación: src/pages/RankingPageAdmin.jsx
 * 
 * Muestra:
 * - Todas las apuestas con ranking completo
 * - Detalles de predicciones por participante
 * - Tabla expandible con todas las predicciones
 */
import { useState, useEffect } from 'react'
import AppShell from '../dashboard/AppShell.jsx'
import { useBets } from '../hooks/useBets.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import sheetsApi from '../services/sheetsApi.js'

function isOpen(b) { return b.estado==='abierta' && new Date(b.fecha_cierre)>Date.now() }

const CSS = `
@keyframes rk-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes rk-shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
.rk-in { animation: rk-in .28s ease both }
.rk-sk { background:linear-gradient(90deg,rgba(12,24,43,.06) 25%,rgba(12,24,43,.1) 50%,rgba(12,24,43,.06) 75%);background-size:400px 100%;animation:rk-shimmer 1.4s ease infinite;border-radius:8px }
`

export default function RankingPageAdmin() {
  const { bets, loading: lb } = useBets()
  const { user } = useAuth()

  const [sel, setSel] = useState(null)
  const [tabla, setTabla] = useState([])
  const [predicciones, setPredicciones] = useState({})
  const [loading, setLoading] = useState(false)
  const [expandedUser, setExpandedUser] = useState(null)

  async function cargarRanking(bet) {
    if (sel?.id === bet.id) return
    setSel(bet)
    setLoading(true)
    setTabla([])
    setPredicciones({})
    setExpandedUser(null)
    
    try {
      const resp = await sheetsApi.predicciones.tabla(bet.id)
      setTabla(resp.tabla || [])
      
      // Cargar todas las predicciones por usuario
      const preds = {}
      for (const user of resp.tabla || []) {
        const predResp = await sheetsApi.predicciones.porUsuario(bet.id, user.user_id)
        preds[user.user_id] = predResp.predicciones || []
      }
      setPredicciones(preds)
    } catch (e) {
      alert('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <style>{CSS}</style>

      <div style={{maxWidth:1400, margin:'0 auto', padding:'2rem 1.5rem 3rem'}}>

        {/* Header */}
        <div className="rk-in" style={{marginBottom:'1.5rem'}}>
          <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(2.4rem,6vw,3.5rem)',color:'#0c182b',margin:'0 0 .3rem',lineHeight:1,letterSpacing:'.02em'}}>
            RANKING ADMIN
          </h1>
          <p style={{fontSize:'.84rem',color:'#5f6e8a',margin:0}}>
            {sel ? `Detalles de "${sel.titulo}"` : `${bets.length} apuestas disponibles`}
          </p>
        </div>

        {!sel ? (
          // LISTADO DE APUESTAS
          <div style={{display:'grid',gap:'1rem'}}>
            {lb && [...Array(4)].map((_, i) => (
              <div key={i} className="rk-sk" style={{height:100}}/>
            ))}

            {!lb && bets.length === 0 && (
              <div style={{textAlign:'center',padding:'3rem 1.5rem',background:'#fff',border:'1px solid #f0eadb',borderRadius:14}}>
                <p style={{fontWeight:600,color:'#5f6e8a',margin:0}}>Sin apuestas creadas</p>
              </div>
            )}

            {!lb && bets.map(bet => {
              const activa = isOpen(bet)
              return (
                <div key={bet.id} 
                  onClick={() => cargarRanking(bet)}
                  style={{
                    display:'grid',
                    gridTemplateColumns:'1fr auto auto',
                    gap:'1.5rem',
                    padding:'1.2rem 1.5rem',
                    background:'#fff',
                    border:'1px solid #f0eadb',
                    borderRadius:14,
                    cursor:'pointer',
                    transition:'all .2s',
                  }}
                  onMouseEnter={e => {e.currentTarget.style.borderColor='#ebc32b';e.currentTarget.style.boxShadow='0 4px 16px rgba(235,195,43,.15)'}}
                  onMouseLeave={e => {e.currentTarget.style.borderColor='#f0eadb';e.currentTarget.style.boxShadow='none'}}
                >
                  <div>
                    <h3 style={{fontWeight:700,fontSize:'1rem',color:'#0c182b',margin:'0 0 .3rem'}}>{bet.titulo}</h3>
                    <p style={{fontSize:'.75rem',color:'#5f6e8a',margin:0}}>
                      {bet.participantes||0} participantes · {bet.partidos_ids?.split(',').filter(Boolean).length||0} partidos
                    </p>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <p style={{fontSize:'.7rem',color:'#94a3b8',textTransform:'uppercase',margin:'0 0 .3rem'}}>Estado</p>
                    <span style={{
                      display:'inline-block',
                      fontSize:'.8rem',
                      fontWeight:700,
                      padding:'.3rem .7rem',
                      borderRadius:99,
                      background: activa ? 'rgba(34,197,94,.1)' : 'rgba(235,195,43,.1)',
                      color: activa ? '#22c55e' : '#c99f16',
                    }}>
                      {activa ? 'ACTIVA' : bet.estado === 'finalizada' ? 'FINALIZADA' : 'CERRADA'}
                    </span>
                  </div>
                  <div style={{textAlign:'right',color:'#5f6e8a'}}>→</div>
                </div>
              )
            })}
          </div>
        ) : (
          // DETALLES DE LA APUESTA
          <div className="rk-in">
            <button
              onClick={() => setSel(null)}
              style={{
                fontSize:'.85rem',
                padding:'.5rem .9rem',
                background:'#fff',
                border:'1px solid #f0eadb',
                borderRadius:8,
                cursor:'pointer',
                marginBottom:'1.5rem',
              }}
            >
              ← Volver
            </button>

            {loading ? (
              <div style={{display:'grid',gap:'1rem'}}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="rk-sk" style={{height:80}}/>
                ))}
              </div>
            ) : tabla.length === 0 ? (
              <div style={{textAlign:'center',padding:'3rem',background:'#fff',border:'1px solid #f0eadb',borderRadius:14}}>
                <p style={{fontWeight:600,color:'#5f6e8a'}}>Sin participantes todavía</p>
              </div>
            ) : (
              <div style={{display:'grid',gap:'1.2rem'}}>
                {tabla.map((u, idx) => (
                  <div key={u.user_id} style={{background:'#fff',border:'1px solid #f0eadb',borderRadius:14,overflow:'hidden'}}>
                    
                    {/* Header del participante */}
                    <button
                      onClick={() => setExpandedUser(expandedUser === u.user_id ? null : u.user_id)}
                      style={{
                        width:'100%',
                        display:'grid',
                        gridTemplateColumns:'40px 1fr 120px 80px',
                        gap:'1rem',
                        padding:'1rem 1.5rem',
                        alignItems:'center',
                        background:'#fff',
                        border:'none',
                        cursor:'pointer',
                        transition:'all .2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background='#fcfaf6'}
                      onMouseLeave={e => e.currentTarget.style.background='#fff'}
                    >
                      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.1rem',fontWeight:700,color:'#0c182b'}}>{idx+1}</span>
                      
                      <div style={{textAlign:'left',minWidth:0}}>
                        <p style={{fontWeight:600,fontSize:'.95rem',color:'#0c182b',margin:'0 0 .2rem'}}>{u.nombre}</p>
                        <p style={{fontSize:'.75rem',color:'#5f6e8a',margin:0}}>{u.predicciones} predicciones</p>
                      </div>

                      <div style={{display:'flex',gap:'.4rem',justifyContent:'center'}}>
                        {[{v:u.aciertos_exactos,c:'#22c55e'},{v:u.aciertos_diferencia||0,c:'#ebc32b'}].map((x,i) => (
                          x.v > 0 && (
                            <span key={i} style={{
                              display:'flex',alignItems:'center',justifyContent:'center',
                              width:28,height:28,borderRadius:6,
                              background:`${x.c}15`,border:`1px solid ${x.c}30`,
                              fontSize:'.8rem',fontWeight:700,color:x.c
                            }}>
                              {x.v}
                            </span>
                          )
                        ))}
                      </div>

                      <div style={{textAlign:'right',fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.3rem',fontWeight:700,color:'#0c182b'}}>
                        {u.puntos_totales}
                      </div>
                    </button>

                    {/* Predicciones expandidas */}
                    {expandedUser === u.user_id && (
                      <div style={{borderTop:'1px solid #f0eadb',padding:'1rem 1.5rem',background:'#fcfaf6'}}>
                        <p style={{fontSize:'.75rem',fontWeight:700,textTransform:'uppercase',color:'#5f6e8a',margin:'0 0 1rem'}}>
                          Predicciones ({predicciones[u.user_id]?.length||0})
                        </p>
                        
                        <div style={{display:'grid',gap:'.8rem'}}>
                          {predicciones[u.user_id]?.length ? (
                            predicciones[u.user_id].map((pred, i) => (
                              <div key={i} style={{
                                display:'grid',
                                gridTemplateColumns:'1fr 80px 80px',
                                gap:'1rem',
                                padding:'.8rem',
                                background:'#fff',
                                border:'1px solid #e8e3db',
                                borderRadius:10,
                                alignItems:'center',
                              }}>
                                <div style={{minWidth:0}}>
                                  <p style={{fontSize:'.85rem',fontWeight:600,color:'#0c182b',margin:'0 0 .2rem'}}>
                                    {pred.equipo_local} vs {pred.equipo_visitante}
                                  </p>
                                  <p style={{fontSize:'.7rem',color:'#5f6e8a',margin:0}}>
                                    Jornada {pred.jornada} · {pred.fecha_partido ? new Date(pred.fecha_partido).toLocaleDateString('es-AR') : '—'}
                                  </p>
                                </div>

                                <div style={{textAlign:'center'}}>
                                  <p style={{fontSize:'.7rem',color:'#5f6e8a',margin:'0 0 .2rem'}}>Predicción</p>
                                  <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',fontWeight:700,color:'#0c182b',margin:0}}>
                                    {pred.pred_local}-{pred.pred_visitante}
                                  </p>
                                </div>

                                <div style={{textAlign:'center'}}>
                                  <p style={{fontSize:'.7rem',color:'#5f6e8a',margin:'0 0 .2rem'}}>Real</p>
                                  <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',fontWeight:700,color:pred.goles_local==null?'#a8b2c4':'#0c182b',margin:0}}>
                                    {pred.goles_local!=null ? `${pred.goles_local}-${pred.goles_visitante}` : '—'}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p style={{fontSize:'.75rem',color:'#a8b2c4',textAlign:'center',margin:0}}>Sin predicciones</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}