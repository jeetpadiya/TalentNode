/** Workforce roles within an organization (source of truth: OrganizationTeamMember). */
export type OrganizationMemberRole =
  | "admin"
  | "recruiter"
  | "hiring_manager"
  | "interviewer";

/** Verified JWT identity — not used for permission checks. */
export interface AuthIdentity {
  id: string;
  email: string;
}

/** Resolved organization scope for the current request. */
export interface OrganizationAuthContext {
  organizationId: string;
  role: OrganizationMemberRole;
}
