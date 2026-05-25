import { useState, useEffect } from 'react'
import AddEditTemplateModal from '../components/AddEditTemplateModal'
import { reviewTemplatesService, type ReviewTemplate } from '../services/reviewTemplatesService'
import { useAuthStore } from '../../../app/store/AuthStore'

const ReviewTemplatePage = () => {
  const [reviewTemplates, setReviewTemplates] = useState<ReviewTemplate[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [templateToEdit, setTemplateToEdit] = useState<ReviewTemplate | null>(null)
  
  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!accessToken || !user?.organizationId) return

    void (async () => {
      try {
        const templates = await reviewTemplatesService.listReviewTemplates(
          accessToken,
          user.organizationId as string
        )
        setReviewTemplates(templates)
      } catch (error) {
        console.error('Failed to load review templates', error)
      }
    })()
  }, [accessToken, user?.organizationId])

  const handleAddTemplate = async (name: string, template: string) => {
    if (!accessToken || !user?.organizationId) return
    try {
      const newTemplate = await reviewTemplatesService.createReviewTemplate(
        accessToken,
        user.organizationId,
        { name, template }
      )
      setReviewTemplates((prevTemplates) => [newTemplate, ...prevTemplates])
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to create review template', error)
    }
  }

  const handleEditTemplate = async (id: string, name: string, template: string) => {
    if (!accessToken || !user?.organizationId) return
    try {
      const updatedTemplate = await reviewTemplatesService.updateReviewTemplate(
        accessToken,
        user.organizationId,
        id,
        { name, template }
      )
      setReviewTemplates((prevTemplates) =>
        prevTemplates.map((t) => (t._id === id ? updatedTemplate : t))
      )
      setIsModalOpen(false)
      setTemplateToEdit(null)
    } catch (error) {
      console.error('Failed to update review template', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!accessToken || !user?.organizationId) return
    try {
      await reviewTemplatesService.deleteReviewTemplate(
        accessToken,
        user.organizationId,
        id
      )
      setReviewTemplates((prevTemplates) => prevTemplates.filter((template) => template._id !== id))
    } catch (error) {
      console.error('Failed to delete review template', error)
    }
  }

  const openAddModal = () => {
    setTemplateToEdit(null)
    setIsModalOpen(true)
  }

  const openEditModal = (template: ReviewTemplate) => {
    setTemplateToEdit(template)
    setIsModalOpen(true)
  }

  const handleSave = (name: string, template: string) => {
    if (templateToEdit) {
      void handleEditTemplate(templateToEdit._id, name, template)
    } else {
      void handleAddTemplate(name, template)
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Existing templates</h2>
          <button
            onClick={openAddModal}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          >
            Add Template
          </button>
        </div>

        <div className="grid gap-4">
          {reviewTemplates.map((template) => (
            <div key={template._id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                <div className="relative">
                  <button
                    onClick={() => openEditModal(template)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => void handleDelete(template._id)}
                    className="ml-2 rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AddEditTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        templateToEdit={templateToEdit}
      />
    </div>
  )
}

export default ReviewTemplatePage
