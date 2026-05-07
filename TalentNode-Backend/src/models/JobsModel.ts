import mongoose, { Schema } from "mongoose";
import type { IJob } from "../types/types.js";

const JobsSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    workMode: {
      type: String,
      enum: ["remote", "onsite", "hybrid"],
      default: "onsite",
    },
    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "internship", "contract"],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ["junior", "mid", "senior", "lead"],
      default: "junior",
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    niceToHave: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    salaryMin: {
      type: Number,
      min: 0,
    },
    salaryMax: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    openings: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ["draft", "open", "paused", "closed", "archived"],
      default: "draft",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    applicationDeadline: {
      type: Date,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hiringManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const JobsModel = mongoose.model<IJob>("Job", JobsSchema);

export default JobsModel;
