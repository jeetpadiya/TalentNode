import { useEffect } from 'react'

import { useDensity, type DensityKey } from './useDensity'



type Props = {
  densityKey: DensityKey
}

const STORAGE_KEY = 'talentnode:density'

const setDensityInStorage = (
  key: DensityKey,
  density: 'compact' | 'comfortable',
) => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
    parsed[key] = density
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
  } catch {
    // ignore
  }
}

export const DensityToggle = ({ densityKey }: Props) => {
  const [density, setDensity] = useDensity(densityKey)

  useEffect(() => {
    setDensityInStorage(densityKey, density)
  }, [density, densityKey])

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-600">Density</span>
      <div className="inline-flex rounded-md border border-gray-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setDensity('compact')}
          className={[
            'rounded-sm px-2 py-1 text-xs font-medium',
            density === 'compact'
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-50',
          ].join(' ')}
          aria-pressed={density === 'compact'}
        >
          Compact
        </button>
        <button
          type="button"
          onClick={() => setDensity('comfortable')}
          className={[
            'rounded-sm px-2 py-1 text-xs font-medium',
            density === 'comfortable'
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-50',
          ].join(' ')}
          aria-pressed={density === 'comfortable'}
        >
          Comfortable
        </button>
      </div>
    </div>
  )
}

export default DensityToggle


