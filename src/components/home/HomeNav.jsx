import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function HomeNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [
    ['#como-funciona', '¿Cómo funciona?'],
    ['#funcionalidades', 'Funcionalidades'],
    ['#faq', 'Ayuda'],
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={scrolled
        ? { background: 'rgba(5,9,15,.96)', backdropFilter: 'blur(16px)', boxShadow: '0 1px 0 rgba(235,195,43,.2),0 8px 24px rgba(0,0,0,.3)', padding: '.7rem 0' }
        : { background: 'transparent', padding: '1rem 0' }
      }>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img src="./imgprode/one-prode-talento-new3.png" alt="Prode Talento"
          style={{ height: 46, width: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.5))' }} />

        <div className="hidden lg:flex items-center gap-8">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="font-body font-medium text-sm transition-colors"
              style={{ color: 'rgba(255,255,255,.75)', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ebc32b' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.75)' }}>
              {label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/login" className="font-body font-semibold text-sm px-5 py-2.5 rounded-full transition-all"
            style={{ color: 'rgba(255,255,255,.82)', border: '1.5px solid rgba(255,255,255,.28)', textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ebc32b'; e.currentTarget.style.color = '#ebc32b' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.28)'; e.currentTarget.style.color = 'rgba(255,255,255,.82)' }}>
            Iniciar sesión
          </Link>
          <Link to="/register" className="font-body font-bold text-sm px-5 py-2.5 rounded-full transition-all"
            style={{ background: '#ebc32b', color: '#05090f', boxShadow: '0 6px 20px rgba(235,195,43,.3)', textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5d75a'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ebc32b'; e.currentTarget.style.transform = '' }}>
            Crear mi cuenta
          </Link>
        </div>

        <button className="lg:hidden p-2 flex flex-col gap-1.5" onClick={() => setOpen(o => !o)}>
          <span className="block w-6 h-0.5 rounded bg-white" style={open ? { transform: 'rotate(45deg) translate(3px,3px)' } : {}} />
          <span className="block w-6 h-0.5 rounded bg-white" style={open ? { opacity: 0 } : {}} />
          <span className="block w-6 h-0.5 rounded bg-white" style={open ? { transform: 'rotate(-45deg) translate(3px,-3px)' } : {}} />
        </button>
      </div>

      {open && (
        <div className="lg:hidden mt-2 mx-4 rounded-xl p-4 space-y-1"
          style={{ background: 'rgba(12,24,43,.97)', backdropFilter: 'blur(16px)', border: '1px solid rgba(235,195,43,.35)' }}>
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}
              className="block py-3 px-4 rounded-lg text-sm font-body text-white" style={{ textDecoration: 'none' }}>
              {label}
            </a>
          ))}
          <div className="pt-2 space-y-2">
            <Link to="/login" onClick={() => setOpen(false)}
              className="block text-center py-3 rounded-full text-sm font-body font-semibold text-white"
              style={{ border: '1.5px solid rgba(255,255,255,.3)', textDecoration: 'none' }}>
              Iniciar sesión
            </Link>
            <Link to="/register" onClick={() => setOpen(false)}
              className="block text-center py-3 rounded-full text-sm font-body font-bold"
              style={{ background: '#ebc32b', color: '#05090f', textDecoration: 'none' }}>
              Crear mi cuenta
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}