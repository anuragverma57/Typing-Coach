import { type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-muted focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface',
  secondary:
    'bg-surface-muted text-text-primary hover:bg-border dark:hover:bg-surface-muted focus:ring-2 focus:ring-text-muted focus:ring-offset-2 focus:ring-offset-surface',
  ghost:
    'text-text-secondary hover:bg-surface-muted hover:text-text-primary focus:ring-2 focus:ring-text-muted focus:ring-offset-2 focus:ring-offset-surface',
}

export function Button({
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    />
  )
}
