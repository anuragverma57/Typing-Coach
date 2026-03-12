import type { Mistake } from '../types/session'

export type KeyStats = {
  key: string
  correct: number
  total: number
  accuracy: number
}

export type KeyboardRow = 'home' | 'top' | 'bottom' | 'number' | 'other'

const ROW_MAP: Record<string, KeyboardRow> = {
  '`': 'number', '1': 'number', '2': 'number', '3': 'number', '4': 'number',
  '5': 'number', '6': 'number', '7': 'number', '8': 'number', '9': 'number',
  '0': 'number', '-': 'number', '=': 'number',
  q: 'top', w: 'top', e: 'top', r: 'top', t: 'top', y: 'top', u: 'top',
  i: 'top', o: 'top', p: 'top', '[': 'top', ']': 'top', '\\': 'top',
  a: 'home', s: 'home', d: 'home', f: 'home', g: 'home', h: 'home',
  j: 'home', k: 'home', l: 'home', ';': 'home', "'": 'home',
  z: 'bottom', x: 'bottom', c: 'bottom', v: 'bottom', b: 'bottom',
  n: 'bottom', m: 'bottom', ',': 'bottom', '.': 'bottom', '/': 'bottom',
}

const ROW_KEYS: Record<KeyboardRow, string[]> = {
  home: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  top: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  bottom: ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  number: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  other: [],
}

const ROW_LABELS: Record<KeyboardRow, string> = {
  home: 'Home row',
  top: 'Top row',
  bottom: 'Bottom row',
  number: 'Number row',
  other: 'Other keys',
}

export function getKeyAccuracy(
  targetText: string,
  userInput: string
): Map<string, KeyStats> {
  const keyStats = new Map<string, KeyStats>()

  for (let i = 0; i < targetText.length; i++) {
    const expected = targetText[i].toLowerCase()
    const typed = i < userInput.length ? userInput[i].toLowerCase() : ''
    const isCorrect = expected === typed

    if (!keyStats.has(expected)) {
      keyStats.set(expected, { key: expected, correct: 0, total: 0, accuracy: 100 })
    }
    const stats = keyStats.get(expected)!
    stats.total++
    if (isCorrect) stats.correct++
  }

  for (const [, stats] of keyStats) {
    stats.accuracy =
      stats.total > 0
        ? Math.round((stats.correct / stats.total) * 1000) / 10
        : 100
  }

  return keyStats
}

export function getMistakesGroupedByCharacter(
  mistakes: Mistake[]
): Map<string, { expected: string; typed: string; count: number }[]> {
  const grouped = new Map<string, { expected: string; typed: string; count: number }[]>()

  for (const { expected, typed } of mistakes) {
    const key = expected
    const existing = grouped.get(key) ?? []
    const match = existing.find((e) => e.typed === typed)
    if (match) {
      match.count++
    } else {
      existing.push({ expected, typed, count: 1 })
    }
    grouped.set(key, existing)
  }

  return grouped
}

export function getSuggestions(
  keyStats: Map<string, KeyStats>
): string[] {
  const suggestions: string[] = []
  const rowErrors: Record<KeyboardRow, number> = {
    home: 0,
    top: 0,
    bottom: 0,
    number: 0,
    other: 0,
  }

  for (const [, stats] of keyStats) {
    if (stats.accuracy < 100 && stats.total > 0) {
      const row = ROW_MAP[stats.key] ?? 'other'
      const errors = stats.total - stats.correct
      rowErrors[row] += errors
    }
  }

  const rowsByErrors = (Object.entries(rowErrors) as [KeyboardRow, number][])
    .filter(([, errors]) => errors > 0)
    .sort(([, a], [, b]) => b - a)

  for (const [row] of rowsByErrors.slice(0, 2)) {
    const keys = ROW_KEYS[row]
    if (keys.length > 0) {
      suggestions.push(`Practice ${ROW_LABELS[row].toLowerCase()}: ${keys.join(', ')}`)
    }
  }

  const weakKeys = [...keyStats.values()]
    .filter((s) => s.accuracy < 90 && s.total >= 2)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)

  if (weakKeys.length > 0 && suggestions.length < 2) {
    suggestions.push(
      `Focus on these keys: ${weakKeys.map((k) => k.key).join(', ')}`
    )
  }

  return suggestions
}

export function getKeysForHeatmap(): string[][] {
  return [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  ]
}
