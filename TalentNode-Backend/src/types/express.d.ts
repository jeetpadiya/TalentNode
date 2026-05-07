import type { IUserRole, JwtUserPayload } from "./types.js";

declare global {
    namespace Express {
        interface Request {
            user?: JwtUserPayload;
        }
    }
}

export {};
