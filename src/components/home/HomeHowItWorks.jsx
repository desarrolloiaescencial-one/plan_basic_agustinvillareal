import { Link } from 'react-router-dom'

const STEPS = [
  {
    n: '01', title: 'REGISTRATE',
    desc: 'Ingresá con tu email de empresa. RRHH aprueba tu acceso en minutos y ya estás dentro.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    n: '02', title: 'PRONOSTICÁ',
    desc: 'Antes de cada partido, cargá el resultado que creés que va a pasar. Se cierra cuando arranca.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
  {
    n: '03', title: 'GANÁ',
    desc: 'Cada acierto suma puntos. El ranking final define al ganador. El premio lo define tu empresa.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  },
]

export default function HomeHowItWorks() {
  return (
    /* position relative para el wave absolute */
    <section id="como-funciona" className="relative" style={{ background: '#faf7f0', paddingTop: '5rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>

        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 font-body font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-5"
            style={{ border: '1px solid #ebc32b', color: '#c99f16', background: 'rgba(235,195,43,.1)' }}>
            Cómo funciona
          </span>
          <h2 className="font-display" style={{ fontSize: 'clamp(2.4rem,6vw,4rem)', color: '#0c182b', lineHeight: 1, letterSpacing: '.01em' }}>
            3 PASOS Y ESTÁS JUGANDO
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {STEPS.map(({ n, title, desc, icon }) => (
            <div key={n} className="relative rounded-2xl p-7 bg-white transition-all duration-300"
              style={{ border: '1px solid #f0eadb', boxShadow: '0 1px 0 rgba(12,24,43,.03)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ebc32b'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(12,24,43,.1)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0eadb'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 0 rgba(12,24,43,.03)' }}
            >
              <div className="font-display leading-none mb-4 select-none" style={{ fontSize: '5.5rem', color: '#ebc32b', opacity: .70 }}>
                {n}
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: 'linear-gradient(135deg,#0c182b,#425b8b)', color: '#ebc32b' }}>
                {icon}
              </div>
              <h3 className="font-display text-2xl mb-3" style={{ color: '#0c182b', letterSpacing: '.01em' }}>{title}</h3>
              <p className="font-body text-sm leading-relaxed" style={{ color: '#5f6e8a' }}>{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/register"
            className="inline-flex items-center gap-2 font-body font-bold text-base px-8 py-4 rounded-full transition-all"
            style={{ background: '#ebc32b', color: '#05090f', boxShadow: '0 8px 24px rgba(235,195,43,.28)', textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5d75a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ebc32b'; e.currentTarget.style.transform = '' }}>
            Empezar ahora
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
      </div>

      {/* ── WAVE: howItWorks (#faf7f0) → features (#0c182b)
          rect = cream (esta sección), path fill = navy (siguiente sección) */}
      <svg className="absolute bottom-0 left-0 w-full" style={{ display: 'block', height: 72, marginBottom: -2 }}
        viewBox="0 0 1440 72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="1440" height="72" fill="#faf7f0" />
        <path d="M0,40 C360,72 720,0 1080,30 C1260,45 1380,60 1440,40 L1440,72 L0,72 Z" fill="#0c182b" />
      </svg>
    </section>
  )
}