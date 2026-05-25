import { HiringTeam } from '../components/HiringTeam'
import JobWorkspacePageFrame from './JobWorkspacePageFrame'

const JobHiringTeamPage = () => {
  return (
    <JobWorkspacePageFrame>
      {(job) => <HiringTeam job={job} />}
    </JobWorkspacePageFrame>
  )
}

export default JobHiringTeamPage
