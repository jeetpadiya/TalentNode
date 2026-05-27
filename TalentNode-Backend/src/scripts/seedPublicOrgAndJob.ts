import mongoose from "mongoose";

import OrganizationModel from "../models/OrganizationModel.js";
import UserModel from "../models/UserModel.js";
import OrganizationTeamMemberModel from "../models/OrganizationTeamMemberModel.js";
import JobsModel from "../models/JobsModel.js";
import { DEFAULT_HIRING_STAGES } from "../constants/defaultHiringStages.js";

// One-off script to ensure a given organization slug has at least one
// open + published job visible in the public portal.
//
// Usage:
//   node src/scripts/seedPublicOrgAndJob.ts
// Note: this project is ESM + TS, so run via tsx if available:
//   cd TalentNode-Backend && npx tsx src/scripts/seedPublicOrgAndJob.ts

const MONGODB_URI = process.env.MONGODB_URI
 

const ORG_SLUG = "jeet-pvt-ltd";

// Change if you want a different job title for the public portal.
const JOB_TITLE = "Public Demo Role";

async function main() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured in the seed script");
  }

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("✅ Connected to MongoDB");

  // 1) Find org
  const organization = await OrganizationModel.findOne({ slug: ORG_SLUG });
  if (!organization) {
    throw new Error(`❌ Organization not found for slug: ${ORG_SLUG}`);
  }

  console.log(`✅ Found organization: ${organization.name} (${organization.slug})`);

  // 2) Find an admin user (needed because JobsModel.create requires createdBy)
  const adminUser = await UserModel.findOne({ organizationId: organization._id });

  let createdBy: mongoose.Types.ObjectId | null = null;

  if (adminUser?._id) {
    createdBy = adminUser._id;
    console.log(`✅ Using UserModel admin createdBy: ${createdBy}`);
  } else {
    const teamMember = await OrganizationTeamMemberModel.findOne({
      organizationId: organization._id,
      role: "admin",
    });

    if (!teamMember?.userId) {
      const anyTeamMember = await OrganizationTeamMemberModel.findOne({
        organizationId: organization._id,
      });

      if (!anyTeamMember?.userId) {
        throw new Error(
          `❌ No users found for organization ${organization._id}. Cannot create job (createdBy required).`
        );
      }

      createdBy = anyTeamMember.userId;
      console.log(`✅ Using fallback teamMember createdBy: ${createdBy}`);
    } else {
      createdBy = teamMember.userId;
      console.log(`✅ Using admin teamMember createdBy: ${createdBy}`);
    }
  }

  if (!createdBy) {
    throw new Error("❌ Unable to resolve a createdBy user id");
  }

  // 3) Upsert job (idempotent)
  const existingJob = await JobsModel.findOne({
    organizationId: organization._id,
    title: JOB_TITLE,
  }).select("_id title status isPublished createdAt");

  if (existingJob) {
    console.log(
      `ℹ️ Job already exists: ${existingJob.title} (${existingJob._id}). Ensuring it's public...`
    );

    await JobsModel.updateOne(
      { _id: existingJob._id },
      {
        $set: {
          status: "open",
          isPublished: true,
          applicationDeadline: undefined,
          description: existingJob.description || "Public demo job description",
          employmentType: existingJob.employmentType || "full_time",
          workMode: existingJob.workMode || "onsite",
          experienceLevel: existingJob.experienceLevel || "junior",
          hiringStages: existingJob.hiringStages?.length ? existingJob.hiringStages : [...DEFAULT_HIRING_STAGES],
        },
      }
    );

    console.log("✅ Updated existing job to be open + published.");
    return;
  }

  // Create a basic published/open job.
  // JobsModel schema requires:
  // - title
  // - description
  // - employmentType
  // - organizationId
  // - createdBy
  // Other optional fields get safe defaults.
  const createdJob = await JobsModel.create({
    title: JOB_TITLE,
    description: "Public demo job description (seeded for public portal visibility)",
    employmentType: "full_time",
    workMode: "onsite",
    experienceLevel: "junior",
    responsibilities: [],
    requirements: [],
    niceToHave: [],
    skills: [],
    tags: [],
    currency: "INR",
    openings: 1,
    status: "open",
    isPublished: true,
    applicationDeadline: undefined,
    organizationId: organization._id,
    createdBy,
    hiringStages: [...DEFAULT_HIRING_STAGES],
    applicationForm: {
      basicInfo: {
        phone: "Optional",
        location: "Optional",
      },
      links: [],
      fileUploads: [],
      customQuestions: [],
    },
  });

  console.log(`🎉 Created job: ${createdJob.title} (${createdJob._id})`);
}

main()
  .then(() => {
    console.log("✅ Seed completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });

