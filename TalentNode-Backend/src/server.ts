import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv'
import ConnectDB from './config/db.js';
import rateLimit from "express-rate-limit";
import userRoutes from './routes/UserRoutes.js';
import organizationRoutes from './routes/OrganizationRoutes.js';
import jobRoutes from './routes/JobRoutes.js';
import candidate from './routes/CandidateRoutes.js';
import applicationRoutes from './routes/CandidateApplicationRoutes.js';
import jobCandidateAssignmentRoutes from './routes/jobCandidateAssignmentRoutes.js';
import HiringStageRoute from './routes/HiringStageRoute.js'
import userPreferencesRoutes from './routes/UserPreferencesRoutes.js'
import messageTemplateRoutes from './routes/MessageTemplateRoutes.js'
import reviewTemplateRoutes from './routes/ReviewTemplateRoutes.js'
import jobCategoryRoutes from './routes/JobCategoryRoutes.js'
import publicJobRoutes from './routes/PublicJobRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'


dotenv.config();




const app = express();

const rawOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Dev-safe defaults (Vite + common local ports)
const defaultDevOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://talent-node-eo9siuxy4-jeet-padias-projects.vercel.app",
];

const allowedOrigins =
  rawOrigins.length > 0 ? rawOrigins : (process.env.NODE_ENV === "production" ? [] : defaultDevOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (no Origin header)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(new Error("CORS_ORIGIN_NOT_ALLOWED"));
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS_ORIGIN_NOT_ALLOWED"));
    },
    credentials: true,
  }),
);
app.use(express.json());

// Rate limit public endpoints (abuse protection)
app.use(
  "/api/public",
  rateLimit({
    windowMs: Number(process.env.PUBLIC_RATE_LIMIT_WINDOW_MS ?? 15 * 60_000),
    max: Number(process.env.PUBLIC_RATE_LIMIT_MAX ?? 120),
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." },
  }),
);

app.get('/api/health', (_req, res) => {
    return res.status(200).json({ message: "Server is healthy" });
});

app.use('/api/users', userRoutes);
app.use('/api/user', userPreferencesRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/jobs', applicationRoutes);
app.use('/api/jobs', jobCandidateAssignmentRoutes);
app.use('/api/jobs', HiringStageRoute);
app.use('/api/candidates', candidate);
app.use('/api/organizations/:organizationId/message-templates', messageTemplateRoutes);
app.use('/api/organizations/:organizationId/review-templates', reviewTemplateRoutes);
app.use('/api/organizations/:organizationId/job-categories', jobCategoryRoutes);
app.use('/api/public', publicJobRoutes);

// Central error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;


const startServer = async () => {
    try {
        await ConnectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
