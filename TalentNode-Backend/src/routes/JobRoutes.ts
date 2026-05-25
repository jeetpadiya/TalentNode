import express from "express";

import { createJob, getJobById, getJobs, updateJob } from "../controllers/JobController.js";
import { getApplicationForm, updateApplicationForm } from "../controllers/applicationFormController.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireActiveOrganization } from "../middleware/organizationContext.js";
import {
  addHiringTeamMemberForJob,
  getHiringTeamForJob,
  removeHiringTeamMemberForJob,
} from "../controllers/HiringTeamController.js";

const router = express.Router();

const withOrg = [authenticate, requireActiveOrganization] as const;

router.post("/", ...withOrg, createJob);
router.get("/", ...withOrg, getJobs);
router.get("/:jobId/application-form", ...withOrg, getApplicationForm);
router.put("/:jobId/application-form", ...withOrg, updateApplicationForm);
router.get("/:jobId/hiring-team", ...withOrg, getHiringTeamForJob);
router.post("/:jobId/hiring-team", ...withOrg, addHiringTeamMemberForJob);
router.delete(
  "/:jobId/hiring-team/:userId",
  ...withOrg,
  removeHiringTeamMemberForJob,
);
router.get("/:id", ...withOrg, getJobById);
router.put("/:id", ...withOrg, updateJob);

export default router;
