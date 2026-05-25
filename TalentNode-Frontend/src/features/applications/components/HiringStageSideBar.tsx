import type { ApplicationStage } from '../services/ApplicationServices'

type HiringStageSideBarProps = {
  stages: ApplicationStage[]
  activeStageId: string
  totalCandidates: number
  onStageSelect: (stageId: string) => void
}

const HiringStageSideBar = ({
  stages,
  activeStageId,
  totalCandidates,
  onStageSelect,
}: HiringStageSideBarProps) => {
  return (
    <aside className="w-80 shrink-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Hiring stages
        </h2>

        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 tabular-nums">
          {stages.length} stages
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {stages.map((stage) => {
          const isActive = stage.id === activeStageId

          return (
            <li key={stage.id}>
              <button
                type="button"
                onClick={() => onStageSelect(stage.id)}
                className={[
                  'w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                  isActive
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">
                    {stage.name}
                  </span>

                  <span
                    className={[
                      'rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'bg-gray-100 text-gray-700',
                    ].join(' ')}
                  >
                    {stage.candidates?.length ?? 0}
                  </span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
        Total candidates:{' '}
        <span className="font-semibold text-gray-900">
          {totalCandidates}
        </span>
      </div>
    </aside>
  )
}

export default HiringStageSideBar
