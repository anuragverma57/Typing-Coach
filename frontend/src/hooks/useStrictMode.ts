import { useCallback, useState } from 'react'

const STORAGE_KEY = 'typing-coach-strict-mode'

function getStored(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'true'
  } catch {
    return false
  }
}

export function useStrictMode(): [boolean, (value: boolean) => void] {
  const [strictMode, setStrictModeState] = useState(() => getStored())

  const setStrictMode = useCallback((value: boolean) => {
    setStrictModeState(value)
    try {
      localStorage.setItem(STORAGE_KEY, String(value))
    } catch {
      // ignore
    }
  }, [])

  return [strictMode, setStrictMode]
}
