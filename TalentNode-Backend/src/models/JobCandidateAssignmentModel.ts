import mongoose from "mongoose";

/** Links a candidate to a job within an org (pipeline / ATS). */
const assignmentSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },
        /**
         * Stores the embedded hiring stage `_id` from the parent job.
         * (There is no separate HiringStage collection; stages are embedded.)
         */
        hiringStageId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
        },
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate",
            required: true,
        },
    },
    { timestamps: true },
);

assignmentSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
assignmentSchema.index({ organizationId: 1, jobId: 1 });
assignmentSchema.index({ organizationId: 1, jobId: 1, hiringStageId: 1 });

export default mongoose.model("JobCandidateAssignment", assignmentSchema);
