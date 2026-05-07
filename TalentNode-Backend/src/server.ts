import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv'
import ConnectDB from './config/db.js';
import userRoutes from './routes/UserRoutes.js';
import organizationRoutes from './routes/OrganizationRoutes.js';
import jobRoutes from './routes/JobRoutes.js';
dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
    return res.status(200).json({ message: "Server is healthy" });
});

app.use('/api/users',userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/jobs', jobRoutes);


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
