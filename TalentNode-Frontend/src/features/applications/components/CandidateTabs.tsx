import type { IconType } from 'react-icons'
import { FaFileAlt, FaStickyNote, FaComments, FaRegCommentDots, FaRegStar } from 'react-icons/fa'

import CandidateNotesTab from './CandidateNotesTab'
import CandidateMessagesTab from './CandidateMessagesTab'
import CandidateResumeTab from './CandidateResumeTab'
import CandidateCommentsTab from './CandidateCommentsTab'
import CandidateReviewTab from './CandidateReviewTab'

export type CandidateDetailTab = 'notes' | 'messages' | 'resume' | 'comments' | 'review'

type CandidateTabsProps = {
  activeTab: CandidateDetailTab
  onTabChange: (tab: CandidateDetailTab) => void
  candidate: {
    jobId?: string
    applicationId?: string
    resume?: string
  }
}

const tabs: Array<{
  id: CandidateDetailTab
  label: string
  icon: IconType
}> = [
  { id: 'notes', label: 'Notes', icon: FaStickyNote },
  { id: 'messages', label: 'Messages', icon: FaComments },
  { id: 'resume', label: 'Resume', icon: FaFileAlt },
  { id: 'comments', label: 'Comments', icon: FaRegCommentDots },
  { id: 'review', label: 'Review', icon: FaRegStar },
]

const CandidateTabs = ({ activeTab, onTabChange, candidate }: CandidateTabsProps) => {
  return (
    <div className="p-6 pt-0">
      <div className="mt-8 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={[
                  'inline-flex items-center gap-2 rounded-t-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-b-2 border-gray-900 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5">
        {activeTab === 'notes' ? (
          <CandidateNotesTab
            jobId={candidate.jobId ?? candidate.applicationId ?? ''}
            applicationId={candidate.applicationId ?? ''}
          />
        ) : null}

        {activeTab === 'messages' ? (
          <CandidateMessagesTab
            jobId={candidate.jobId ?? candidate.applicationId ?? ''}
            applicationId={candidate.applicationId ?? ''}
          />
        ) : null}

        {activeTab === 'resume' ? (
          <CandidateResumeTab resumeUrl={candidate.resume} />
        ) : null}

        {activeTab === 'comments' ? (
          <CandidateCommentsTab applicationId={candidate.applicationId ?? ''} />
        ) : null}

        {activeTab === 'review' ? (
          <CandidateReviewTab
            jobId={candidate.jobId ?? candidate.applicationId ?? ''}
            applicationId={candidate.applicationId ?? ''}
          />
        ) : null}

      </div>
    </div>
  )
}

export default CandidateTabs

