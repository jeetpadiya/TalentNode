import mongoose, { Schema, type Document } from "mongoose";
import type {IOrganization} from "../types/types.js";


const OrganizationSchema = new Schema<IOrganization>(
    {
        name: {
            type: String,
            required: [true, "Organization name is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, "Organization slug is required"],
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        website: {
            type: String,
            trim: true,
            lowercase: true,
        },
        allowedDomains: {
            type: [String],
            default: [],
        },
        logoUrl: {
            type: String,
            trim: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

OrganizationSchema.index({ createdBy: 1, slug: 1 }, { unique: true });

const OrganizationModel = mongoose.model<IOrganization>(
    "Organization",
    OrganizationSchema
);

export default OrganizationModel;
