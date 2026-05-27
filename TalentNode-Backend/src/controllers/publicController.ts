import type { Request, Response } from "express";
import mongoose from "mongoose";
import { MongoServerError } from "mongodb";

import OrganizationModel from "../models/OrganizationModel.js";
import JobsModel from "../models/JobsModel.js";
import CandidateModel from "../models/CandidateModel.js";
import JobCandidateAssignmentModel from "../models/JobCandidateAssignmentModel.js";
import CandidateApplicationModel from "../models/CandidateApplicationModel.js";
import { publicApplicationSchema } from "../validations/publicApplicationSchemas.js";

import { uploadBufferToCloudinary } from "../utils/cloudinary.js";

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

const formatZodErrors = (issues: Array<{ path: PropertyKey[]; message: string }>) =>
  issues.map((issue) => ({
    field: issue.path.join(".") || "root",
    message: issue.message,
  }));

/** Serialize a published job for the public (strips internal fields). */
const serializePublicJob = (job: any) => ({
  id: String(job._id),
  title: job.title,
  department: job.department ?? null,
  location: job.location ?? null,
  workMode: job.workMode ?? "onsite",
  employmentType: job.employmentType ?? "full_time",
  experienceLevel: job.experienceLevel ?? "junior",
  description: job.description ?? "",
  responsibilities: job.responsibilities ?? [],
  requirements: job.requirements ?? [],
  niceToHave: job.niceToHave ?? [],
  skills: job.skills ?? [],
  tags: job.tags ?? [],
  salaryMin: job.salaryMin ?? null,
  salaryMax: job.salaryMax ?? null,
  currency: job.currency ?? "INR",
  openings: job.openings ?? 1,
  applicationDeadline: job.applicationDeadline ?? null,
  createdAt: job.createdAt,
});

// ──────────────────────────────────────────────────────────
// GET /api/public/organizations/:slug/jobs
// List all open + published jobs for a given organization.
// ──────────────────────────────────────────────────────────
const getPublicJobs = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const slugValue = Array.isArray(slug) ? slug[0] : slug;

    if (!slugValue?.trim()) {
      return res.status(400).json({ success: false, message: "Organization slug is required" });
    }

    const organization = await OrganizationModel.findOne({
      slug: slugValue.toLowerCase().trim(),
    }).select("_id name slug description website logoUrl");

    if (!organization) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    const jobs = await JobsModel.find({
      organizationId: organization._id,
      status: "open",
      isPublished: true,
    })
      .select(
        "title department location workMode employmentType experienceLevel " +
        "description skills tags salaryMin salaryMax currency openings applicationDeadline createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      organization: {
        id: String(organization._id),
        name: organization.name,
        slug: organization.slug,
        description: organization.description ?? null,
        website: organization.website ?? null,
        logoUrl: organization.logoUrl ?? null,
      },
      jobs: jobs.map(serializePublicJob),
    });
  } catch (error) {
    console.error("Error fetching public jobs:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ──────────────────────────────────────────────────────────
// GET /api/public/jobs/:jobId
// Get a single published job's details + its application form.
// ──────────────────────────────────────────────────────────
const getPublicJobById = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!jobId || !mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ success: false, message: "Invalid job id" });
    }

    const job = await JobsModel.findOne({
      _id: jobId,
      status: "open",
      isPublished: true,
    })
      .populate("organizationId", "name slug description website logoUrl")
      .lean();

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const organization = job.organizationId as any;

    // Build the public application form config
    const applicationForm = job.applicationForm ?? {
      basicInfo: { phone: "Hidden", location: "Hidden" },
      links: [],
      fileUploads: [],
      customQuestions: [],
    };

    return res.status(200).json({
      success: true,
      job: {
        ...serializePublicJob(job),
        responsibilities: job.responsibilities ?? [],
        requirements: job.requirements ?? [],
        niceToHave: job.niceToHave ?? [],
      },
      organization: {
        id: organization?._id ? String(organization._id) : String(job.organizationId),
        name: organization?.name ?? null,
        slug: organization?.slug ?? null,
        description: organization?.description ?? null,
        website: organization?.website ?? null,
        logoUrl: organization?.logoUrl ?? null,
      },
      applicationForm,
    });
  } catch (error) {
    console.error("Error fetching public job:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ──────────────────────────────────────────────────────────
// POST /api/public/jobs/:jobId/apply
// Submit a public application (creates candidate + assignment).
// ──────────────────────────────────────────────────────────
const submitPublicApplication = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!jobId || !mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ success: false, message: "Invalid job id" });
    }

    let body = { ...req.body };
    if (typeof body.links === "string") {
      try { body.links = JSON.parse(body.links); } catch (e) { body.links = []; }
    }
    if (typeof body.customQuestionAnswers === "string") {
      try { body.customQuestionAnswers = JSON.parse(body.customQuestionAnswers); } catch (e) { body.customQuestionAnswers = []; }
    }

    // Validate payload
    const parsedBody = publicApplicationSchema.safeParse(body);
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formatZodErrors(parsedBody.error.issues),
      });
    }

    // Find the open + published job
    const job = await JobsModel.findOne({
      _id: jobId,
      status: "open",
      isPublished: true,
    }).select("_id organizationId hiringStages applicationDeadline applicationForm");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "This job is no longer accepting applications",
      });
    }

    // Check deadline
    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      return res.status(410).json({
        success: false,
        message: "The application deadline for this position has passed",
      });
    }

    const organizationId = job.organizationId;
    const payload = parsedBody.data;

    const payloadEmail = typeof payload.email === "string" ? payload.email : "";
    const payloadName = typeof payload.name === "string" ? payload.name : "";
    const payloadPhone = typeof payload.phone === "string" ? payload.phone : undefined;
    const payloadLocation = typeof payload.location === "string" ? payload.location : undefined;

    // Validate required application form fields
    const appForm = job.applicationForm as any;

    if (appForm?.basicInfo?.phone === "Required" && !payloadPhone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required for this application",
      });
    }
    if (appForm?.basicInfo?.location === "Required" && !payloadLocation?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Location is required for this application",
      });
    }

    const resumeField = (appForm?.fileUploads ?? []).find(
      (field: { key?: string }) => field.key === "resume",
    );
    if (resumeField?.visibility === "Required" && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume is required for this application",
        errors: [{ field: "resume", message: "Resume is required" }],
      });
    }

    // Validate required custom questions
    const customQuestions: Array<{ key: string; question: string; required: boolean }> =
      appForm?.customQuestions ?? [];
    const answersMap = new Map(
      (payload.customQuestionAnswers ?? []).map((a) => [a.key, a.answer]),
    );
    for (const q of customQuestions) {
      if (q.required) {
        const answer = answersMap.get(q.key);
        const isEmpty =
          answer === undefined ||
          answer === null ||
          answer === "" ||
          (Array.isArray(answer) && answer.length === 0);
        if (isEmpty) {
          return res.status(400).json({
            success: false,
            message: `"${q.question}" is a required field`,
          });
        }
      }
    }

    // Upload resume to Cloudinary if file is attached
    let resumeUrl: string | undefined = undefined;
    if (req.file) {
      try {
        const uploadResult = await uploadBufferToCloudinary(req.file.buffer, `resumes/${organizationId}`);
        resumeUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Failed to upload resume to Cloudinary:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload resume file",
        });
      }
    }

    // Upsert candidate (find existing by email in this org, or create new)
    let candidate = await CandidateModel.findOne({
      organizationId,
      email: payloadEmail.trim().toLowerCase(),
    });

    if (!candidate) {
      candidate = await CandidateModel.create({
        name: payloadName.trim(),
        email: payloadEmail.trim().toLowerCase(),
        phone: payloadPhone?.trim() || undefined,
        organizationId,
        source: "Website",
        resume: resumeUrl,
        links: (payload.links ?? [])
          .filter((l) => typeof l.value === "string" && l.value.trim())
          .map((l) => ({ platform: l.key, url: l.value })),
      });
    } else if (resumeUrl) {
      // Update the candidate's resume if they provided a new one
      candidate.resume = resumeUrl;
      await candidate.save();
    }

    // Check if already applied to this job
    const existingAssignment = await JobCandidateAssignmentModel.findOne({
      jobId: job._id,
      candidateId: candidate._id,
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this position",
      });
    }

    // Assign candidate to first hiring stage
    const orderedStages = Array.isArray(job.hiringStages)
      ? [...job.hiringStages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : [];
    const firstStageId = orderedStages[0]?._id ?? undefined;

    const assignment = await JobCandidateAssignmentModel.create({
      organizationId,
      jobId: job._id,
      candidateId: candidate._id,
      hiringStageId: firstStageId,
    });

    // Create CandidateApplication record with metadata
    await CandidateApplicationModel.findOneAndUpdate(
      {
        jobId: job._id,
        candidateId: candidate._id,
        organizationId,
      },
      {
        $setOnInsert: {
          jobId: job._id,
          candidateId: candidate._id,
          organizationId,
        },
        $set: {
          applicationId: assignment._id,
          customQuestionAnswers: payload.customQuestionAnswers ?? [],
        },
      },
      { upsert: true, new: true },
    );

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully! We will review your application and get back to you.",
      applicationId: String(assignment._id),
    });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this position",
      });
    }
    console.error("Error submitting public application:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export { getPublicJobs, getPublicJobById, submitPublicApplication };
