import clsx from 'clsx'

export default function Badge({ children, variant = 'info', className }) {
  const variants = {
    success: 'badge-success',
    danger: 'badge-danger',
    warning: 'badge-warning',
    info: 'badge-info',
  }

  return (
    <span className={clsx('badge', variants[variant], className)}>
      {children}
    </span>
  )
}
