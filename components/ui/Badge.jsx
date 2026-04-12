import clsx from 'clsx'

export default function Badge({ children, variant = 'info', className }) {
  const variants = {
    success: 'bg-green-100 text-emerald-500',
    danger: 'bg-red-100 text-red-500',
    warning: 'bg-yellow-100 text-amber-500',
    info: 'bg-blue-100 text-blue-600',
  }

  return (
    <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', variants[variant], className)}>
      {children}
    </span>
  )
}
