import { Link } from 'react-router-dom'

export default function HomeFooter() {
  return (
    <footer style={{ background: '#05090f', position: 'relative', overflow: 'hidden' }}>

      {/* Glow ambiental de fondo */}
      <div style={{ position:'absolute', bottom:0, left:0, width:400, height:250, background:'radial-gradient(ellipse at 0% 100%,rgba(11,74,110,.18),transparent 65%)', pointerEvents:'none' }}/>

      {/* ── Cuerpo principal ── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'3.5rem 1.5rem 2.5rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'2.5rem' }}>

          {/* Col 1: Brand */}
          <div>
            {/* Logos ONE + Escencial */}
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.25rem' }}>
              <img
                src="./img/one-logocolor.png"
                alt="ONE"
                style={{ height:34, width:'auto', filter:'drop-shadow(0 2px 16px rgba(235,195,43,.3))', opacity:.96 }}
              />
              <div style={{ width:1, height:36, background:'rgba(235,195,43,.22)', flexShrink:0 }}/>
              <a href="https://escencialconsultora.com.ar" target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none', display:'inline-flex' }}>
                <img
                  src="./img/escencial-logoblanco.png"
                  alt="Escencial Consultora"
                  style={{ height:42, width:'auto', opacity:.82, filter:'drop-shadow(0 2px 10px rgba(0,0,0,.6))', transition:'opacity .18s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.opacity=1 }}
                  onMouseLeave={e=>{ e.currentTarget.style.opacity=.82 }}
                />
              </a>
            </div>

            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'.82rem', lineHeight:1.7, color:'rgba(255,255,255,.42)', maxWidth:'22rem', margin:'0 0 1.2rem' }}>
              Consultora especializada en Recursos Humanos. Clima laboral, evaluación de personas y cultura organizacional.
            </p>
            {/* Social / contacto rápido */}
            <div style={{ display:'flex', gap:'.6rem' }}>
              <a href="https://wa.me/5491133588062" target="_blank" rel="noopener noreferrer"
                style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .18s', textDecoration:'none' }}
                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(235,195,43,.12)'; e.currentTarget.style.borderColor='rgba(235,195,43,.3)' }}
                onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,.08)' }}>
                {/* WhatsApp icon */}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </a>
              <a href="mailto:mferreyra@escencialconsult.com.ar"
                style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .18s', textDecoration:'none' }}
                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(235,195,43,.12)'; e.currentTarget.style.borderColor='rgba(235,195,43,.3)' }}
                onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,.08)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </a>
              <a href="https://escencialconsultora.com.ar" target="_blank" rel="noopener noreferrer"
                style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .18s', textDecoration:'none' }}
                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(235,195,43,.12)'; e.currentTarget.style.borderColor='rgba(235,195,43,.3)' }}
                onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,.08)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Servicios */}
          <div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'.65rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.2em', color:'rgba(235,195,43,.7)', margin:'0 0 1.1rem' }}>
              Servicios
            </p>
            <ul style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:'.6rem' }}>
              {[
                'Clima laboral',
                'Evaluación de personas',
                'Cultura organizacional',
                'Capacitación y desarrollo',
              ].map(label => (
                <li key={label}>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'.84rem', color:'rgba(255,255,255,.45)', display:'inline-flex', alignItems:'center', gap:'.4rem' }}>
                    <span style={{ width:4, height:4, borderRadius:'50%', background:'rgba(235,195,43,.3)', flexShrink:0 }}/>
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: ONE */}
          <div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'.65rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.2em', color:'rgba(235,195,43,.7)', margin:'0 0 1.1rem' }}>
              ONE Human-Tech
            </p>
            <ul style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:'.6rem' }}>
              {[
                { href:'https://escencialconsultora.com.ar', label:'Nuestra empresa' },
                { href:'https://escencialconsultora.com.ar', label:'Quiénes somos' },
                { href:'https://escencialconsultora.com.ar', label:'Plataformas ONE' },
              ].map(({ href, label }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'.84rem', color:'rgba(255,255,255,.48)', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'.4rem', transition:'color .18s' }}
                    onMouseEnter={e=>{ e.currentTarget.style.color='#ebc32b' }}
                    onMouseLeave={e=>{ e.currentTarget.style.color='rgba(255,255,255,.48)' }}>
                    <span style={{ width:4, height:4, borderRadius:'50%', background:'rgba(235,195,43,.3)', flexShrink:0 }}/>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contacto */}
          <div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'.65rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.2em', color:'rgba(235,195,43,.7)', margin:'0 0 1.1rem' }}>
              Contacto
            </p>
            <ul style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:'.6rem' }}>
              {[
                { href:'mailto:mferreyra@escencialconsult.com.ar', label:'mferreyra@escencialconsult.com.ar' },
                { href:'https://wa.me/5491133588062',              label:'+54 9 11 3358-8062' },
                { href:'https://escencialconsultora.com.ar',       label:'escencialconsultora.com.ar' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'.82rem', color:'rgba(255,255,255,.48)', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'.4rem', transition:'color .18s' }}
                    onMouseEnter={e=>{ e.currentTarget.style.color='#ebc32b' }}
                    onMouseLeave={e=>{ e.currentTarget.style.color='rgba(255,255,255,.48)' }}>
                    <span style={{ width:4, height:4, borderRadius:'50%', background:'rgba(235,195,43,.3)', flexShrink:0 }}/>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 1.5rem' }}>
        <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(235,195,43,.2) 20%,rgba(235,195,43,.2) 80%,transparent)' }}/>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'1.25rem 1.5rem' }}>
        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:'.75rem' }}>

          {/* Izq: copyright */}
          <div style={{ display:'flex', alignItems:'center', gap:'.85rem' }}>
            <img src="./img/one-icononegro.png" alt="" style={{ width:18, height:18, objectFit:'contain', opacity:.25 }}/>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'.72rem', color:'rgba(255,255,255,.25)' }}>
              © 2026 ONE · Escencial. Todos los derechos reservados.
            </span>
          </div>

          {/* Der: legal */}
          <div style={{ display:'flex', alignItems:'center', gap:'1.25rem' }}>
            {['V1.1.2'].map(t => (
              <span key={t} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'.72rem', color:'rgba(255,255,255,.22)', cursor:'pointer', transition:'color .18s' }}
                onMouseEnter={e=>{ e.currentTarget.style.color='rgba(255,255,255,.5)' }}
                onMouseLeave={e=>{ e.currentTarget.style.color='rgba(255,255,255,.22)' }}>
                {t}
              </span>
            ))}
          </div>

        </div>
      </div>

    </footer>
  )
}