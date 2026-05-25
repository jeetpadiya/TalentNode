import mongoose, { Schema } from 'mongoose'

export type JobCategory = {
  organizationId: mongoose.Types.ObjectId
  name: string
  order: number
}

const JobCategorySchema = new Schema<JobCategory>(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

const JobCategoryModel = mongoose.model<JobCategory>(
  'JobCategory',
  JobCategorySchema,
)

export default JobCategoryModel
