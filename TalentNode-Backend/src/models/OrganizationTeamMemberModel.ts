import mongoose, { Schema } from 'mongoose'

export type OrganizationTeamMemberRole =
  | 'recruiter'
  | 'hiring_manager'
  | 'interviewer'
  | 'admin'

const OrganizationTeamMemberSchema = new Schema<{
  organizationId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  role: OrganizationTeamMemberRole
  createdAt: Date
  updatedAt: Date
}>({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['recruiter', 'hiring_manager', 'interviewer', 'admin'],
    required: true,
    default: 'recruiter',
  },
})

// Ensure a user can be in a given org team only once
OrganizationTeamMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true })

const OrganizationTeamMemberModel = mongoose.model(
  'OrganizationTeamMember',
  OrganizationTeamMemberSchema,
)

export default OrganizationTeamMemberModel

