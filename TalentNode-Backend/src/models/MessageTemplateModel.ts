import mongoose, { Schema } from 'mongoose'

export type MessageTemplate = {
  _id?: mongoose.Types.ObjectId
  organizationId: mongoose.Types.ObjectId
  title: string
  subject: string
  body: string
}

const MessageTemplateSchema = new Schema<MessageTemplate>(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    body: { type: String, required: true },
  },
  { timestamps: true },
)

const MessageTemplateModel = mongoose.model<MessageTemplate>(
  'MessageTemplate',
  MessageTemplateSchema,
)

export default MessageTemplateModel

