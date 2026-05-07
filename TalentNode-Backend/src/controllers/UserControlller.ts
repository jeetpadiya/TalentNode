import type { Request, Response } from "express";
import type { IUser } from "../types/types.js";
import UserModel from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
    checkUserEmailSchema,
    loginUserSchema,
    registerUserSchema,
} from "../validations/authSchemas.js";

const formatZodErrors = (issues: Array<{ path: PropertyKey[]; message: string }>) =>
    issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
    }));

const signUserToken = (user: IUser) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId ?? null
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
};

const registerUser = async (
    req: Request,
    res: Response
) => {
    try {
        const parsedBody = registerUserSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: formatZodErrors(parsedBody.error.issues),
            });
        }

        const { username, email, password } = parsedBody.data;

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Public registration creates candidate accounts only.
        const newUser = await UserModel.create({
            username,
            email,
            password: hashedPassword,
            role: "candidate"
        });

        const token = signUserToken(newUser);

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                organizationId: newUser.organizationId ?? null
            }
        });
    } catch (error: unknown) {
        console.error("Error registering user:", error);

        if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        return res.status(500).json({ message: "Server error" });
    }
};


const loginUser = async (
    req: Request,
    res: Response
) => {
    try {
        const parsedBody = loginUserSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: formatZodErrors(parsedBody.error.issues),
            });
        }

        const { email, password } = parsedBody.data;

        const existingUser = await UserModel.findOne({ email }).select("+password");

        if (!existingUser) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = signUserToken(existingUser);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: existingUser._id,
                username: existingUser.username,
                email: existingUser.email,
                role: existingUser.role,
                organizationId: existingUser.organizationId ?? null
            }
        });
    } catch (error: unknown) {
        console.error("Error logging in user:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
const getUserProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await UserModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "User profile fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId ?? null,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error: unknown) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


const checkUserEmail = async (
    req: Request,
    res: Response
) => {
    try {
        const parsedBody = checkUserEmailSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: formatZodErrors(parsedBody.error.issues),
            });
        }

        const { email } = parsedBody.data;

        const existingUser = await UserModel.findOne({ email }).select("_id email");
        const exists = Boolean(existingUser);

        return res.status(200).json({
            message: exists ? "Email already exists" : "Email is available",
            exists,
            nextStep: exists ? "login" : "signup"
        });
    } catch (error: unknown) {
        console.error("Error checking user email:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export { registerUser, loginUser, getUserProfile, checkUserEmail };
