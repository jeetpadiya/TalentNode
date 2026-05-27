import { useEffect, useMemo, useState } from 'react'
import type { Job } from '../services/JobSchema'
import type { ApplicationFormData, CustomQuestion } from '../services/ApplicationFormServices'
import CustomQuestionPopUp from '../PopUp/CustomQuestionPopUp'

import { createCustomQuestion, deleteCustomQuestion, getApplicationForm, UpdateApplicationForm, updateCustomQuestion } from '../services/ApplicationFormServices'
import { useAuthStore } from '../../../app/store/AuthStore'

type FieldVisibility = "Required" | "Optional" | "Hidden"

type FieldVisibilityKey = 'phone' | 'location'

type ApplicationFieldKey =
  | 'linkedin'
  | 'twitter'
  | 'github'
  | 'dribbble'
  | 'portfolio'
  | 'resume'

const fieldOptions: FieldVisibility[] = [
  'Required',
  'Optional',
  'Hidden',
]

const ApplicationForm = ({
  job,
}: {
  job: Job
}) => {
  const [loading, setLoading] = useState(false)
  const [formConfig, setFormConfig] =

    useState<ApplicationFormData | null>(null)

  const accessToken = useAuthStore((state) => state.accessToken)

  const [isCustomQuestionPopOpen, setIsCustomQuestionPopOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<CustomQuestion | null>(null)



  // ---------------- helpers ----------------
  const visibilityFromKey = useMemo(() => {
    // map enum -> label for display
    return new Map<FieldVisibility, string>([
      ['Required', 'Required'],
      ['Optional', 'Optional'],
      ['Hidden', 'Hidden'],
    ])
  }, [])

  const updateBasicInfo = (
    key: FieldVisibilityKey,
    value: FieldVisibility,
  ) => {
    setFormConfig((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          [key]: value,
        },
      }
    })
  }

  const getFieldVisibilityByKey = (
    list: 'links' | 'fileUploads',
    key: ApplicationFieldKey,
  ): FieldVisibility => {
    if (!formConfig) return 'Hidden'
    const found = formConfig[list].find((f) => f.key === key)
    return (found?.visibility ?? 'Hidden') as FieldVisibility
  }

  const setFieldVisibilityByKey = (
    list: 'links' | 'fileUploads',
    key: ApplicationFieldKey,
    visibility: FieldVisibility,
  ) => {
    setFormConfig((prev) => {
      if (!prev) return prev

      const current = prev[list]
      const idx = current.findIndex((f) => f.key === key)

      const nextField = {
        key,
        label: current[idx]?.label ?? key,
        visibility,
      }

      if (idx === -1) {
        return {
          ...prev,
          [list]: [
            ...current,
            nextField,
          ],
        }
      }

      const updated = [...current]
      updated[idx] = nextField

      return {
        ...prev,
        [list]: updated,
      }
    })
  }

  const renderVisibilityDropdown = (
    label: string,
    value: FieldVisibility,
    onChange: (v: FieldVisibility) => void,
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value as FieldVisibility)
        }
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-black"
      >
        {fieldOptions.map((opt) => (
          <option key={opt} value={opt}>
            {visibilityFromKey.get(opt) ?? opt}
          </option>
        ))}
      </select>
    </div>
  )

  // ---------------- data fetch ----------------
  const fetchApplicationForm = async () => {
    try {
      setLoading(true)

      if (!accessToken) {
        console.error('User is not authenticated')
        return
      }

      const data = await getApplicationForm(
        job.id,
        accessToken,
      )

      setFormConfig(data)
    } catch (error) {
      let message = "Failed to fetch application form";
      if (error instanceof Error) {
        message = error.message;
      }
      console.error(message, error);

      setFormConfig(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (accessToken) {
      fetchApplicationForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])


  // Update application form

  const handleUpateApplicationForm = async () => {
    try {
      setLoading(true)
      if (!accessToken) {
        return alert("user not auhthenticated");
      }

      if (!formConfig) {
        return;
      }

      const data = await UpdateApplicationForm(job.id, formConfig, accessToken)
      setFormConfig(data)
    }
    catch (error) {
      console.error("Someting went wrong", error)
      setFormConfig(null)
    }
    finally {
      setLoading(false);
    }
  }

  const handleSubmitCustomQuestion = async (
    question: NonNullable<ApplicationFormData['customQuestions']>[number],
  ) => {
    try {
      setLoading(true)
      if (!accessToken) {
        return alert('user not authenticated')
      }

      const data = editingQuestion
        ? await updateCustomQuestion(job.id, editingQuestion.key, question, accessToken)
        : await createCustomQuestion(job.id, question, accessToken)
      setFormConfig(data)
      setEditingQuestion(null)
      setIsCustomQuestionPopOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create custom question'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateQuestion = () => {
    setEditingQuestion(null)
    setIsCustomQuestionPopOpen(true)
  }

  const handleOpenEditQuestion = (question: CustomQuestion) => {
    setEditingQuestion(question)
    setIsCustomQuestionPopOpen(true)
  }

  const handleCloseQuestionPopup = () => {
    setEditingQuestion(null)
    setIsCustomQuestionPopOpen(false)
  }

  const handleDeleteCustomQuestion = async (question: CustomQuestion) => {
    if (!accessToken) {
      return alert('user not authenticated')
    }

    const shouldDelete = window.confirm(`Delete "${question.question}"?`)
    if (!shouldDelete) return

    try {
      setLoading(true)
      const data = await deleteCustomQuestion(job.id, question.key, accessToken)
      setFormConfig(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not delete custom question'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-gray-500">
        Loading application form...
      </p>
    )
  }

  if (!formConfig) {
    return (
      <p className="text-sm text-red-500">
        Failed to load application form
      </p>
    )
  }

  // ---------------- UI ----------------
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Application form
      </h2>

      <p className="mt-1 text-sm text-gray-600">
        Configure which fields appear on this job’s application
        form.
      </p>

      {/* Basic Information */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-900">
          Basic information
        </h3>

        <div className="mt-5 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Name
            </label>

            <input
              type="text"
              disabled
              placeholder="Always required"
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-500 outline-none"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Email address
            </label>

            <input
              type="email"
              disabled
              placeholder="Always required"
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-500 outline-none"
            />
          </div>

          {renderVisibilityDropdown(
            'Phone',
            formConfig.basicInfo.phone as FieldVisibility,
            (v) => updateBasicInfo('phone', v),
          )}

          {renderVisibilityDropdown(
            'Location',
            formConfig.basicInfo.location as FieldVisibility,
            (v) => updateBasicInfo('location', v),
          )}
        </div>
      </div>

      {/* Links */}
      <div className="mt-10">
        <h3 className="text-sm font-semibold text-gray-900">
          Links
        </h3>

        <div className="mt-5 space-y-5">
          {renderVisibilityDropdown(
            'LinkedIn profile',
            getFieldVisibilityByKey('links', 'linkedin'),
            (v) =>
              setFieldVisibilityByKey('links', 'linkedin', v),
          )}

          {renderVisibilityDropdown(
            'X (Twitter) profile',
            getFieldVisibilityByKey('links', 'twitter'),
            (v) =>
              setFieldVisibilityByKey('links', 'twitter', v),
          )}

          {renderVisibilityDropdown(
            'GitHub profile',
            getFieldVisibilityByKey('links', 'github'),
            (v) =>
              setFieldVisibilityByKey('links', 'github', v),
          )}

          {renderVisibilityDropdown(
            'Dribbble profile',
            getFieldVisibilityByKey('links', 'dribbble'),
            (v) =>
              setFieldVisibilityByKey('links', 'dribbble', v),
          )}

          {renderVisibilityDropdown(
            'Website URL',
            getFieldVisibilityByKey('links', 'portfolio'),
            (v) =>
              setFieldVisibilityByKey('links', 'portfolio', v),
          )}
        </div>
      </div>

      {/* File Upload */}
      <div className="mt-10">
        <h3 className="text-sm font-semibold text-gray-900">
          File upload
        </h3>

        <div className="mt-5">
          {renderVisibilityDropdown(
            'Resume',
            getFieldVisibilityByKey('fileUploads', 'resume'),
            (v) =>
              setFieldVisibilityByKey(
                'fileUploads',
                'resume',
                v,
              ),
          )}
        </div>
      </div>

      {/* Custom Fields */}
      <div className="mt-10">
        <h3 className="text-sm font-semibold text-gray-900">
          Custom fields
        </h3>
        <div className="flex flex-col space-y-4">
          {formConfig.customQuestions.length > 0 ? (
            <div className="mt-5 divide-y divide-gray-100 rounded-md border border-gray-200">
              {formConfig.customQuestions.map((item) => (
                <div key={item.key} className="flex items-start justify-between gap-4 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.question}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.fieldType} · {item.required ? 'Required' : 'Optional'}
                    </p>
                    {item.options.length > 0 ? (
                      <p className="mt-1 text-xs text-gray-500">
                        Options: {item.options.join(', ')}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      {item.key}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditQuestion(item)}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomQuestion(item)}
                      className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-md border border-dashed border-gray-300 p-5 text-center text-sm text-gray-500">
              No custom questions yet.
            </div>
          )}
          <button className="w-fit rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800" onClick={handleOpenCreateQuestion}>
            Add Question
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8">
        <button className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800" onClick={handleUpateApplicationForm}>
          Save changes
        </button>
      </div>
      <CustomQuestionPopUp
        isOpen={isCustomQuestionPopOpen}
        isClose={handleCloseQuestionPopup}
        onSubmit={handleSubmitCustomQuestion}
        initialQuestion={editingQuestion}
      />
    </section>
  )
}

export default ApplicationForm
