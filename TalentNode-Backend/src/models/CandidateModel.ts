import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    phone: {
      type: String
    },

    resume: {
      type: String
    },

    skills: [{
      type: String
    }],

    experience: {
      type: Number
    },

    currentCompany: {
      type: String
    },

    currentRole: {
      type: String
    },

    links: [
      {
        platform: String,
        url: String
      }
    ],

    tags: [{
      type: String
    }],

    notes: {
      type: String
    },

    source: {
      type: String,
      enum: ["LinkedIn", "Referral", "Website", "Naukri", "Other"]
    }
  },
  {
    timestamps: true
  }
);

candidateSchema.index({ organizationId: 1, email: 1 }, { unique: true });

export default mongoose.model("Candidate", candidateSchema);