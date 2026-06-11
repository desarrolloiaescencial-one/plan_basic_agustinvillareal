/**
 * useToast.jsx — Sistema global de notificaciones (toasts) + diálogos de confirmación
 * Ubicación: src/hooks/useToast.jsx
 *
 * EXPORTS:
 *   - <ToastProvider>                ← envolver la app
 *   - useToast()  → { toast }        ← notificaciones arriba-derecha
 *   - useConfirm() → confirm(opts)   ← diálogo modal de confirmación
 *
 * USO (notificaciones):
 *   const { toast } = useToast()
 *   toast.success('Apuesta creada')
 *   toast.error('Algo salió mal')
 *   toast.info('Revisá tu email')
 *
 * USO (confirmación — devuelve Promise<boolean>):
 *   const confirm = useConfirm()
 *   const ok = await confirm({
 *     titulo: '¿Cerrar sesión?',
 *     mensaje: 'Se cerrará tu sesión actual.',
 *     confirmarTxt: 'Sí, salir',
 *     cancelarTxt: 'Cancelar',
 *     tipo: 'danger', // 'danger' | 'warning' | 'info'
 *   })
 *   if (ok) { ... }
 */
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const ToastContext   = createContext(null)
const ConfirmContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ToastProvider>')
  return ctx
}

/* ═══════════════════════════════════════════════════════════
   TOAST — notificación individual
   ═══════════════════════════════════════════════════════════ */
function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const duration = toast.duration || 3500
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [toast, onClose])

  const STYLES = {
    success: {
      bg: 'linear-gradient(135deg, #0c182b 0%, #0f2145 100%)',
      border: 'rgba(34, 217, 223, 0.4)',
      color: '#22d9df',
      iconBg: 'rgba(34, 217, 223, 0.15)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    error: {
      bg: 'linear-gradient(135deg, #0c182b 0%, #1f0f15 100%)',
      border: 'rgba(255, 77, 109, 0.4)',
      color: '#ff4d6d',
      iconBg: 'rgba(255, 77, 109, 0.15)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    info: {
      bg: 'linear-gradient(135deg, #0c182b 0%, #0f2145 100%)',
      border: 'rgba(235, 195, 43, 0.4)',
      color: '#ebc32b',
      iconBg: 'rgba(235, 195, 43, 0.15)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
    },
    loading: {
      bg: 'linear-gradient(135deg, #0c182b 0%, #0f2145 100%)',
      border: 'rgba(132, 153, 194, 0.4)',
      color: '#8499c2',
      iconBg: 'rgba(132, 153, 194, 0.15)',
      icon: (
        <span style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'tc-spin .8s linear infinite', display: 'inline-block' }} />
      ),
    },
  }

  const s = STYLES[toast.type] || STYLES.info

  return (
    <div style={{
      minWidth: 280, maxWidth: 420,
      padding: '.85rem 1rem', borderRadius: 12,
      background: s.bg, border: `1px solid ${s.border}`,
      boxShadow: '0 10px 40px rgba(0,0,0,.45), 0 0 24px rgba(34,217,223,.08)',
      display: 'flex', alignItems: 'flex-start', gap: '.7rem',
      fontFamily: "'DM Sans', sans-serif",
      animation: 'tc-toast-in .3s ease both',
      pointerEvents: 'auto',
    }}>
      <div style={{
        flexShrink: 0, width: 32, height: 32, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: s.iconBg, color: s.color,
      }}>
        {s.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <p style={{ margin: 0, fontSize: '.88rem', fontWeight: 600, color: '#fff', lineHeight: 1.4, wordBreak: 'break-word' }}>
          {toast.message}
        </p>
      </div>
      {toast.type !== 'loading' && (
        <button onClick={onClose} aria-label="Cerrar" style={{
          flexShrink: 0, background: 'transparent', border: 'none',
          color: 'rgba(255,255,255,.35)', cursor: 'pointer', padding: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'color .15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.35)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   CONFIRM DIALOG
   ═══════════════════════════════════════════════════════════ */
function ConfirmDialog({ opts, onResolve }) {
  const TYPE = {
    danger: {
      iconBg: 'rgba(255, 77, 109, 0.15)',
      iconColor: '#ff4d6d',
      btnBg: 'linear-gradient(135deg, #ff4d6d 0%, #d43854 100%)',
      btnColor: '#fff',
      btnShadow: '0 6px 24px rgba(255,77,109,.35)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    warning: {
      iconBg: 'rgba(235, 195, 43, 0.15)',
      iconColor: '#ebc32b',
      btnBg: 'linear-gradient(135deg, #ebc32b 0%, #c99f16 100%)',
      btnColor: '#05090f',
      btnShadow: '0 6px 24px rgba(235,195,43,.35)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    info: {
      iconBg: 'rgba(34, 217, 223, 0.15)',
      iconColor: '#22d9df',
      btnBg: 'linear-gradient(135deg, #22d9df 0%, #7af5f8 100%)',
      btnColor: '#020F27',
      btnShadow: '0 6px 24px rgba(34,217,223,.35)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
    },
  }
  const t = TYPE[opts.tipo] || TYPE.danger

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onResolve(false)
      if (e.key === 'Enter') onResolve(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onResolve])

  return (
    <div
      onClick={() => onResolve(false)}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, top: 0, left: 0, right: 0, bottom: 0,
        width: '100vw', height: '100vh',
        background: 'rgba(2,15,39,0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 999998,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'tc-fade .2s ease both',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 440,
          background: 'linear-gradient(145deg, rgba(15,43,79,0.98) 0%, rgba(15,33,69,0.98) 100%)',
          border: '1px solid rgba(34,217,223,0.15)',
          borderRadius: 16,
          boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
          padding: '1.5rem',
          fontFamily: "'DM Sans', sans-serif",
          animation: 'tc-scale .25s ease both',
        }}
      >
        {/* Icono */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: t.iconBg, color: t.iconColor,
          margin: '0 auto 1rem',
          border: `1px solid ${t.iconColor}40`,
        }}>
          {t.icon}
        </div>

        {/* Título */}
        <h3 style={{
          margin: 0, textAlign: 'center',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.6rem', letterSpacing: '.02em',
          color: '#fff', lineHeight: 1.1,
        }}>
          {opts.titulo || '¿Estás seguro?'}
        </h3>

        {/* Mensaje */}
        {opts.mensaje && (
          <p style={{
            margin: '.5rem 0 1.5rem', textAlign: 'center',
            fontSize: '.9rem', color: '#8499c2',
            lineHeight: 1.5,
          }}>
            {opts.mensaje}
          </p>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'stretch' }}>
          <button
            type="button"
            onClick={() => onResolve(false)}
            style={{
              flex: 1, padding: '.75rem',
              borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600, fontSize: 14,
              background: 'transparent',
              border: '1px solid rgba(132,153,194,0.2)',
              color: '#8499c2',
              cursor: 'pointer', transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(132,153,194,0.2)'; e.currentTarget.style.color = '#8499c2' }}
          >
            {opts.cancelarTxt || 'Cancelar'}
          </button>

          <button
            type="button"
            autoFocus
            onClick={() => onResolve(true)}
            style={{
              flex: 1, padding: '.75rem',
              borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700, fontSize: 14,
              background: t.btnBg,
              color: t.btnColor,
              border: 'none',
              cursor: 'pointer',
              boxShadow: t.btnShadow,
              transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = '' }}
          >
            {opts.confirmarTxt || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PROVIDER ÚNICO (Toasts + Confirm)
   ═══════════════════════════════════════════════════════════ */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null) // { opts, resolve }
  const resolverRef = useRef(null)

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const show = useCallback((message, type = 'info', duration) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, duration }])
    return id
  }, [])

  const dismiss = useCallback((id) => { remove(id) }, [remove])

  const toast = {
    success: (msg, duration) => show(msg, 'success', duration),
    error:   (msg, duration) => show(msg, 'error',   duration),
    info:    (msg, duration) => show(msg, 'info',    duration),
    loading: (msg)           => show(msg, 'loading', 10000),
    dismiss,
  }

  // Confirm: devuelve Promise<boolean>
  const confirm = useCallback((opts = {}) => {
    return new Promise(resolve => {
      resolverRef.current = resolve
      setConfirmState({ opts })
    })
  }, [])

  const handleConfirmResolve = useCallback((value) => {
    if (resolverRef.current) {
      resolverRef.current(value)
      resolverRef.current = null
    }
    setConfirmState(null)
  }, [])

  const styles = (
    <style>{`
      @keyframes tc-toast-in { from { opacity: 0; transform: translateX(24px) } to { opacity: 1; transform: translateX(0) } }
      @keyframes tc-fade     { from { opacity: 0 } to { opacity: 1 } }
      @keyframes tc-scale    { from { opacity: 0; transform: translateY(12px) scale(.96) } to { opacity: 1; transform: translateY(0) scale(1) } }
      @keyframes tc-spin     { to { transform: rotate(360deg) } }
    `}</style>
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      <ConfirmContext.Provider value={confirm}>
        {children}
        {typeof document !== 'undefined' && createPortal(
          <>
            {styles}
            {/* Contenedor de toasts */}
            <div style={{
              position: 'fixed',
              top: '1.2rem', right: '1.2rem',
              zIndex: 999999,
              display: 'flex', flexDirection: 'column', gap: '.6rem',
              pointerEvents: 'none',
              maxWidth: 'calc(100vw - 2.4rem)',
            }}>
              {toasts.map(t => (
                <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
              ))}
            </div>

            {/* Confirm dialog */}
            {confirmState && (
              <ConfirmDialog opts={confirmState.opts} onResolve={handleConfirmResolve} />
            )}
          </>,
          document.body
        )}
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  )
}
