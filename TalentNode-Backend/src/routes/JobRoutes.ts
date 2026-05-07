import express from "express";

import { createJob, getJobById, getJobs, updateJob } from "../controllers/JobController.js";
import { authenticateToken } from "../middleware/UserMiddleware.js";

const router = express.Router();

router.post("/create", authenticateToken, createJob);
router.get("/", authenticateToken, getJobs);
router.get("/:id", authenticateToken, getJobById);
router.put("/:id", authenticateToken, updateJob);

export default router;
