import mongoose, { Schema } from "mongoose";
import { IUser } from "../types/types.js";




const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false, // Prevents password from being returned in queries by default
    },
    role: {
        type: String,
        enum: ["admin", "recruiter", "hiring_manager", "interviewer", "candidate"],
        default: "candidate",
    },
    // Logical separation for B2B multi-tenancy
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;