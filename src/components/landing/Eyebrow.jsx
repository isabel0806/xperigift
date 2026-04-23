export function Eyebrow({ children, className = '', style }) {
  return (
    <div style={style} className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-ink-muted ${className}`}>
      <span className="h-px w-5 bg-hairline-strong" aria-hidden />
      {children}
    </div>
  );
}
