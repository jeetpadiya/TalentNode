/**
 * Lightweight, sleek fallback loader for lazy-loaded route transitions.
 */
export const PageLoader = () => {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center py-16">
      <div className="relative flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-600" />
      </div>
      <p className="mt-4 text-xs font-medium tracking-wide text-gray-400">Loading view...</p>
    </div>
  )
}

export default PageLoader
