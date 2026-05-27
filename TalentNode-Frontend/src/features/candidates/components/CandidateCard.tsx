import type { Candidate } from '../services/CandidateServices'
import { useNavigate, useParams } from 'react-router-dom'

interface Props {
    candidate: Candidate
    selectedJobId: string
}

export const CandidateCard = ({ candidate: c, selectedJobId }: Props) => {

    const navigate = useNavigate()
    const { organizationId } = useParams()

    const handleOpenApplication = () => {
        if (!organizationId || !selectedJobId) return

        const targetApplicationId = c.applicationId ?? c._id
        if (!targetApplicationId) return

        navigate({
            pathname: `/organizations/${organizationId}/applications/${targetApplicationId}`,
            search: `?job=${encodeURIComponent(selectedJobId)}`,
        })
    }


    return (

        <li>
            <button
                type="button"
                onClick={handleOpenApplication}
                className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:bg-gray-50 hover:shadow-md"
            >
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <p className="truncate font-semibold text-gray-900">{c.name}</p>
                        <p className="truncate text-sm text-gray-600">{c.email}</p>
                        {c.phone ? (
                            <p className="text-sm text-gray-500">{c.phone}</p>
                        ) : null}
                    </div>
                    {c.source ? (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800">
                            {c.source}
                        </span>
                    ) : null}
                </div>
            </button>
        </li>
        )
}
