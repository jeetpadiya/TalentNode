import mongoose, { Schema } from 'mongoose'

export type OrganizationInviteTokenStatus = 'pending' | 'accepted' | 'revoked' | 'expired'

export type OrganizationInviteRole =
  | 'recruiter'
  | 'hiring_manager'
  | 'interviewer'
  | 'admin'

const OrganizationInviteSchema = new Schema<{
  organizationId: mongoose.Types.ObjectId
  invitedEmail: string
  invitedBy: mongoose.Types.ObjectId
  role: OrganizationInviteRole

  // token used in the invite link (store hashed in real systems)
  token: string
  status: OrganizationInviteTokenStatus

  // lifecycle
  expiresAt: Date

  acceptedBy?: mongoose.Types.ObjectId
  acceptedAt?: Date
  createdAt: Date
  updatedAt: Date
}>({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  invitedEmail: {
    type: String,
    required: true,
    index: true,
    lowercase: true,
    trim: true,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['recruiter', 'hiring_manager', 'interviewer', 'admin'],
    required: true,
    default: 'recruiter',
  },

  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'revoked', 'expired'],
    required: true,
    default: 'pending',
    index: true,
  },

  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },

  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  acceptedAt: {
    type: Date,
    required: false,
  },
}, {
  timestamps: true,
})

const OrganizationInviteModel = mongoose.model(
  'OrganizationInvite',
  OrganizationInviteSchema,
)

export default OrganizationInviteModel

