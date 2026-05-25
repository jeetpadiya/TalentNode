import { useState, useEffect } from 'react'

interface AddEditTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, template: string) => void
  templateToEdit?: {
    _id: string
    name: string
    template: string
  } | null
}

const AddEditTemplateModal = ({
  isOpen,
  onClose,
  onSave,
  templateToEdit,
}: AddEditTemplateModalProps) => {
  const [name, setName] = useState(templateToEdit?.name || "")
  const [templateContent, setTemplateContent] = useState(templateToEdit?.template || "")

  useEffect(() => {
    if (templateToEdit) {
      setName(templateToEdit.name)
      setTemplateContent(templateToEdit.template)
    } else {
      setName('')
      setTemplateContent('')
    }
  }, [templateToEdit, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(name, templateContent)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {templateToEdit ? 'Edit Template' : 'Add New Template'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
            </label>
            <input
              type="text"
              id="templateName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              placeholder="e.g., Final Interview Template"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="templateContent" className="block text-sm font-medium text-gray-700 mb-1">
              Template Content
            </label>
            <textarea
              id="templateContent"
              className="mt-1 block w-full min-h-[200px] rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black font-mono text-sm"
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              placeholder="Start typing your template here..."
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            >
              {templateToEdit ? 'Save Changes' : 'Add Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEditTemplateModal
