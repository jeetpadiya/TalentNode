import express from "express";

import { createJob, getJobById, getJobs, updateJob, updateJobStatus, updateJobPublish } from "../controllers/JobController.js";
import {
  createCustomQuestion,
  deleteCustomQuestion,
  getApplicationForm,
  updateApplicationForm,
  updateCustomQuestion,
} from "../controllers/applicationFormController.js";
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
router.post("/:jobId/application-form/custom-questions", ...withOrg, createCustomQuestion);
router.put(
  "/:jobId/application-form/custom-questions/:questionKey",
  ...withOrg,
  updateCustomQuestion,
);
router.delete(
  "/:jobId/application-form/custom-questions/:questionKey",
  ...withOrg,
  deleteCustomQuestion,
);
router.get("/:jobId/hiring-team", ...withOrg, getHiringTeamForJob);
router.post("/:jobId/hiring-team", ...withOrg, addHiringTeamMemberForJob);
router.delete(
  "/:jobId/hiring-team/:userId",
  ...withOrg,
  removeHiringTeamMemberForJob,
);
router.get("/:id", ...withOrg, getJobById);
router.put("/:id", ...withOrg, updateJob);
router.patch("/:id/status", ...withOrg, updateJobStatus);
router.patch("/:id/publish", ...withOrg, updateJobPublish);

export default router;
