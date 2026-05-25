import { useEffect, useMemo, useState } from 'react'

import { useAuthStore } from '../../../app/store/AuthStore'
import ThreeDotPopUp from '../../applications/components/ThreeDotPopUp'
import ActionsMenuDropdown from '../components/ActionsMenuDropdown'
import {
  jobCategoriesService,
  type JobCategory,
} from '../services/jobCategoriesService'

type Draft = {
  name: string
  order: number
}

const emptyDraft: Draft = { name: '', order: 0 }

type CategoryRowProps = {
  category: JobCategory
  isMenuOpen: boolean
  onOpenMenu: () => void
  onEdit: () => void
  onDelete: () => void
}


const CategoryRow = ({
  category,
  isMenuOpen,
  onOpenMenu,
  onEdit,
  onDelete,
}: CategoryRowProps) => {
  const menuId = `jobcat_menu_${category._id}`

  return (
    <div
      className="flex items-start justify-between gap-4 rounded-md border border-gray-200 p-4"
      aria-label={`Job category ${category.name}`}
    >
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-gray-900">
          {category.name}
        </h3>
        <p className="mt-1 text-xs text-gray-500">Order: {category.order}</p>
      </div>

      <ActionsMenuDropdown
        isOpen={isMenuOpen}
        menuId={menuId}
        ariaLabel={`Actions for ${category.name}`}
        onToggle={onOpenMenu}
      >
        <ThreeDotPopUp
          firstmenutext="Edit"
          secondmenutext="Delete"
          showThirdMenu={false}
          onFirstClick={onEdit}
          onSecondClick={onDelete}
        />
      </ActionsMenuDropdown>
    </div>
  )
}

const JobCategoryList = ({
  categories,
  isLoading,
  menuOpenForId,
  onToggleMenu,
  onEdit,
  onDelete,
}: {
  categories: JobCategory[]
  isLoading: boolean
  menuOpenForId: string | null
  onToggleMenu: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) => {

  if (isLoading) {
    return <div className="text-sm text-gray-600">Loading categories...</div>
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
        <p className="text-sm text-gray-600">No job categories found.</p>
      </div>
    )
  }

  return (
    <div className="mt-2 space-y-3">
          {categories.map((c) => (
        <CategoryRow
          key={c._id}
          category={c}
          isMenuOpen={menuOpenForId === c._id}
          onOpenMenu={() => onToggleMenu(c._id)}
          onEdit={() => onEdit(c._id)}
          onDelete={() => onDelete(c._id)}
        />
      ))}

    </div>
  )
}

const JobCategoriesPage = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)

  const organizationId = user?.organizationId

  const [categories, setCategories] = useState<JobCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [menuOpenForId, setMenuOpenForId] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const isNewDraft = useMemo(() => editingId?.startsWith('new_') ?? false, [
    editingId,
  ])

  useEffect(() => {
    if (!accessToken || !organizationId) return

    setIsLoading(true)
    void (async () => {
      try {
        const fetched = await jobCategoriesService.listJobCategories(
          accessToken,
          organizationId,
        )
        setCategories(fetched)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [accessToken, organizationId])

  const closeEdit = () => {
    setEditingId(null)
    setDraft(emptyDraft)
  }

  const openAdd = () => {
    setEditingId(`new_${Math.random().toString(16).slice(2)}`)
    setDraft({ name: '', order: categories.length })
    setMenuOpenForId(null)
  }

  const openEdit = (id: string) => {
    const c = categories.find((x) => x._id === id)
    if (!c) return
    setEditingId(id)
    setDraft({ name: c.name, order: c.order })
    setMenuOpenForId(null)
  }

  const openDelete = (id: string) => {
    setDeleteId(id)
    setMenuOpenForId(null)
  }

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    if (!accessToken || !organizationId || !editingId) return

    const trimmedName = draft.name.trim()
    if (!trimmedName) return

    const payload = {
      name: trimmedName,
      order: Number.isFinite(draft.order) ? draft.order : 0,
    }

    setIsSaving(true)
    void (async () => {
      try {
        if (isNewDraft) {
          const created = await jobCategoriesService.createJobCategory(
            accessToken,
            organizationId,
            payload,
          )
          setCategories((prev) => [created, ...prev])
        } else {
          const updated = await jobCategoriesService.updateJobCategory(
            accessToken,
            organizationId,
            editingId,
            payload,
          )
          setCategories((prev) =>
            prev.map((c) => (c._id === editingId ? updated : c)),
          )
        }
        closeEdit()
      } finally {
        setIsSaving(false)
      }
    })()
  }

  const confirmDelete = () => {
    if (!accessToken || !organizationId || !deleteId) return

    setIsSaving(true)
    void (async () => {
      try {
        await jobCategoriesService.deleteJobCategory(
          accessToken,
          organizationId,
          deleteId,
        )
        setCategories((prev) => prev.filter((c) => c._id !== deleteId))
        closeEdit()
        setDeleteId(null)
      } finally {
        setIsSaving(false)
      }
    })()
  }

  const toggleMenu = (id: string) => {
    setMenuOpenForId((curr) => (curr === id ? null : id))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
        <p className="max-w-2xl text-gray-600">
          Edit or delete your job categories. Each organization has its own
          list.
        </p>
  

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
            <p className="text-sm text-gray-600">
              Use the ⋮ menu to edit or delete.
            </p>
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            disabled={!accessToken || !organizationId || isLoading}
          >
            Add category
          </button>
        </div>

        <JobCategoryList
          categories={categories}
          isLoading={isLoading}
          menuOpenForId={menuOpenForId}
          onToggleMenu={toggleMenu}
          onEdit={(id) => openEdit(id)}
          onDelete={(id) => openDelete(id)}
        />

      </section>

      {/* Add/Edit modal */}
      {editingId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isNewDraft ? 'Add category' : 'Edit category'}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Name and order determine how categories are shown.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close"
                disabled={isSaving}
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category name
                </label>
                <input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                  placeholder="e.g., Software Development"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Order
                </label>
                <input
                  type="number"
                  value={draft.order}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      order: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                disabled={
                  isSaving || !draft.name.trim() || !accessToken || !organizationId
                }
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete confirmation modal */}
      {deleteId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">Delete?</h3>
            <p className="mt-2 text-sm text-gray-600">
              This action can’t be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                disabled={!accessToken || isSaving}
              >
                {isSaving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default JobCategoriesPage

