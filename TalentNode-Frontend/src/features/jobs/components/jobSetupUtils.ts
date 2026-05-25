export const splitList = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

export const joinList = (value: string[]) => value.join('\n')

export type JobWorkspaceSection =
  | 'setup'
  | 'application_form'
  | 'hiring_stage'
  | 'hiring_team'

export const jobWorkspaceSections: Array<{
  id: JobWorkspaceSection
  label: string
  path: string
}> = [
  { id: 'setup', label: 'Job setup', path: 'setup' },
  { id: 'application_form', label: 'Application form', path: 'application-form' },
  { id: 'hiring_stage', label: 'Hiring stages', path: 'hiring-stages' },
  { id: 'hiring_team', label: 'Hiring team', path: 'hiring-team' },
]
