import type { JobCategory } from '../../settings/services/jobCategoriesService'

export type JobDepartmentSelection = {
  categoryId: string
  categoryName: string
}

export const deriveDepartmentSelection = (
  categories: JobCategory[],
  jobDepartment?: string | null,
): JobDepartmentSelection => {
  if (!jobDepartment) {
    return { categoryId: '', categoryName: '' }
  }

  // Handle id|name format
  if (jobDepartment.includes('|')) {
    const parsed = parseDepartmentFromBackend(jobDepartment)
    const matched = categories.find(c => c._id === parsed.categoryId)
    if (matched) {
      return { categoryId: matched._id, categoryName: matched.name }
    }
  }

  // To support existing data, try to match by category name first.
  const matchedByName = categories.find((c) => c.name === jobDepartment)
  if (matchedByName) {
    return {
      categoryId: matchedByName._id,
      categoryName: matchedByName.name,
    }
  }

  // If user previously saved id as department, try match by id.
  const matchedById = categories.find((c) => c._id === jobDepartment)
  if (matchedById) {
    return { categoryId: matchedById._id, categoryName: matchedById.name }
  }

  return { categoryId: '', categoryName: jobDepartment }
}

export const serializeDepartmentForBackend = (
  selection: JobDepartmentSelection,
): string | undefined => {
  // Backend `JobsModel.department` is a string.
  // Store both id and name in a stable format so the UI can rehydrate.
  // Format: "{id}|{name}"
  if (!selection.categoryId || !selection.categoryName) return undefined
  return `${selection.categoryId}|${selection.categoryName}`
}

export const parseDepartmentFromBackend = (
  raw: string | null | undefined,
): JobDepartmentSelection => {
  if (!raw) return { categoryId: '', categoryName: '' }
  const [categoryId, ...rest] = raw.split('|')
  const categoryName = rest.join('|')
  return { categoryId: categoryId ?? '', categoryName }
}

