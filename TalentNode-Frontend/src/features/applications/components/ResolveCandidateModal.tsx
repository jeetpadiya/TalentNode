import { useState } from 'react';
import { useAuthStore } from '../../../app/store/AuthStore';
import { resolveApplication } from '../services/ApplicationServices';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessToken = useAuthStore((s) => s.accessToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      await resolveApplication({
        jobId,
        applicationId,
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined,
        sendEmail: status === 'rejected' ? sendEmail : undefined,
        accessToken,
      });
      onResolved();
    } catch (err: any) {
      setError(err.message || 'Failed to resolve candidate');
      setLoading(false);
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

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resolution Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option value="rejected">Reject</option>
              <option value="hired">Hire</option>
              <option value="withdrawn">Withdrawn (by candidate)</option>
            </select>
          </div>

          {status === 'rejected' && (
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason (Internal)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Not enough experience, failed technical round..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <label htmlFor="sendEmail" className="text-sm font-medium text-gray-700">
                  Send automated rejection email to candidate
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                status === 'hired' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? 'Saving...' : status === 'hired' ? 'Hire Candidate' : 'Reject Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResolveCandidateModal;
