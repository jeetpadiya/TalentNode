

type CandidateMoveControlsProps = {
  stageName?: string
  stages: Array<{ id: string; name: string }>
  currentStageId?: string
  moveTargetStageId: string
  isMoving?: boolean
  moveError?: string | null
  onMoveTargetStageChange: (stageId: string) => void
  onMoveCandidate: () => void
}

const CandidateMoveControls = ({
  stages,
  currentStageId,
  moveTargetStageId,
  isMoving = false,
  moveError,
  onMoveTargetStageChange,
  onMoveCandidate,
}: CandidateMoveControlsProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="py-2">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <select
            value={moveTargetStageId}
            onChange={(event) => onMoveTargetStageChange(event.target.value)}
            className="h-10 w-56 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 outline-none hover:bg-gray-50 focus:border-gray-900 disabled:opacity-50"
            disabled={isMoving || stages.length <= 1}
            aria-label="Move candidate to stage"
          >
            <option value="">Move to stage...</option>
            {stages
              .filter((stage) => stage.id !== currentStageId)
              .map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
          </select>

          <button
            type="button"
            onClick={onMoveCandidate}
            disabled={!moveTargetStageId || isMoving}
            className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-6 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isMoving ? 'Moving...' : 'Move'}
          </button>
        </div>
      </div>

      {moveError ? (
        <p className="mt-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {moveError}
        </p>
      ) : null}
    </div>
  )
}

export default CandidateMoveControls

