import type { UserRole } from "../../types/types";

export const ROLE_ORDER: UserRole[] = [
  "admin",
  "recruiter",
  "hiring_manager",
  "interviewer",
  "candidate",
];

export const hasAnyRole = (
  role: UserRole | null | undefined,
  allowed: readonly UserRole[],
) => {
  if (!role) return false;
  return allowed.includes(role);
};

// Common permissions (frontend visibility only; backend remains source of truth)
export const canAccessWorkspaceSettings = (role: UserRole | null | undefined) =>
  hasAnyRole(role, ["admin", "recruiter"]);

export const canManageOrganization = (role: UserRole | null | undefined) =>
  hasAnyRole(role, ["admin"]);

export const canManageRecruiting = (role: UserRole | null | undefined) =>
  hasAnyRole(role, ["admin", "recruiter"]);

export const canAccessHiringPipeline = (role: UserRole | null | undefined) =>
  hasAnyRole(role, ["admin", "recruiter", "hiring_manager", "interviewer"]);

