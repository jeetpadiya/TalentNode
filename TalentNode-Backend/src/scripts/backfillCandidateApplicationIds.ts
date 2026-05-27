import dotenv from "dotenv";
import mongoose from "mongoose";

import CandidateApplicationModel from "../models/CandidateApplicationModel.js";
import JobCandidateAssignmentModel from "../models/JobCandidateAssignmentModel.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("Connected to MongoDB");

  const applicationDetails = await CandidateApplicationModel.find({
    $or: [{ applicationId: { $exists: false } }, { applicationId: null }],
  }).select("_id organizationId jobId candidateId");

  let updated = 0;
  let missingAssignment = 0;
  let failed = 0;

  for (const details of applicationDetails) {
    const assignment = await JobCandidateAssignmentModel.findOne({
      organizationId: details.organizationId,
      jobId: details.jobId,
      candidateId: details.candidateId,
    }).select("_id");

    if (!assignment) {
      missingAssignment += 1;
      console.warn(`No assignment found for CandidateApplication ${details._id}`);
      continue;
    }

    try {
      await CandidateApplicationModel.updateOne(
        { _id: details._id },
        { $set: { applicationId: assignment._id } },
      );
      updated += 1;
    } catch (error) {
      failed += 1;
      console.error(`Failed to backfill CandidateApplication ${details._id}`, error);
    }
  }

  console.log(
    `Backfill complete. scanned=${applicationDetails.length} updated=${updated} missingAssignment=${missingAssignment} failed=${failed}`,
  );
}

main()
  .catch((error) => {
    console.error("Backfill failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
