import mongoose from "mongoose";

const candidateApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCandidateAssignment",
      required: false,
    },

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

    emails: [
      {
        subject: {
          type: String,
          required: true,
        },
        body: {
          type: String,
          required: true,
        },
        sentBy: {
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

    customQuestionAnswers: [
      {
        key: {
          type: String,
          required: true,
          trim: true,
        },
        answer: {
          type: mongoose.Schema.Types.Mixed,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

candidateApplicationSchema.index(
  { applicationId: 1 },
  { unique: true, sparse: true },
);
candidateApplicationSchema.index(
  { organizationId: 1, jobId: 1, candidateId: 1 },
);

const CandidateApplicationModel = mongoose.model(
  "CandidateApplication",
  candidateApplicationSchema
);

export default CandidateApplicationModel;
