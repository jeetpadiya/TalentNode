import type { JobCategory } from '../../settings/services/jobCategoriesService'

type JobDepartmentSelectProps = {
  categories: JobCategory[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const JobDepartmentSelect = ({
  categories,
  value,
  onChange,
  disabled,
}: JobDepartmentSelectProps) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="">Select department</option>
      {categories
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
    </select>
  )
}

export default JobDepartmentSelect

