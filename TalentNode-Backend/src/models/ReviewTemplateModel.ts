import mongoose, { Schema } from 'mongoose'

export type ReviewTemplate = {
  organizationId: mongoose.Types.ObjectId
  name: string
  template: string
}

const ReviewTemplateSchema = new Schema<ReviewTemplate>(
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
    template: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

const ReviewTemplateModel = mongoose.model<ReviewTemplate>(
  'ReviewTemplate',
  ReviewTemplateSchema,
)

export default ReviewTemplateModel
