type CandidateResumeTabProps = {
  resumeUrl?: string | null
}

/** Transforms a Cloudinary URL to force inline display instead of download.
 *  Cloudinary serves raw uploads with Content-Disposition: attachment by default.
 *  Adding fl_attachment:false overrides that header so browsers render it inline. */
const toInlineUrl = (url: string): string => {
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/fl_attachment:false/')
  }
  return url
}

const CandidateResumeTab = ({ resumeUrl }: CandidateResumeTabProps) => {
  const inlineUrl = resumeUrl ? toInlineUrl(resumeUrl) : null
  return (
    <>
    <div className="flex h-[calc(100vh-16rem)] flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Resume Viewer</h3>
        {inlineUrl && (
          <div className="flex items-center gap-4">
            <a
              href="https://resume-analyzer-seven-gamma.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Want To Check Resume Score?
            </a>
            <a
              href={inlineUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-800"
            >
              Open in new tab
            </a>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-inner">
        {inlineUrl ? (
          <object
            data={inlineUrl}
            type="application/pdf"
            className="h-full w-full"
          >
            {/* Fallback for browsers that can't render PDF inline */}
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 mb-4">
                  Your browser can't preview PDFs inline.
                </p>
                <a
                  href={inlineUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-800"
                >
                  Download Resume
                </a>
              </div>
            </div>
          </object>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">No resume available</p>
              <p className="mt-1 text-sm text-gray-500">
                This candidate did not upload a resume.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default CandidateResumeTab
