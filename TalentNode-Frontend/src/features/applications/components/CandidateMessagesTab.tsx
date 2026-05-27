import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../app/store/AuthStore'
import {
  messageTemplatesService,
  type MessageTemplate,
} from '../../settings/services/messageTemplatesService'
import {
  sendCandidateEmail,
  getCandidateEmails,
} from '../services/ApplicationServices'

type CandidateMessagesTabProps = {
  jobId: string
  applicationId: string
}

type EmailLog = {
  _id: string
  subject: string
  body: string
  sentBy: {
    firstName: string
    lastName: string
    email: string
    profileImageUrl?: string
  }
  createdAt: string
}

const CandidateMessagesTab = ({ jobId, applicationId }: CandidateMessagesTabProps) => {
  const { accessToken, user } = useAuthStore()

  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  
  const [emails, setEmails] = useState<EmailLog[]>([])
  const [isLoadingEmails, setIsLoadingEmails] = useState(false)

  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken || !user?.organizationId) return

    const fetchTemplates = async () => {
      setIsLoadingTemplates(true)
      try {
        const data = await messageTemplatesService.listMessageTemplates(
          accessToken,
          user.organizationId as string,
        )
        setTemplates(data)
      } catch (error) {
        console.error('Failed to fetch message templates', error)
      } finally {
        setIsLoadingTemplates(false)
      }
    }

    void fetchTemplates()
  }, [accessToken, user?.organizationId])

  useEffect(() => {
    if (!accessToken || !jobId || !applicationId) return

    const fetchEmails = async () => {
      setIsLoadingEmails(true)
      try {
        const data = await getCandidateEmails(jobId, applicationId, accessToken)
        if (data.success && data.emails) {
          setEmails(data.emails)
        }
      } catch (error) {
        console.error('Failed to fetch emails', error)
      } finally {
        setIsLoadingEmails(false)
      }
    }

    void fetchEmails()
  }, [accessToken, jobId, applicationId])


  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value
    setSelectedTemplateId(templateId)

    if (templateId) {
      const template = templates.find((t) => t._id === templateId)
      if (template) {
        setSubject(template.subject)
        setBody(template.body)
      }
    } else {
      setSubject('')
      setBody('')
    }
  }

  const handleSendMessage = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Subject and message are required.')
      return
    }
    if (!accessToken) return

    setError(null)
    setSuccessMsg(null)
    setIsSending(true)

    try {
      const data = await sendCandidateEmail({
        jobId,
        applicationId,
        subject,
        body,
        accessToken,
      })

      if (data.success && data.emailLog) {
        setSuccessMsg('Email sent successfully!')
        setSubject('')
        setBody('')
        setSelectedTemplateId('')
        // Add new email to top of list
        setEmails((prev) => [data.emailLog, ...prev])
        
        setTimeout(() => setSuccessMsg(null), 3000)
      }
    } catch (err: any) {
      console.error('Error sending email:', err)
      setError(err?.message ?? 'Failed to send email.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Compose Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Compose Email</h3>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
            {successMsg}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-900">
              Insert Template
            </label>
            <select
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              disabled={isLoadingTemplates || isSending}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-900 disabled:bg-gray-50"
            >
              <option value="">-- Select a template --</option>
              {templates.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-900">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
              placeholder="Message Subject"
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-900 disabled:bg-gray-50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-900">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isSending}
              rows={6}
              placeholder="Type your message here..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 disabled:bg-gray-50"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isSending}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </div>
      </div>

      {/* Email History */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email History</h3>
        
        {isLoadingEmails ? (
          <p className="text-sm text-gray-500">Loading history...</p>
        ) : emails.length === 0 ? (
          <p className="text-sm text-gray-500">No emails have been sent to this candidate yet.</p>
        ) : (
          <div className="space-y-4">
            {emails.map((email) => (
              <div key={email._id} className="rounded-md border border-gray-100 bg-gray-50 p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold text-gray-900">{email.subject}</h4>
                  <span className="text-xs text-gray-500">
                    {new Date(email.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="mb-3 text-xs text-gray-600 flex items-center gap-2">
                  <span>Sent by:</span>
                  <div className="flex items-center gap-1">
                    {email.sentBy?.profileImageUrl ? (
                       <img src={email.sentBy.profileImageUrl} alt="avatar" className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold" style={{ fontSize: '8px' }}>
                        {email.sentBy?.firstName?.[0] ?? '?'}
                      </div>
                    )}
                    <span>{email.sentBy?.firstName} {email.sentBy?.lastName}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white border border-gray-200 p-3 rounded-md">
                  {email.body}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CandidateMessagesTab
