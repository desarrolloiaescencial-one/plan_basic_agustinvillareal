export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] font-body">
          {label}
        </label>
      )}
      <input
        className={`
          w-full bg-[var(--color-bg-2)] border border-[var(--color-border)]
          text-[var(--color-text)] placeholder:text-[var(--color-text-faint)]
          rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-body
          outline-none transition-all duration-[var(--transition-fast)]
          focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)]
          ${error ? 'border-[var(--color-danger)]' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-[var(--color-danger)] font-body">{error}</p>}
    </div>
  )
}
