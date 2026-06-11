import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--color-bg)] relative overflow-hidden">

      {/* Fondo decorativo: glows cyan sutiles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.1]"
          style={{ background: 'var(--color-accent)', filter: 'blur(120px)' }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.08]"
          style={{ background: 'var(--color-accent-bright)', filter: 'blur(120px)' }}
        />
      </div>

      <div className="relative text-center animate-fade-in max-w-md">

        {/* 404 gigante de fondo */}
        <p
          className="font-display text-[12rem] md:text-[16rem] leading-[0.85] select-none tracking-wider"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-bright) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            opacity: 0.15,
          }}
        >
          404
        </p>

        {/* Mensaje principal */}
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide leading-none mb-3 -mt-12 md:-mt-16">
          PÁGINA NO ENCONTRADA
        </h1>

        <p className="text-[var(--color-text-muted)] font-body text-base mb-8 max-w-sm mx-auto">
          La ruta que buscás no existe o fue movida. Volvé al inicio y seguimos desde ahí.
        </p>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            to="/"
            className="w-full sm:w-auto sm:min-w-[200px] text-center font-body font-bold px-7 py-3.5 rounded-lg text-sm transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-bright) 100%)',
              color: '#020F27',
              boxShadow: '0 6px 24px rgba(34,217,223,0.35)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,217,223,0.55)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(34,217,223,0.35)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Volver al inicio
          </Link>

          <Link
            to="/dashboard"
            className="w-full sm:w-auto sm:min-w-[200px] text-center font-body font-semibold px-7 py-3.5 rounded-lg text-sm transition-all"
            style={{
              background: 'transparent',
              border: '1px solid rgba(34,217,223,0.4)',
              color: 'var(--color-accent)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(34,217,223,0.08)'
              e.currentTarget.style.borderColor = 'rgba(34,217,223,0.6)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(34,217,223,0.4)'
            }}
          >
            Ir al dashboard
          </Link>
        </div>
      </div>

    </div>
  )
}
