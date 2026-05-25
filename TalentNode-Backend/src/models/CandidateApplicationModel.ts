import mongoose from "mongoose";

const candidateApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

  
    comments: [
      {
        text: {
          type: String,
          required: true,
        },

        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

     PrivateNote: [
      {
        text: {
          type: String,
          required: true,
        },

        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    reviewRequests: [
      {
        assigneeUserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        requestedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        message: {
          type: String,
          trim: true,
          default: "",
        },
        status: {
          type: String,
          enum: ["pending", "completed", "cancelled"],
          default: "pending",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        completedAt: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CandidateApplicationModel = mongoose.model(
  "CandidateApplication",
  candidateApplicationSchema
);

export default CandidateApplicationModel;