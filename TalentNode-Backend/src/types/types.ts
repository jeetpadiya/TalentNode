import mongoose, { Document } from "mongoose";

export type IUserRole = "admin" | "recruiter" | "hiring_manager" | "interviewer" | "candidate";

export interface JwtUserPayload {
    id: string;
    email: string;
    role: IUserRole;
    organizationId?: string | mongoose.Types.ObjectId | null;
    iat?: number;
    exp?: number;
}

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: IUserRole;
    organizationId?: mongoose.Types.ObjectId; // Optional for candidates
    createdAt: Date;
    updatedAt: Date;
}

// Request body types
export type RegisterRequestBody = {
    username?: string;
    email?: string;
    password?: string;
};

export type LoginRequestBody = {
    email?: string;
    password?: string;
};

export type CheckEmailRequestBody = {
    email?: string;
};

//organization types
export interface IOrganization extends Document {
    name: string;
    slug: string;
    description?: string;
    website?: string;
    allowedDomains: string[];
    logoUrl?: string;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateOrganizationRequestBody = {
    name?:string;
    slug?:string;
    description?: string;
    website?: string;
    allowedDomains?: string[];
    logoUrl?: string;
}

export interface IJob extends Document {
    title: string;
    department?: string;
    location?: string;
    workMode: "remote" | "onsite" | "hybrid";
    employmentType: "full_time" | "part_time" | "internship" | "contract";
    experienceLevel: "junior" | "mid" | "senior" | "lead";
    description: string;
    responsibilities: string[];
    requirements: string[];
    niceToHave: string[];
    skills: string[];
    tags: string[];
    salaryMin?: number;
    salaryMax?: number;
    currency: string;
    openings: number;
    status: "draft" | "open" | "paused" | "closed" | "archived";
    isPublished: boolean;
    publishedAt?: Date;
    applicationDeadline?: Date;
    organizationId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    hiringManagerId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateJobRequestBody = {
    title?: string;
    department?: string;
    location?: string;
    workMode?: "remote" | "onsite" | "hybrid";
    employmentType?: "full_time" | "part_time" | "internship" | "contract";
    experienceLevel?: "junior" | "mid" | "senior" | "lead";
    description?: string;
    responsibilities?: string[];
    requirements?: string[];
    niceToHave?: string[];
    skills?: string[];
    tags?: string[];
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    openings?: number;
    status?: "draft" | "open" | "paused" | "closed" | "archived";
    isPublished?: boolean;
    publishedAt?: string;
    applicationDeadline?: string;
    hiringManagerId?: string;
};

