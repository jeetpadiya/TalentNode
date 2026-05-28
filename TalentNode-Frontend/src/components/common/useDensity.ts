import { useEffect, useState } from 'react'

export type DensityKey = 'jobs' | 'candidates'

const STORAGE_KEY = 'talentnode:density'

const getStoredDensity = (key: DensityKey): 'compact' | 'comfortable' => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return 'comfortable'
    const parsed = JSON.parse(raw) as Partial<Record<DensityKey, 'compact' | 'comfortable'>>
    return parsed[key] ?? 'comfortable'
  } catch {
    return 'comfortable'
  }
}

export const useDensity = (key: DensityKey) => {
  const [density, setDensity] = useState<'compact' | 'comfortable'>(() => {
    if (typeof window === 'undefined') return 'comfortable'
    return getStoredDensity(key)
  })

  useEffect(() => {
    const handler = () => setDensity(getStoredDensity(key))
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [key])

  return [density, setDensity] as const
}

