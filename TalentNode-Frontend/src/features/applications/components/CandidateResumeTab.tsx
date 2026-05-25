type CandidateResumeTabProps = {
  resumeUrl?: string | null
}

const CandidateResumeTab = ({ resumeUrl }: CandidateResumeTabProps) => {
  return (
    <>
 
<div className=" flex flex-col  gap-2">

    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
      {resumeUrl ? (
        <a
          href={resumeUrl}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-gray-900 underline-offset-4 hover:underline"
          >
          Open candidate resume
        </a>
      ) : (
        <p className="text-sm text-gray-600">
          No resume link was added for this candidate.
        </p>
      )}

    </div>
      <a href="https://resume-analyzer-seven-gamma.vercel.app/" target="_blank">Want To Check Resume Score ?</a>

</div>
      
      </>
  )
}

export default CandidateResumeTab
