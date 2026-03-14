import { type InputHTMLAttributes, forwardRef } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full rounded-lg border border-[var(--color-border)] bg-surface px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${error ? 'border-incorrect' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-incorrect">{error}</p>
      )}
    </div>
  )
)

Input.displayName = 'Input'
