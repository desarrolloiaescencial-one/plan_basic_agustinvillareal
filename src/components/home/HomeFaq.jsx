import { useState } from 'react'
import { Link } from 'react-router-dom'

const FAQS = [
  { q: '¿Cómo me registro?', a: 'Hacé clic en "Crear mi cuenta", ingresá tu nombre y email de la empresa y elegí una contraseña. Un administrador aprueba tu acceso — generalmente en minutos.' },
  { q: '¿Cómo cargo mis predicciones?', a: 'Una vez dentro, entrá a la sección "Apuestas", encontrá un partido abierto y cargá el resultado que creés que va a pasar. La apuesta cierra cuando arranca el partido.' },
  { q: '¿Cómo se calculan los puntos?', a: 'Acertar el resultado exacto suma más puntos que acertar solo quién gana. El sistema lo calcula automáticamente y actualiza el ranking después de cada partido.' },
  { q: '¿Qué es una apuesta grupal por área?', a: 'Es una dinámica donde tu puntaje individual también suma para tu sector. Toda el área compite como equipo contra las demás áreas de la empresa.' },
  { q: '¿Puedo ver mis predicciones anteriores?', a: 'Sí. En "Mis Predicciones" encontrás el historial completo de tus pronósticos, cuántos acertaste y cómo evolucionó tu puntaje durante el torneo.' },
  { q: '¿La plataforma funciona en el celular?', a: 'Sí, está optimizada para cualquier dispositivo. Solo necesitás el link y tu usuario — no hay nada que instalar.' },
]

export default function HomeFaq() {
  const [open, setOpen] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState(null)

  return (
    <section id="faq" className="relative" style={{ background: '#faf7f0', paddingTop: '6rem', paddingBottom: '8rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left */}
          <div className="lg:sticky" style={{ top: '7rem' }}>
            <span className="inline-flex items-center gap-2 font-body font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-6"
              style={{ border: '1.5px solid #ebc32b', color: '#c99f16', background: 'rgba(235,195,43,.12)' }}>
              Ayuda
            </span>
            <h2 className="font-display mb-6" style={{ fontSize: 'clamp(2.5rem,6vw,4.2rem)', color: '#0c182b', lineHeight: 0.95, letterSpacing: '.01em' }}>
              PREGUNTAS<br />FRECUENTES
            </h2>
            <p className="font-body text-base leading-relaxed mb-10" style={{ color: '#5f6e8a', maxWidth: '28rem' }}>
              Todo lo que necesitás saber para empezar a participar y sacarle el máximo a la plataforma.
            </p>
            <Link to="/register"
              className="inline-flex items-center gap-2 font-body font-bold text-sm px-7 py-4 rounded-full transition-all duration-300"
              style={{ background: '#0c182b', color: '#fff', textDecoration: 'none', boxShadow: '0 4px 14px rgba(12,24,43,.25)' }}
              onMouseEnter={e => { 
                e.currentTarget.style.background = '#18243f'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(12,24,43,.35)'
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.background = '#0c182b'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(12,24,43,.25)'
              }}>
              Registrarme ahora
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          </div>

          {/* Accordion */}
          <div className="space-y-4">
            {FAQS.map(({ q, a }, i) => {
              const isOpen = open === i
              const isHovered = hoveredIndex === i
              
              return (
                <div 
                  key={i} 
                  className="rounded-2xl overflow-hidden bg-white transition-all duration-300"
                  style={{
                    border: isOpen ? '2px solid #ebc32b' : isHovered ? '2px solid #f0eadb' : '2px solid transparent',
                    boxShadow: isOpen 
                      ? '0 8px 24px rgba(235,195,43,.18), 0 2px 8px rgba(235,195,43,.1)' 
                      : isHovered 
                        ? '0 4px 12px rgba(12,24,43,.08)' 
                        : '0 2px 4px rgba(12,24,43,.04)',
                    transform: isOpen ? 'scale(1.01)' : 'scale(1)',
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <button
                    className="w-full flex items-start justify-between gap-4 text-left px-6 py-5 transition-colors duration-200"
                    style={{ background: isOpen ? 'rgba(235,195,43,.03)' : 'transparent' }}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span className="font-body font-bold text-base leading-snug"
                      style={{ color: isOpen ? '#0c182b' : '#2b3a5a' }}>
                      {q}
                    </span>
                    <span 
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                      style={isOpen 
                        ? { background: '#ebc32b', color: '#05090f', transform: 'rotate(180deg)' } 
                        : { background: isHovered ? '#f5edd5' : '#f0eadb', color: '#5f6e8a', transform: 'rotate(0deg)' }
                      }
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </span>
                  </button>
                  
                  <div 
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight: isOpen ? '300px' : '0',
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="px-6 pb-6 pt-2" style={{ borderTop: isOpen ? '1px solid #f0eadb' : 'none' }}>
                      <p className="font-body text-sm leading-relaxed pt-3" style={{ color: '#5f6e8a' }}>
                        {a}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Wave FAQ → footer */}
      <svg className="absolute bottom-0 left-0 w-full" style={{ display: 'block', height: 120, marginBottom: -2 }}
        viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,40 C360,110 720,10 1080,55 C1260,70 1380,45 1440,38 L1440,120 L0,120 Z" fill="#05090f" />
      </svg>
    </section>
  )
}