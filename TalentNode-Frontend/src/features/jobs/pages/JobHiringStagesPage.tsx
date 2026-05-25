import HiringStage from '../components/HiringStage'
import JobWorkspacePageFrame from './JobWorkspacePageFrame'

const JobHiringStagesPage = () => {
  return (
    <JobWorkspacePageFrame>
      {(job, setJob) => (
        <HiringStage
          job={job}
          onJobUpdated={(next) => setJob(next)}
        />
      )}
    </JobWorkspacePageFrame>
  )
}

export default JobHiringStagesPage
