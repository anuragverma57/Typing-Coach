export function calculateWPM(correctChars: number, durationSec: number): number {
  if (durationSec <= 0) return 0
  const minutes = durationSec / 60
  const words = correctChars / 5
  return Math.round((words / minutes) * 10) / 10
}

export function calculateAccuracy(
  correctChars: number,
  totalChars: number
): number {
  if (totalChars <= 0) return 100
  return Math.round((correctChars / totalChars) * 1000) / 10
}
