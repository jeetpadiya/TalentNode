import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv'
import ConnectDB from './config/db.js';
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


dotenv.config();



const app = express();

app.use(cors());
app.use(express.json());

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
