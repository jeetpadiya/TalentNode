import { ArrowLeft, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";

type BackButtonProps = {
  /** When true, render as a close (X) button */
  variant?: "back" | "close";
  /** Optional label text (default: Back) */
  label?: string;
  /** Hide label on small screens */
  compact?: boolean;
  className?: string;
};

const BackButton = ({
  variant = "back",
  label,
  compact = true,
  className,
}: BackButtonProps) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { organizationId } = useParams();

  const orgId = organizationId ?? user?.organizationId ?? "";
  const fallback = orgId ? `/organizations/${orgId}/dashboard` : "/dashboard";

  const icon =
    variant === "close" ? (
      <X className="h-4 w-4" aria-hidden />
    ) : (
      <ArrowLeft className="h-4 w-4" aria-hidden />
    );

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      onAuxClick={() => navigate(-1)}
      className={[
        "btn btn-ghost",
        "border border-transparent hover:border-gray-200",
        className ?? "",
      ].join(" ")}
      aria-label={variant === "close" ? "Close" : "Go back"}
      title={variant === "close" ? "Close" : "Back"}
      // If history is empty in some cases, fallback is still reachable via keyboard shortcut
      onKeyDown={(e) => {
        if (e.key === "Escape") navigate(fallback);
      }}
    >
      {icon}
      <span className={compact ? "hidden sm:inline" : ""}>
        {label ?? (variant === "close" ? "Close" : "Back")}
      </span>
    </button>
  );
};

export default BackButton;

