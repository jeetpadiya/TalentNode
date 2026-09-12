import { useState } from 'react';
import { useResolveApplicationMutation } from '../../../hooks/useTalentQueries';

type ResolveCandidateModalProps = {
  jobId: string;
  applicationId: string;
  candidateName: string;
  onClose: () => void;
  onResolved: () => void;
};

const ResolveCandidateModal = ({
  jobId,
  applicationId,
  candidateName,
  onClose,
  onResolved,
}: ResolveCandidateModalProps) => {
  const [status, setStatus] = useState<'hired' | 'rejected' | 'withdrawn'>('rejected');
  const [rejectionReason, setRejectionReason] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveMutation = useResolveApplicationMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await resolveMutation.mutateAsync({
        jobId,
        applicationId,
        input: {
          status,
          rejectionReason: status === 'rejected' ? rejectionReason : undefined,
          sendEmail: status === 'rejected' ? sendEmail : undefined,
        },
      });
      onResolved();
    } catch (err: any) {
      setError(err?.message || 'Failed to resolve candidate');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Resolve Candidate</h2>
        <p className="text-sm text-gray-500 mb-6">
          Set the final resolution status for {candidateName}.
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resolution Outcome
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
              <option value="withdrawn">Withdrawn by Candidate</option>
            </select>
          </div>

          {status === 'rejected' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason (Internal Note)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Lacks required system design experience..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="sendEmail" className="text-sm text-gray-700 select-none">
                  Send standard rejection notification email to candidate
                </label>
              </div>
            </>
          )}

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={resolveMutation.isPending}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resolveMutation.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {resolveMutation.isPending ? 'Resolving...' : 'Confirm Resolution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResolveCandidateModal;
