import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAuthStore } from '../../../app/store/AuthStore'
import ThreeDotPopUp from '../../applications/components/ThreeDotPopUp'
import ActionsMenuDropdown from '../components/ActionsMenuDropdown'
import {
  messageTemplatesService,
  type MessageTemplate,
} from '../services/messageTemplatesService'

type Draft = {
  title: string
  subject: string
  body: string
}

const emptyDraft: Draft = {
  title: '',
  subject: '',
  body: '',
}

const MessageTemplaePage = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)

  const { organizationId: orgIdFromRoute } = useParams()
  const organizationId =
    (orgIdFromRoute as string | undefined) ?? user?.organizationId

  const [templates, setTemplates] = useState<MessageTemplate[]>([])

  const [menuOpenForId, setMenuOpenForId] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const isNewTemplateDraft = editingId?.startsWith('new_') ?? false

  const editingTemplate = useMemo(() => {
    if (!editingId) return null
    if (isNewTemplateDraft) return null
    return templates.find((t) => t._id === editingId) ?? null
  }, [editingId, isNewTemplateDraft, templates])

  const closeEdit = () => {
    setEditingId(null)
    setDraft(emptyDraft)
  }

  useEffect(() => {
    if (!accessToken || !organizationId) return

    setIsLoading(true)
    void (async () => {
      try {
        const fetched = await messageTemplatesService.listMessageTemplates(
          accessToken,
          organizationId,
        )
        setTemplates(fetched)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [accessToken, organizationId])

  const openEdit = (id: string) => {
    const t = templates.find((x) => x._id === id)
    if (!t) return

    setEditingId(id)
    setDraft({ title: t.title, subject: t.subject, body: t.body })
    setMenuOpenForId(null)
  }

  const openDelete = (id: string) => {
    setDeleteId(id)
    setMenuOpenForId(null)
  }

  const closeDelete = () => setDeleteId(null)

  const handleAddTemplate = () => {
    setEditingId(`new_${Math.random().toString(16).slice(2)}`)
    setDraft({
      title: 'New template',
      subject: 'Subject',
      body: 'Message body...',
    })
    setMenuOpenForId(null)
  }

  const handleSaveEdit = () => {
    if (!accessToken || !organizationId || !editingId) return

    const trimmed: Draft = {
      title: draft.title.trim(),
      subject: draft.subject.trim(),
      body: draft.body,
    }

    if (!trimmed.title || !trimmed.subject || !trimmed.body.trim()) return

    setIsSaving(true)
    void (async () => {
      try {
        if (isNewTemplateDraft) {
          const created =
            await messageTemplatesService.createMessageTemplate(
              accessToken,
              organizationId,
              trimmed,
            )
          setTemplates((prev) => [created, ...prev])
        } else {
          const updated =
            await messageTemplatesService.updateMessageTemplate(
              accessToken,
              organizationId,
              editingId,
              trimmed,
            )
          setTemplates((prev) =>
            prev.map((t) => (t._id === editingId ? updated : t)),
          )
        }

        closeEdit()
      } finally {
        setIsSaving(false)
      }
    })()
  }

  return (
    <div className="mt-6 space-y-6">
      <section>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Templates</h2>
            <p className="text-sm text-gray-600">
              Use the actions menu to edit or delete a template.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddTemplate}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            disabled={!accessToken || !organizationId}
          >
            Add template
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {isLoading ? (
            <div className="text-sm text-gray-600">Loading templates...</div>
          ) : null}

          {templates.map((t) => {
            const menuId = `menu_${t._id}`
            const isMenuOpen = menuOpenForId === t._id

            return (
              <div
                key={t._id}
                className="flex items-start justify-between gap-4 rounded-md border border-gray-200 p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-gray-900">
                      {t.title}
                    </h3>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                    {t.subject}
                  </p>
                </div>

                <ActionsMenuDropdown
                  isOpen={isMenuOpen}
                  menuId={menuId}
                  ariaLabel={`Actions for ${t.title}`}
                  onToggle={() =>
                    setMenuOpenForId((curr) =>
                      curr === t._id ? null : t._id,
                    )
                  }
                >
                  <ThreeDotPopUp
                    firstmenutext="Edit"
                    secondmenutext="Delete"
                    showThirdMenu={false}
                    onFirstClick={() => openEdit(t._id)}
                    onSecondClick={() => openDelete(t._id)}
                  />
                </ActionsMenuDropdown>
              </div>
            )
          })}
        </div>
      </section>

      {/* Edit modal (simple inline overlay) */}
      {editingId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingTemplate ? 'Edit template' : 'Add template'}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  You can use variables like {'{{candidateName}}'}, {'{{jobTitle}}'},
                  {'{{companyName}}'}.
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
                  Title
                </label>
                <input
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, title: e.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                  placeholder="Template title"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  value={draft.subject}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, subject: e.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                  placeholder="Email subject"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Body
                </label>
                <textarea
                  value={draft.body}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, body: e.target.value }))
                  }
                  className="min-h-[180px] w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                  placeholder="Message body"
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
                onClick={handleSaveEdit}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                disabled={
                  isSaving ||
                  !draft.title.trim() ||
                  !draft.subject.trim() ||
                  !draft.body.trim() ||
                  !accessToken ||
                  !organizationId
                }
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete confirmation modal */}
      {deleteId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete template?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              This action can’t be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDelete}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!accessToken || !organizationId || !deleteId) return

                  setIsSaving(true)
                  void (async () => {
                    try {
                      await messageTemplatesService.deleteMessageTemplate(
                        accessToken,
                        organizationId,
                        deleteId,
                      )

                      setTemplates((prev) =>
                        prev.filter((t) => t._id !== deleteId),
                      )

                      closeDelete()
                      if (editingId === deleteId) closeEdit()
                    } finally {
                      setIsSaving(false)
                    }
                  })()
                }}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                disabled={!accessToken || isSaving}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default MessageTemplaePage
