const variants = {
  accent:  'bg-[var(--color-accent-glow)] text-[var(--color-accent)]',
  warn:    'bg-[var(--color-warn-dim)] text-[var(--color-warn)]',
  danger:  'bg-[var(--color-danger-dim)] text-[var(--color-danger)]',
  muted:   'bg-[var(--color-surface)] text-[var(--color-text-muted)]',
}

export default function Badge({ children, variant = 'muted', className = '' }) {
  return (
    <span className={`
      inline-flex items-center gap-1 px-2.5 py-0.5
      text-xs font-semibold uppercase tracking-wider
      rounded-full font-body ${variants[variant]} ${className}
    `}>
      {children}
    </span>
  )
}
