export default function AdminHeader({ bets = [], pendingUsers = [] }) {
  const activeBets   = bets.filter(b => b.estado === 'abierta').length
  const closedBets   = bets.filter(b => b.estado === 'cerrada').length
  const finishedBets = bets.filter(b => b.estado === 'finalizada').length
  const totalBets    = bets.length

  const stats = [
    { label:'Total Apuestas', value:totalBets,           color:'#0c182b', accent:'rgba(12,24,43,.06)',  border:'rgba(12,24,43,.1)',   icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
    { label:'Activas',        value:activeBets,          color:'#1b8a5a', accent:'rgba(27,138,90,.07)', border:'rgba(27,138,90,.18)', icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49"/></svg> },
    { label:'Finalizadas',    value:finishedBets,        color:'#c99f16', accent:'rgba(235,195,43,.07)',border:'rgba(235,195,43,.2)',  icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
    { label:'Pendientes',     value:pendingUsers.length, color: pendingUsers.length > 0 ? '#e03252' : '#5f6e8a', accent: pendingUsers.length > 0 ? 'rgba(224,50,82,.07)' : 'rgba(95,110,138,.05)', border: pendingUsers.length > 0 ? 'rgba(224,50,82,.2)' : 'rgba(95,110,138,.12)', icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ]

  return (
    <div style={{ marginBottom:'1.75rem' }}>

      {/* Título estilo Fixture */}
      <div style={{ marginBottom:'1.25rem' }}>
<h1 style={{ 
  fontFamily:"'Bebas Neue',sans-serif", 
  fontSize:'clamp(2.4rem,6vw,3.5rem)', 
  color:'#0c182b', 
  margin:'0 0 .3rem', 
  lineHeight:1, 
  letterSpacing:'.02em',
  textAlign: 'left'   // ← AGREGAR ESTO
}}>
  PANEL DE <span style={{ color:'#ebc32b' }}>CONFIGURACIÓN</span>
</h1>
      </div>

      {/* Stats cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:'.75rem' }}>
        {stats.map(({ label, value, color, accent, border, icon }) => (
          <div key={label}
            style={{ background:'#fff', border:`1px solid ${border}`, borderRadius:14, padding:'1rem 1.2rem', display:'flex', alignItems:'center', gap:'.85rem', boxShadow:'0 1px 0 rgba(12,24,43,.04)', transition:'transform .18s,box-shadow .18s', cursor:'default' }}
            onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 20px rgba(12,24,43,.08)' }}
            onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 1px 0 rgba(12,24,43,.04)' }}>
            <div style={{ width:38, height:38, borderRadius:10, background:accent, border:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color }}>
              {icon}
            </div>
            <div>
              <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', color, margin:0, lineHeight:1 }}>{value}</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'.63rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'#a8b2c4', margin:'.2rem 0 0' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}