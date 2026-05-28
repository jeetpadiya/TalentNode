import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import type { UserRole } from "../../types/types";
import { hasAnyRole } from "../auth/rbac";

type RequireRoleProps = {
  allowed: readonly UserRole[];
  redirectTo?: string;
};

const RequireRole = ({ allowed, redirectTo = "/forbidden" }: RequireRoleProps) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasAnyRole(user.role, allowed)) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default RequireRole;

