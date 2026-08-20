import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { useOrganizationStore } from "../store/OrganizationStore";
import { getJobById } from "../../features/jobs/services/JobServices";

type Crumb = { label: string; href?: string };

const prettyLabel = (value: string) =>
  value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const Breadcrumbs = () => {
  const { organizationId, jobId } = useParams();
  const location = useLocation();
  const accessToken = useAuthStore((s) => s.accessToken);
  const fetchOrganization = useOrganizationStore((s) => s.fetchOrganization);
  const currentOrganization = useOrganizationStore((s) => s.currentOrganization);

  const [orgName, setOrgName] = useState<string>("");
  const [jobTitle, setJobTitle] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    if (!accessToken || !organizationId) return;

    if (currentOrganization && currentOrganization.id === organizationId) {
      setOrgName(currentOrganization.name);
      return;
    }

    void (async () => {
      try {
        const org = await fetchOrganization(organizationId, accessToken);
        if (!isMounted) return;
        setOrgName(org?.name ?? "");
      } catch {
        if (!isMounted) return;
        setOrgName("");
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [accessToken, organizationId, fetchOrganization, currentOrganization]);

  useEffect(() => {
    let isMounted = true;
    if (!accessToken || !jobId) return;

    void (async () => {
      try {
        const job = await getJobById(jobId, accessToken);
        if (!isMounted) return;
        setJobTitle(job.title ?? "");
      } catch {
        if (!isMounted) return;
        setJobTitle("");
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [accessToken, jobId]);

  const crumbs = useMemo<Crumb[]>(() => {
    if (!organizationId) return [];

    const path = location.pathname;
    const base = `/organizations/${organizationId}`;
    const rel = path.startsWith(base) ? path.slice(base.length) : "";
    const parts = rel.split("/").filter(Boolean);

    const c: Crumb[] = [
      { label: "Organizations", href: "/organizations" },
      { label: orgName || "Workspace", href: `${base}/dashboard` },
    ];

    const section = parts[0];
    if (!section) return c;

    // Jobs section
    if (section === "jobs") {
      c.push({ label: "Jobs", href: `${base}/jobs` });
      const maybeJobId = parts[1];
      if (maybeJobId) {
        c.push({ label: jobTitle || "Job", href: `${base}/jobs/${maybeJobId}/setup` });
        const sub = parts[2];
        if (sub && sub !== "setup") {
          c.push({ label: prettyLabel(sub) });
        }
      }
      return c;
    }

    // Applications section
    if (section === "applications") {
      c.push({ label: "Applications", href: `${base}/applications` });
      if (parts[1]) c.push({ label: "Details" });
      return c;
    }

    // Candidates section
    if (section === "candidates") {
      c.push({ label: "Candidates", href: `${base}/candidates` });
      return c;
    }

    // Settings section
    if (section === "settings") {
      c.push({ label: "Settings", href: `${base}/settings` });
      if (parts[1]) c.push({ label: prettyLabel(parts[1]) });
      return c;
    }

    // Dashboard and other sections
    c.push({ label: prettyLabel(section), href: `${base}/${section}` });
    return c;
  }, [location.pathname, organizationId, orgName, jobTitle]);

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
      <ol className="flex flex-wrap items-center gap-2">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${idx}`} className="flex items-center gap-2">
              {crumb.href && !isLast ? (
                <Link to={crumb.href} className="hover:text-gray-900 hover:underline">
                  {crumb.label}
                </Link>
              ) : (
                <span className={isLast ? "font-medium text-gray-900" : ""}>
                  {crumb.label}
                </span>
              )}
              {!isLast ? <span className="text-gray-300">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

