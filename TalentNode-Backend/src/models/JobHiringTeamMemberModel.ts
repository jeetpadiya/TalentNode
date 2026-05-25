import mongoose, { Schema } from 'mongoose'

export type JobHiringTeamMemberRole =
  | 'recruiter'
  | 'hiring_manager'
  | 'interviewer'

const JobHiringTeamMemberSchema = new Schema<{
  organizationId: mongoose.Types.ObjectId
  jobId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  role: JobHiringTeamMemberRole
  createdAt: Date
  updatedAt: Date
}>(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
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
      enum: ['recruiter', 'hiring_manager', 'interviewer'],
      required: true,
      default: 'recruiter',
    },
  },
  { timestamps: true },
)

JobHiringTeamMemberSchema.index({ jobId: 1, userId: 1 }, { unique: true })

const JobHiringTeamMemberModel = mongoose.model(
  'JobHiringTeamMember',
  JobHiringTeamMemberSchema,
)

export default JobHiringTeamMemberModel
