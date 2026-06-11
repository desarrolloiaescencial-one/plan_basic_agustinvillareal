export default function Card({ children, className = '', glow = false, ...props }) {
  return (
    <div
      className={`
        bg-[var(--color-surface)] border border-[var(--color-border)]
        rounded-[var(--radius-lg)] p-5 transition-all duration-[var(--transition-base)]
        ${glow ? 'shadow-[var(--shadow-glow)] border-[var(--color-accent)]' : 'shadow-[var(--shadow-md)]'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
