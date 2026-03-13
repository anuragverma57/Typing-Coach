import type { CharacterStatus } from '../../types/session'

type CharacterDisplayProps = {
  char: string
  status: CharacterStatus
}

const statusStyles: Record<CharacterStatus, string> = {
  correct: 'text-correct',
  incorrect: 'text-incorrect bg-incorrect/10',
  current: 'text-current border-b-2 border-accent',
  pending: 'text-text-muted',
}

export function CharacterDisplay({ char, status }: CharacterDisplayProps) {
  const displayChar = char === ' ' ? '\u00A0' : char

  return (
    <span
      className={`font-mono ${statusStyles[status]}`}
      data-status={status}
    >
      {displayChar}
    </span>
  )
}
