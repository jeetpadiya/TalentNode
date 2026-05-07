import express from "express";
import { createOrganization, getOrganizationById, getOrganizations } from "../controllers/OrganizationController.js";
import { authenticateToken } from "../middleware/UserMiddleware.js";

const router = express.Router();

router.post("/create", authenticateToken, createOrganization);
router.get("/", authenticateToken, getOrganizations);
router.get("/getorganization", authenticateToken, getOrganizations);
router.get("/:id", authenticateToken, getOrganizationById);

export default router;
