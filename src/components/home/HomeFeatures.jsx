import { Link } from 'react-router-dom'

const FEATURES = [
  { title: 'Predicciones por partido', desc: 'Cargá tu resultado antes del cierre. El sistema acepta pronósticos hasta el inicio del partido.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { title: 'Ranking en tiempo real', desc: 'Posiciones actualizadas automáticamente. Seguí tu puesto y el de tus compañeros.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { title: 'Apuestas por áreas', desc: 'Competí representando a tu sector. El puntaje individual suma al total de tu área.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { title: 'Historial de pronósticos', desc: 'Revisá todos tus aciertos y errores. Seguí tu progreso durante todo el torneo.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  { title: 'Fixture completo', desc: 'Todos los partidos del torneo, estados actualizados y resultados en tiempo real.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { title: 'Tablas de grupos', desc: 'Seguí las posiciones de cada grupo. Visualizá el avance de las selecciones.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
  { title: 'Panel de administración', desc: 'Para RRHH: aprobá usuarios, gestioná áreas y controlá el torneo completo.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 1.64 13.49M4.93 4.93A10 10 0 0 0 3.29 18.42"/><path d="M14.83 9.17a4 4 0 0 1 1.07 4.47M9.17 9.17a4 4 0 0 0-1.07 4.47"/></svg> },
  { title: 'Branding corporativo', desc: 'La plataforma se adapta con el logo e identidad visual de tu organización.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg> },
]

export default function HomeFeatures() {
  return (
    /* position relative para el wave absolute */
    <section id="funcionalidades" className="relative" style={{ background: '#0c182b', paddingTop: '5.5rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>

        <div className="grid lg:grid-cols-2 gap-10 items-end mb-14">
          <div>
            <span className="inline-flex items-center gap-2 font-body font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-5"
              style={{ border: '1px solid #ebc32b', color: '#ebc32b', background: 'rgba(235,195,43,.1)' }}>
              Todo lo que incluye
            </span>
            <h2 className="font-display text-white" style={{ fontSize: 'clamp(2.4rem,6vw,4rem)', lineHeight: 1, letterSpacing: '.01em' }}>
              UNA PLATAFORMA<br /><span style={{ color: '#ebc32b' }}>COMPLETA</span>
            </h2>
          </div>
          <p className="font-body text-base leading-relaxed" style={{ color: '#a8b2c4' }}>
            Todo lo que necesitás para participar, seguir el torneo y competir con tu equipo está en un solo lugar.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ title, desc, icon }) => (
            <div key={title} className="rounded-xl p-5 transition-all duration-300"
              style={{ background: 'linear-gradient(155deg,rgba(66,91,139,.22),rgba(66,91,139,.05))', border: '1px solid rgba(235,195,43,.18)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ebc32b'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(0,0,0,.4)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(235,195,43,.18)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg,#0c182b,#425b8b)', color: '#ebc32b' }}>
                {icon}
              </div>
              <h3 className="font-body font-semibold text-sm text-white mb-2">{title}</h3>
              <p className="font-body text-xs leading-relaxed" style={{ color: '#a8b2c4' }}>{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/register"
            className="inline-flex items-center gap-2 font-body font-bold text-base px-8 py-4 rounded-full transition-all"
            style={{ background: '#ebc32b', color: '#05090f', boxShadow: '0 8px 24px rgba(235,195,43,.25)', textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5d75a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ebc32b'; e.currentTarget.style.transform = '' }}>
            Crear mi cuenta y empezar
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
      </div>

      {/* ── WAVE: features (#0c182b) → FAQ (#faf7f0)
          rect = navy (esta sección), path fill = cream (siguiente sección)
          ESTE ERA EL PROBLEMA: sin rect, el área transparente mostraba #05090f del wrapper */}
      <svg className="absolute bottom-0 left-0 w-full" style={{ display: 'block', height: 80, marginBottom: -2 }}
        viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="1440" height="80" fill="#0c182b" />
        <path d="M0,30 C320,80 640,0 960,38 C1120,55 1320,22 1440,32 L1440,80 L0,80 Z" fill="#faf7f0" />
      </svg>
    </section>
  )
}