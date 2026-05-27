import { useEffect, useRef, useState } from 'react'
import { MdEmail } from 'react-icons/md'
import { FaPhoneAlt } from 'react-icons/fa'
import { SiOpensourcehardware } from 'react-icons/si'
import { BsThreeDots } from 'react-icons/bs'
import { FaEnvelope } from 'react-icons/fa'

import ThreeDotPopUp from './ThreeDotPopUp'

import type { Candidate } from '../../candidates/services/CandidateSchema'

type CandidateHeaderProps = {
  candidate: Candidate
  stageName?: string
  canRequestReview?: boolean
  canDelete?: boolean
  onEdit: () => void
  onDelete: () => void
  onRequestReview: () => void
  onResolve: () => void
}

const CandidateHeader = ({
  candidate,
  stageName,
  canRequestReview = false,
  canDelete = false,
  onEdit,
  onDelete,
  onRequestReview,
  onResolve,
}: CandidateHeaderProps) => {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)
  const actionMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setIsActionMenuOpen(false)
  }, [candidate._id])

  useEffect(() => {
    if (!isActionMenuOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!actionMenuRef.current?.contains(event.target as Node)) {
        setIsActionMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsActionMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActionMenuOpen])

  return (
    <div className="border-b border-gray-200 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-2xl font-bold text-gray-900">
              {candidate.name}
            </h2>
            {stageName ? (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                {stageName}
              </span>
            ) : null}

            <div ref={actionMenuRef} className="relative">
              <button
                type="button"
                aria-label="Open candidate actions"
                aria-haspopup="menu"
                aria-expanded={isActionMenuOpen}
                onClick={() => setIsActionMenuOpen((isOpen) => !isOpen)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <BsThreeDots className="h-5 w-5" aria-hidden />
              </button>

              {isActionMenuOpen ? (
                <div className="absolute right-0 top-11 z-20 rounded-md border border-gray-200 bg-white shadow-lg">
                  <ThreeDotPopUp
                    onFirstClick={onEdit}
                    onSecondClick={onDelete}
                    showSecondMenu={canDelete}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
            <span className="inline-flex min-w-0 items-center gap-2">
              <MdEmail className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">{candidate.email}</span>
            </span>

            {candidate.phone ? (
              <span className="inline-flex items-center gap-2">
                <FaPhoneAlt className="h-4 w-4 shrink-0" aria-hidden />
                {candidate.phone}
              </span>
            ) : null}

            {candidate.source ? (
              <span className="inline-flex items-center gap-2">
                <SiOpensourcehardware className="h-4 w-4 shrink-0" aria-hidden />
                {candidate.source}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onResolve}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Resolve
          </button>
          <button
            type="button"
            onClick={onRequestReview}
            disabled={!canRequestReview}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaEnvelope className="h-4 w-4" aria-hidden />
            Request review
          </button>
        </div>
      </div>
    </div>
  )
}

export default CandidateHeader
