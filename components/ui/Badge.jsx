import clsx from 'clsx'

export default function Badge({ children, variant = 'info', className }) {
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]',
    danger: 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.1)]',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]',
    info: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.1)]',
  }

  const dotColors = {
    success: 'bg-emerald-500',
    danger: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-indigo-500',
  }

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300',
      variants[variant],
      className
    )}>
      <span className={clsx('w-1.5 h-1.5 rounded-full animate-pulse', dotColors[variant])} />
      {children}
    </span>
  )
}
