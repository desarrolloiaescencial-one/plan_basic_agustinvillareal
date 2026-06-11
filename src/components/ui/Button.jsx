/* ── Button ─────────────────────────────────────────────────
   Variantes: primary | secondary | danger | ghost
   Tamaños:   sm | md | lg
   ─────────────────────────────────────────────────────────── */

const variants = {
  primary:   'bg-[var(--gold-500)] text-[var(--ink-900)] hover:bg-[var(--gold-300)] font-bold',
  accent:    'bg-[var(--color-accent)] text-[var(--ink-900)] hover:bg-[var(--color-accent-dim)] font-semibold',
  secondary: 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
  danger:    'bg-[var(--color-danger-dim)] text-[var(--color-danger)] border border-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white',
  ghost:     'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-[var(--radius-sm)]',
  md: 'px-5 py-2.5 text-sm rounded-[var(--radius-md)]',
  lg: 'px-7 py-3.5 text-base rounded-[var(--radius-md)]',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-2 font-body font-medium
        transition-all duration-[var(--transition-fast)] cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
