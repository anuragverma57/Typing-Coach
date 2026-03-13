import { type HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-[var(--color-border)] bg-surface-muted/50 p-6 shadow-sm ${className}`}
      {...props}
    />
  )
}
