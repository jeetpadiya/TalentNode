import { useEffect, useMemo, useState } from 'react'
import type { Job } from '../services/JobSchema'
import type { ApplicationFormData } from '../services/ApplicationFormServices'
import CustomQuestionPopUp from '../PopUp/CustomQuestionPopUp'

import { getApplicationForm, UpdateApplicationForm } from '../services/ApplicationFormServices'
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
          <div className="mt-5 rounded-md border border-dashed border-gray-300 p-5 text-center text-sm text-gray-500">
            Custom questions are currently loaded via the backend as
            <span className="font-medium"> customQuestions[]</span>.
            This UI will be updated to support editing that array.
          </div>
          <button className="w-fit rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800" onClick={() => setIsCustomQuestionPopOpen(true)}>
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
      <CustomQuestionPopUp isOpen={isCustomQuestionPopOpen} isClose={() => setIsCustomQuestionPopOpen(false)} onCreate={() => {}}
      />
    </section>
  )
}

export default ApplicationForm
