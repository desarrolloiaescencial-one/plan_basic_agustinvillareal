import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function useCountdown(target) {
  const calc = () => {
    const d = new Date(target) - new Date()
    if (d <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return {
      days: Math.floor(d / 86400000),
      hours: Math.floor((d % 86400000) / 3600000),
      minutes: Math.floor((d % 3600000) / 60000),
      seconds: Math.floor((d % 60000) / 1000),
    }
  }
  const [t, setT] = useState(calc)
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id) }, [])
  return t
}

const PREDS = [
  { user: 'M. García', pred: 'Argentina 2 – 1 España', pts: '+10' },
  { user: 'C. López',  pred: 'Brasil 1 – 1 Francia',  pts: '+5'  },
  { user: 'P. Romero', pred: 'Uruguay 3 – 0 México',  pts: '+10' },
]

export default function HomeHero() {
  const cd = useCountdown('2026-06-11T19:00:00')

  return (
    <>
      <style>{`
        @keyframes float-medal-anim {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-12px) rotate(2deg); }
        }
        .float-medal-el { animation: float-medal-anim 5s ease-in-out infinite; }
        @keyframes pulse-dot-anim { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.45;transform:scale(.8)} }
        .pulse-dot-el { animation: pulse-dot-anim 1.6s ease infinite; }
      `}</style>

      <section className="relative min-h-screen text-white overflow-hidden flex items-center"
        style={{
          backgroundImage: "linear-gradient(180deg,rgba(5,9,15,.55) 0%,rgba(12,24,43,.78) 55%,rgba(12,24,43,.96) 100%), url('./imgprode/fondo-banner.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          paddingTop: 'clamp(80px, 10vh, 120px)',
          paddingBottom: 'clamp(60px, 8vh, 100px)',
        }}>

        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 50% at 85% 20%, rgba(235,195,43,.15), transparent 55%), radial-gradient(ellipse 50% 60% at 15% 90%, rgba(66,91,139,.28), transparent 60%)'
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem' }}
          className="relative z-10 w-full">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-center">

            {/* ── COLUMNA IZQUIERDA ── */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              
              {/* Pills superiores */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="inline-flex items-center gap-2 font-body font-bold text-xs uppercase tracking-widest px-3 py-1.5 rounded-full"
                  style={{ border: '1px solid #ebc32b', color: '#ebc32b', background: 'rgba(235,195,43,.1)' }}>
                  <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot-el" />
                  Prode Talento
                </span>
                <span className="hidden sm:flex items-center gap-2 text-xs font-body font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,.55)' }}>
                  <span className="h-px w-6" style={{ background: 'rgba(235,195,43,.45)' }} />
                  Para tu empresa
                </span>
              </div>

              {/* Títulos */}
              <div>
                <h1 className="font-display leading-none block text-white" style={{ fontSize: 'clamp(1.8rem,8vw,5rem)', letterSpacing: '.01em' }}>
                  EL MUNDIAL
                </h1>
                <h1 className="font-display leading-none block" style={{ fontSize: 'clamp(2.8rem,12vw,7.5rem)', letterSpacing: '.01em', color: '#ebc32b', textShadow: '0 0 40px rgba(235,195,43,.4)' }}>
                  SE VIVE
                </h1>
                <h1 className="font-display leading-none block text-white" style={{ fontSize: 'clamp(1.8rem,8vw,5rem)', letterSpacing: '.01em' }}>
                  ACÁ ADENTRO
                </h1>
              </div>

              {/* Descripción */}
              <p className="font-body text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl" style={{ color: 'rgba(255,255,255,.82)' }}>
                Pronosticá los partidos, sumá puntos y competí con tu equipo.
                El <strong className="font-bold text-white">prode interno</strong> de tu empresa ya está activo.
              </p>

              {/* Pills de beneficios */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
                {[
                  { label: 'Competencia sana', sub: 'Entre equipos y áreas', bg: 'linear-gradient(135deg,#ebc32b,#c99f16)', ic: '#05090f' },
                  { label: 'Más participación', sub: 'Todos suman al clima', bg: 'linear-gradient(135deg,#6e83ad,#425b8b)', ic: '#fff' },
                  { label: 'Energía positiva', sub: 'Unión desde el deporte', bg: 'linear-gradient(135deg,#1b8a5a,#146a46)', ic: '#fff' },
                ].map(({ label, sub, bg, ic }) => (
                  <div key={label} className="flex items-center gap-3 rounded-full pl-2 pr-4 py-1.5 w-full sm:w-auto"
                    style={{ background: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.13)', backdropFilter: 'blur(6px)' }}>
                    <span className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-body font-semibold text-white leading-tight">{label}</p>
                      <p className="text-xs font-body leading-tight" style={{ color: 'rgba(255,255,255,.5)' }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/register" className="font-body font-bold text-sm sm:text-base px-6 sm:px-7 py-3.5 sm:py-4 rounded-full inline-flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
                  style={{ background: '#ebc32b', color: '#05090f', boxShadow: '0 8px 24px rgba(235,195,43,.3)', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5d75a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#ebc32b'; e.currentTarget.style.transform = '' }}>
                  Crear mi cuenta
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
                <Link to="/login" className="font-body font-semibold text-sm sm:text-base px-6 sm:px-7 py-3.5 sm:py-4 rounded-full inline-flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
                  style={{ color: '#fff', border: '1.5px solid rgba(255,255,255,.3)', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#ebc32b'; e.currentTarget.style.color = '#ebc32b' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.3)'; e.currentTarget.style.color = '#fff' }}>
                  Ya tengo cuenta →
                </Link>
              </div>

              {/* Alert box */}
              <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg max-w-xl"
                style={{ background: 'linear-gradient(135deg,rgba(184,69,46,.12),rgba(184,69,46,.05))', border: '1px solid rgba(184,69,46,.35)', borderLeft: '3px solid #b8452e' }}>
                <svg viewBox="0 0 24 24" fill="#b8452e" className="w-5 h-5 shrink-0 mt-0.5"><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/></svg>
                <p className="text-xs sm:text-sm font-body leading-relaxed" style={{ color: 'rgba(255,255,255,.88)' }}>
                  <strong className="text-white">El Mundial comienza el 11 de junio.</strong>{' '}
                  Registrate antes de que arranque para no perderte los primeros partidos.
                </p>
              </div>
            </div>

            {/* ── COLUMNA DERECHA ── */}
            <div className="lg:col-span-5">
              {/* Medalla flotante */}
              <div className="relative mb-5 sm:mb-6 flex justify-center">
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(235,195,43,.28), transparent 60%)', filter: 'blur(28px)' }} />
                <img src="./imgprode/one-prode-dorado.png" alt="Prode Talento" className="relative float-medal-el"
                  style={{ width: 'clamp(140px, 30vw, 180px)', filter: 'drop-shadow(0 16px 32px rgba(0,0,0,.6))' }} />
              </div>

              {/* Panel principal */}
              <div className="rounded-2xl p-4 sm:p-5"
                style={{ background: 'linear-gradient(160deg,rgba(12,24,43,.78),rgba(5,9,15,.88))', border: '1px solid rgba(235,195,43,.28)', backdropFilter: 'blur(16px)', boxShadow: '0 28px 70px rgba(5,9,15,.55)' }}>
                
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <img src="./imgprode/one-prode-blanco.png" alt="" style={{ height: 'clamp(16px, 4vw, 20px)', opacity: .8 }} />
                    <span className="font-body text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,.4)' }}>· Mundial 2026</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-body font-bold uppercase tracking-widest" style={{ color: '#ebc32b' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot-el" />
                    En vivo
                  </span>
                </div>

                <div className="mb-4 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(235,195,43,.3),transparent)' }} />

                {/* Countdown */}
                <p className="font-body font-bold text-xs uppercase tracking-widest mb-3 text-center" style={{ color: '#ebc32b' }}>
                  Falta para el inicio
                </p>
                <div className="grid grid-cols-4 gap-1.5 mb-4">
                  {[{v:cd.days,l:'Días'},{v:cd.hours,l:'Horas'},{v:cd.minutes,l:'Min'},{v:cd.seconds,l:'Seg'}].map(({v,l}) => (
                    <div key={l} className="py-2 sm:py-3 text-center rounded-lg"
                      style={{ background: 'rgba(235,195,43,.06)', border: '1px solid rgba(235,195,43,.18)' }}>
                      <div className="font-display leading-none" style={{ fontSize: 'clamp(1.2rem,5vw,2rem)', color: '#ebc32b' }}>
                        {String(v).padStart(2,'0')}
                      </div>
                      <div className="text-[10px] sm:text-xs uppercase tracking-wider mt-1 font-body" style={{ color: 'rgba(255,255,255,.45)' }}>{l}</div>
                    </div>
                  ))}
                </div>

                <div className="mb-4 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(235,195,43,.3),transparent)' }} />

                {/* Predicciones recientes */}
                <p className="font-body font-bold text-xs uppercase tracking-widest mb-3" style={{ color: '#ebc32b' }}>Predicciones recientes</p>
                <div className="space-y-2.5 mb-4">
                  {PREDS.map(({user,pred,pts}) => (
                    <div key={user} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-body font-bold text-xs"
                          style={{ background: '#18243f', color: '#a8b2c4' }}>{user[0]}</div>
                        <div className="min-w-0">
                          <div className="text-white font-body font-semibold text-xs">{user}</div>
                          <div className="font-body text-[10px] sm:text-xs truncate" style={{ color: 'rgba(255,255,255,.38)' }}>{pred}</div>
                        </div>
                      </div>
                      <span className="font-body font-bold text-xs flex-shrink-0" style={{ color: '#ebc32b' }}>{pts}</span>
                    </div>
                  ))}
                </div>

                {/* CTA final */}
                <Link to="/register" className="flex items-center justify-center gap-2 w-full font-body font-bold text-sm py-3 sm:py-3.5 rounded-full transition-all"
                  style={{ background: '#ebc32b', color: '#05090f', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5d75a' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#ebc32b' }}>
                  Empezar a pronosticar
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Wave hero → cream */}
        <svg className="absolute bottom-0 left-0 w-full" style={{ display: 'block', height: 100, marginBottom: -2 }}
          viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hero-wave-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0c182b" stopOpacity="0" />
              <stop offset="100%" stopColor="#0c182b" stopOpacity="1" />
            </linearGradient>
          </defs>
          <rect width="1440" height="100" fill="url(#hero-wave-grad)" />
          <path d="M0,60 C240,100 480,15 720,35 C960,55 1200,100 1440,60 L1440,100 L0,100 Z" fill="#faf7f0" />
        </svg>
      </section>
    </>
  )
}