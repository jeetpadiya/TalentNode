import ApplicationForm from '../components/ApplicationForm'
import JobWorkspacePageFrame from './JobWorkspacePageFrame'

const JobApplicationFormPage = () => {
  return (
    <JobWorkspacePageFrame>
      {(job) => <ApplicationForm job={job} />}
    </JobWorkspacePageFrame>
  )
}

export default JobApplicationFormPage
