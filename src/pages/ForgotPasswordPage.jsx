import { useState } from 'react'
import { Link } from 'react-router-dom'
import sheetsApi from '../services/sheetsApi.js'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await sheetsApi.auth.resetSolicitar(email)
      setDone(true)
    } catch (err) {
      setError(err.message || 'No se pudo procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes lp-fade { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .lp-card { animation: lp-fade .5s ease both; }
        @keyframes lp-spin { to{transform:rotate(360deg)} }
        .lp-spin { animation: lp-spin .75s linear infinite; }
        @keyframes lp-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .lp-pulse { animation: lp-pulse 1.8s ease infinite; }
      `}</style>

      {/* ── Full-screen background ── */}
      <div
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-8"
        style={{
          backgroundImage: [
            'linear-gradient(160deg, rgba(5,9,15,.82) 0%, rgba(12,24,43,.88) 45%, rgba(5,9,15,.95) 100%)',
            "url('./imgprode/fondo-banner.png')",
          ].join(','),
          backgroundSize: 'cover',
          backgroundPosition: 'center 25%',
        }}
      >
        {/* Gold glow top-left */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{
          background: 'radial-gradient(ellipse 55% 45% at 20% 25%, rgba(235,195,43,.16), transparent 55%)'
        }} />
        {/* Blue glow bottom-right */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{
          background: 'radial-gradient(ellipse 50% 45% at 80% 75%, rgba(66,91,139,.28), transparent 55%)'
        }} />

        {/* ── TOP: logo ── */}
        <div className="relative z-10 flex flex-col items-center mb-6 lp-card">
          <img
            src="./imgprode/one-prode-talento-new3.png"
            alt="Prode Talento"
            style={{ height: 52, width: 'auto', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,.6))' }}
          />
        </div>

        {/* ── CARD ── */}
        <div
          className="lp-card relative z-10 w-full"
          style={{
            maxWidth: 420,
            background: 'linear-gradient(160deg, rgba(12,24,43,.92) 0%, rgba(5,9,15,.96) 100%)',
            border: '1px solid rgba(235,195,43,.25)',
            borderRadius: 20,
            boxShadow: '0 32px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(235,195,43,.08), inset 0 1px 0 rgba(255,255,255,.05)',
            backdropFilter: 'blur(24px)',
            animationDelay: '.1s',
          }}
        >
          {/* Gold top accent line */}
          <div className="rounded-t-[20px] h-0.5 w-full"
            style={{ background: 'linear-gradient(90deg, transparent, #ebc32b 30%, #ebc32b 70%, transparent)' }} />

          <div className="px-8 py-8">

            {done ? (
              /* ── Estado: email enviado ─────────────────── */
              <div className="text-center py-2">
                <div
                  className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(235,195,43,.12)',
                    border: '2px solid rgba(235,195,43,.45)',
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ebc32b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>

                <h2 className="font-display mb-3" style={{ fontSize: '2rem', color: '#fff', letterSpacing: '.03em' }}>
                  REVISÁ TU EMAIL
                </h2>
                <p className="font-body text-sm mb-5 max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,.55)', lineHeight: 1.5 }}>
                  Si el email está registrado, te enviamos un correo con instrucciones para restablecer tu contraseña. Revisá también la carpeta de spam.
                </p>

                <p className="font-body text-xs mb-6" style={{ color: 'rgba(255,255,255,.3)' }}>
                  El link expira en 1 hora.
                </p>

                <Link
                  to="/login"
                  className="inline-block font-body font-semibold text-sm transition-colors"
                  style={{ color: '#ebc32b', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#f5d75a' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#ebc32b' }}
                >
                  ← Volver al login
                </Link>
              </div>
            ) : (
              /* ── Estado: formulario ───────────── */
              <>
                <div className="mb-7">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 lp-pulse" />
                    <span className="font-body text-xs uppercase tracking-widest font-bold"
                      style={{ color: 'rgba(235,195,43,.7)' }}>
                      Recuperar acceso
                    </span>
                  </div>
                  <h1 className="font-display leading-none"
                    style={{ fontSize: '2.4rem', color: '#fff', letterSpacing: '.03em' }}>
                    ¿OLVIDASTE<br />TU CONTRASEÑA?
                  </h1>
                  <p className="font-body text-sm mt-2" style={{ color: 'rgba(255,255,255,.45)' }}>
                    Ingresá tu email y te enviamos un link para elegir una contraseña nueva.
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px mb-6"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(235,195,43,.2) 50%, transparent)' }} />

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Email */}
                  <div>
                    <label htmlFor="email"
                      className="block font-body font-bold text-xs uppercase tracking-widest mb-2"
                      style={{ color: 'rgba(235,195,43,.8)' }}>
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="tu@empresa.com"
                      required
                      autoFocus
                      autoComplete="email"
                      className="w-full px-4 py-3.5 rounded-xl font-body text-sm outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,.06)',
                        border: '1px solid rgba(255,255,255,.1)',
                        color: '#fff',
                        caretColor: '#ebc32b',
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'rgba(235,195,43,.55)'
                        e.target.style.background = 'rgba(235,195,43,.06)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(235,195,43,.1)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'rgba(255,255,255,.1)'
                        e.target.style.background = 'rgba(255,255,255,.06)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl font-body text-sm"
                      style={{ background: 'rgba(184,69,46,.12)', border: '1px solid rgba(184,69,46,.35)', color: '#e07050' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-px">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-body font-bold text-base py-4 rounded-full flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: '#ebc32b', color: '#05090f', boxShadow: '0 8px 28px rgba(235,195,43,.3)' }}
                    onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#f5d75a'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(235,195,43,.45)' } }}
                    onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = '#ebc32b'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 28px rgba(235,195,43,.3)' } }}
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full lp-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar link de recuperación
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                {/* Divider o */}
                <div className="flex items-center gap-3 my-5">
                  <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,.08)' }} />
                  <span className="font-body text-xs" style={{ color: 'rgba(255,255,255,.25)' }}>o</span>
                  <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,.08)' }} />
                </div>

                {/* Volver al login */}
                <Link
                  to="/login"
                  className="block w-full font-body font-semibold text-sm py-3.5 rounded-full text-center transition-all"
                  style={{ border: '1px solid rgba(255,255,255,.18)', color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(235,195,43,.5)'; e.currentTarget.style.color = '#ebc32b'; e.currentTarget.style.background = 'rgba(235,195,43,.06)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.18)'; e.currentTarget.style.color = 'rgba(255,255,255,.7)'; e.currentTarget.style.background = 'transparent' }}
                >
                  ← Volver al login
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="relative z-10 flex flex-col items-center gap-2 mt-6 lp-card" style={{ animationDelay: '.2s' }}>
          <p className="font-body text-xs" style={{ color: 'rgba(255,255,255,.22)' }}>
            Prohibida la participación de menores de 18 años. Juega con responsabilidad.
          </p>
        </div>

      </div>
    </>
  )
}