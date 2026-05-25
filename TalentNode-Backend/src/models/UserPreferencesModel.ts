import mongoose, { Schema } from 'mongoose'

export type UserPreferences = {
  userId: mongoose.Types.ObjectId
  newCandidateApplication: boolean
  newCommentOrReview: boolean
  newMessageFromCandidate: boolean
}

const UserPreferencesSchema = new Schema<UserPreferences>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    newCandidateApplication: { type: Boolean, default: false },
    newCommentOrReview: { type: Boolean, default: false },
    newMessageFromCandidate: { type: Boolean, default: false },
  },
  { timestamps: true },
)

const UserPreferencesModel = mongoose.model<UserPreferences>(
  'UserPreferences',
  UserPreferencesSchema,
)

export default UserPreferencesModel

