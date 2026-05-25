import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/AuthStore'
import type { Job } from '../services/JobSchema'
import {
  getHiringStages,
  saveHiringPipeline,
  type HiringStage as HiringStageItem,
} from '../services/HiringStageServices'

type HiringStageProps = {
  job: Job
  onJobUpdated: (job: Job) => void
}

type DraftStage = {
  clientKey: string
  serverId?: string
  name: string
}

const normalizeFromJob = (job: Job): DraftStage[] => {
  const raw = job.hiringStages
  const list = [...(Array.isArray(raw) ? raw : [])].sort(
    (a, b) => a.order - b.order,
  )
  return list.map((s) => ({
    clientKey: s.id,
    serverId: s.id,
    name: s.name,
  }))
}
const toDraftStages = (stages: HiringStageItem[]) =>
  [...stages]
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      clientKey: s.id,
      serverId: s.id,
      name: s.name,
    }))

const HiringStage = ({ job, onJobUpdated }: HiringStageProps) => {
  const { jobId } = useParams()
  const accessToken = useAuthStore((state) => state.accessToken)

  const [draftStages, setDraftStages] = useState<DraftStage[]>(() =>
    normalizeFromJob(job),
  )
  const [serverStages, setServerStages] = useState<HiringStageItem[]>(() =>
    Array.isArray(job.hiringStages) ? job.hiringStages : [],
  )
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingStages, setIsLoadingStages] = useState(false)

  const fingerprint = useMemo(
    () =>
      (Array.isArray(job.hiringStages) ? job.hiringStages : [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((s) => `${s.id}:${s.name}:${s.order}`)
        .join('|'),
    [job.hiringStages],
  )

  useEffect(() => {
    setDraftStages(normalizeFromJob(job))
    setServerStages(Array.isArray(job.hiringStages) ? job.hiringStages : [])
  }, [job.id, fingerprint])

  useEffect(() => {
    let isMounted = true

    const loadStages = async () => {
      if (!jobId || !accessToken) return
      setIsLoadingStages(true)
      try {
        const response = await getHiringStages(jobId, accessToken)
        if (!isMounted) return
        setServerStages(response)
        setDraftStages(toDraftStages(response))
        setError(null)
      } catch (e) {
        if (!isMounted) return
        const message =
          typeof e === 'object' && e !== null && 'message' in e
            ? String((e as { message?: unknown }).message)
            : 'Could not load hiring stages.'
        setError(message)
      } finally {
        if (isMounted) setIsLoadingStages(false)
      }
    }

    void loadStages()

    return () => {
      isMounted = false
    }
  }, [jobId, accessToken])

  const setName = useCallback((clientKey: string, name: string) => {
    setDraftStages((prev) =>
      prev.map((row) =>
        row.clientKey === clientKey ? { ...row, name } : row,
      ),
    )
  }, [])

  const removeRow = useCallback((clientKey: string) => {
    setDraftStages((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((row) => row.clientKey !== clientKey)
    })
  }, [])

  const moveRow = useCallback((index: number, dir: -1 | 1) => {
    setDraftStages((prev) => {
      const next = index + dir
      if (next < 0 || next >= prev.length) return prev
      const copy = [...prev]
      const tmp = copy[index]!
      copy[index] = copy[next]!
      copy[next] = tmp
      return copy
    })
  }, [])

  const addStage = useCallback(() => {
    const clientKey =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `new-${Date.now()}`
    setDraftStages((prev) => [
      ...prev,
      { clientKey, name: 'New stage' },
    ])
  }, [])

 const handleSave = async () => {
  if (!jobId || !accessToken) return;

  try {
    setIsSaving(true);

    const payload = draftStages.map((stage, index) => ({
      id: stage.serverId,
      name: stage.name.trim(),
      order: index,
    }));

    const stages = await saveHiringPipeline(
      jobId,
      payload,
      accessToken,
    );

    setServerStages(stages);
    setDraftStages(toDraftStages(stages));
    onJobUpdated({
      ...job,
      hiringStages: stages,
    });

  } catch (error) {
    console.error(error);
  } finally {
    setIsSaving(false);
  }
};

  const initialPayload = useMemo(
    () =>
      JSON.stringify(
        toDraftStages(serverStages).map((row, index) => ({
          ...(row.serverId ? { id: row.serverId } : {}),
          name: row.name.trim(),
          order: index,
        })),
      ),
    [serverStages],
  )
  const dirty =
    JSON.stringify(
      draftStages.map((row, index) => ({
        ...(row.serverId ? { id: row.serverId } : {}),
        name: row.name.trim(),
        order: index,
      })),
    ) !== initialPayload

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Hiring stages</h2>
          <p className="mt-1 text-sm text-gray-600">
            Define the pipeline for {job.title}. Candidates will move through
            these stages in order.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addStage}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Add stage
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || !dirty}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : 'Save pipeline'}
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {isLoadingStages ? (
        <p className="mt-4 text-sm text-gray-600">Loading hiring stages...</p>
      ) : null}

      {draftStages.length === 0 ? (
        <p className="mt-6 rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
          No stages yet. Click &quot;Add stage&quot; to create your pipeline,
          then save.
        </p>
      ) : (
        <div className="mt-6 grid gap-3">
          {draftStages.map((stage, index) => (
            <div
              key={stage.clientKey}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/40 px-3 py-3 sm:flex-nowrap"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <input
                type="text"
                value={stage.name}
                onChange={(ev) =>
                  setName(stage.clientKey, ev.target.value)
                }
                className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                placeholder="Stage name"
                aria-label={`Stage ${index + 1} name`}
              />
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => moveRow(index, -1)}
                  disabled={index === 0}
                  className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Move stage up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveRow(index, 1)}
                  disabled={index === draftStages.length - 1}
                  className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Move stage down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeRow(stage.clientKey)}
                  disabled={draftStages.length <= 1}
                  className="rounded-md border border-red-100 bg-white px-2 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Remove stage"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default HiringStage
