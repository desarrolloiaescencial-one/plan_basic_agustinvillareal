import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import sheetsApi from '../services/sheetsApi.js'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  // Estados de validación del token
  const [validando, setValidando] = useState(true)
  const [tokenValido, setTokenValido] = useState(false)
  const [errorValidacion, setErrorValidacion] = useState(null)
  const [userInfo, setUserInfo] = useState(null)

  // Estado del formulario
  const [form, setForm]       = useState({ password: '', password2: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [done, setDone]       = useState(false)

  // Validar el token al montar la pantalla
  useEffect(() => {
    if (!token) {
      setErrorValidacion('El link no incluye un token de recuperación.')
      setValidando(false)
      return
    }

    sheetsApi.auth.resetValidar(token)
      .then(data => {
        setTokenValido(true)
        setUserInfo({ email: data.email, nombre: data.nombre })
      })
      .catch(err => {
        setErrorValidacion(err.message || 'No se pudo validar el link.')
      })
      .finally(() => {
        setValidando(false)
      })
  }, [token])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (form.password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.')
    }
    if (form.password !== form.password2) {
      return setError('Las contraseñas no coinciden.')
    }

    setLoading(true)
    try {
      await sheetsApi.auth.resetConfirmar(token, form.password)
      setDone(true)
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la contraseña.')
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
        {/* Glows */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{
          background: 'radial-gradient(ellipse 55% 45% at 20% 25%, rgba(235,195,43,.16), transparent 55%)'
        }} />
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{
          background: 'radial-gradient(ellipse 50% 45% at 80% 75%, rgba(66,91,139,.28), transparent 55%)'
        }} />

        {/* Logo */}
        <div className="relative z-10 flex flex-col items-center mb-6 lp-card">
          <img
            src="./imgprode/one-prode-talento-new3.png"
            alt="Prode Talento"
            style={{ height: 52, width: 'auto', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,.6))' }}
          />
        </div>

        {/* Card */}
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
          <div className="rounded-t-[20px] h-0.5 w-full"
            style={{ background: 'linear-gradient(90deg, transparent, #ebc32b 30%, #ebc32b 70%, transparent)' }} />

          <div className="px-8 py-8">

            {/* ── Estado 1: Validando token ───────── */}
            {validando && (
              <div className="text-center py-8">
                <span className="inline-block w-10 h-10 border-4 border-t-transparent rounded-full lp-spin mb-4"
                  style={{ borderColor: '#ebc32b', borderTopColor: 'transparent' }} />
                <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,.55)' }}>
                  Validando link de recuperación...
                </p>
              </div>
            )}

            {/* ── Estado 2: Token inválido o expirado ───────── */}
            {!validando && !tokenValido && (
              <div className="text-center py-2">
                <div
                  className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(184,69,46,.12)',
                    border: '2px solid rgba(184,69,46,.4)',
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e07050" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>

                <h2 className="font-display mb-3" style={{ fontSize: '1.8rem', color: '#fff', letterSpacing: '.03em' }}>
                  LINK NO VÁLIDO
                </h2>
                <p className="font-body text-sm mb-6 max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,.55)', lineHeight: 1.5 }}>
                  {errorValidacion}
                </p>

                <Link
                  to="/forgot-password"
                  className="inline-block font-body font-bold text-sm px-6 py-3 rounded-full transition-all"
                  style={{ background: '#ebc32b', color: '#05090f', boxShadow: '0 8px 28px rgba(235,195,43,.3)', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5d75a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#ebc32b'; e.currentTarget.style.transform = '' }}
                >
                  Pedir un link nuevo
                </Link>
              </div>
            )}

            {/* ── Estado 3: Token válido → formulario ───────── */}
            {!validando && tokenValido && !done && (
              <>
                <div className="mb-7">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 lp-pulse" />
                    <span className="font-body text-xs uppercase tracking-widest font-bold"
                      style={{ color: 'rgba(235,195,43,.7)' }}>
                      Nueva contraseña
                    </span>
                  </div>
                  <h1 className="font-display leading-none"
                    style={{ fontSize: '2.4rem', color: '#fff', letterSpacing: '.03em' }}>
                    ELEGÍ UNA<br />NUEVA
                  </h1>
                  {userInfo && (
                    <p className="font-body text-sm mt-2" style={{ color: 'rgba(255,255,255,.45)' }}>
                      Hola <span style={{ color: '#ebc32b', fontWeight: 600 }}>{userInfo.nombre}</span>, elegí una contraseña nueva para tu cuenta.
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px mb-6"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(235,195,43,.2) 50%, transparent)' }} />

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Nueva contraseña */}
                  <div>
                    <label htmlFor="password"
                      className="block font-body font-bold text-xs uppercase tracking-widest mb-2"
                      style={{ color: 'rgba(235,195,43,.8)' }}>
                      Nueva contraseña
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoFocus
                      autoComplete="new-password"
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
                    <p className="font-body text-xs mt-1.5" style={{ color: 'rgba(255,255,255,.3)' }}>
                      Mínimo 6 caracteres
                    </p>
                  </div>

                  {/* Repetir contraseña */}
                  <div>
                    <label htmlFor="password2"
                      className="block font-body font-bold text-xs uppercase tracking-widest mb-2"
                      style={{ color: 'rgba(235,195,43,.8)' }}>
                      Repetir contraseña
                    </label>
                    <input
                      id="password2"
                      type="password"
                      value={form.password2}
                      onChange={e => setForm(p => ({ ...p, password2: e.target.value }))}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoComplete="new-password"
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
                        Guardando...
                      </>
                    ) : (
                      <>
                        Guardar nueva contraseña
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ── Estado 4: Contraseña actualizada ───────── */}
            {done && (
              <div className="text-center py-2">
                <div
                  className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(235,195,43,.12)',
                    border: '2px solid rgba(235,195,43,.45)',
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ebc32b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <h2 className="font-display mb-3" style={{ fontSize: '1.8rem', color: '#fff', letterSpacing: '.03em' }}>
                  ¡CONTRASEÑA ACTUALIZADA!
                </h2>
                <p className="font-body text-sm mb-6 max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,.55)', lineHeight: 1.5 }}>
                  Tu contraseña se actualizó correctamente. Ya podés iniciar sesión con la nueva.
                </p>

                <Link
                  to="/login"
                  className="inline-block font-body font-bold text-sm px-6 py-3 rounded-full transition-all"
                  style={{ background: '#ebc32b', color: '#05090f', boxShadow: '0 8px 28px rgba(235,195,43,.3)', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5d75a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#ebc32b'; e.currentTarget.style.transform = '' }}
                >
                  Iniciar sesión
                </Link>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex flex-col items-center gap-2 mt-6 lp-card" style={{ animationDelay: '.2s' }}>
          <p className="font-body text-xs" style={{ color: 'rgba(255,255,255,.22)' }}>
            Prohibida la participación de menores de 18 años. Juega con responsabilidad.
          </p>
        </div>

      </div>
    </>
  )
}