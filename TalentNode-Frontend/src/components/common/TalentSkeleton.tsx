type SkeletonProps = {

  className?: string
}

export const TalentSkeleton = ({ className }: SkeletonProps) => {
  return (
    <div
      className={[
        'animate-pulse rounded-md bg-gray-200',
        className ?? '',
      ].join(' ')}
      aria-hidden="true"
    />
  )
}

export const TalentSkeletonLine = ({ className }: SkeletonProps) => {
  return (
    <div
      className={[
        'h-4 animate-pulse rounded bg-gray-200',
        className ?? '',
      ].join(' ')}
      aria-hidden="true"
    />
  )
}

export const TalentSkeletonCard = ({ className }: SkeletonProps) => {
  return (
    <div
      className={[
        'animate-pulse rounded-xl bg-white p-4 shadow-sm',
        className ?? '',
      ].join(' ')}
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-5 w-64 rounded bg-gray-200" />
          <div className="h-4 w-96 rounded bg-gray-200" />
        </div>
        <div className="h-6 w-20 rounded-full bg-gray-200" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="h-5 w-24 rounded bg-gray-200" />
        <div className="h-5 w-20 rounded bg-gray-200" />
        <div className="h-5 w-28 rounded bg-gray-200" />
      </div>
    </div>
  )
}


