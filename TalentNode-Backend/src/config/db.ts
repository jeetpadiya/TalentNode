import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.set("bufferCommands", false);

const ConnectDB = async ()=>{
    try {
        if(!process.env.MONGODB_URI){
            throw new Error("MONGODB_URI is not defined in environment variables");
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("MongoDB Connected successfully;");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1)
    }
}

export default ConnectDB;
