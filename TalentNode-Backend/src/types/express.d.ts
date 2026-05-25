import type { AuthIdentity, OrganizationAuthContext } from "../authorization/types.js";

declare global {
  namespace Express {
    interface Request {
      /** Verified identity from JWT (authentication only). */
      user?: AuthIdentity;
      /** Active or param-scoped organization + workforce role (authorization). */
      organization?: OrganizationAuthContext;
    }
  }
}

export {};
