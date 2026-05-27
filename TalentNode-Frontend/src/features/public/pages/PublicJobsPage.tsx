import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Building2, Sparkles, AlertCircle } from "lucide-react";

import type { PublicJob } from "../services/publicPortalApi";
import { getPublicJobsByOrgSlug } from "../services/publicPortalApi";
import PublicJobCard from "../components/PublicJobCard";

export default function PublicJobsPage() {
  const { slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [orgName, setOrgName] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getPublicJobsByOrgSlug(String(slug ?? ""));
        setJobs(res.jobs);
        setOrgName(res.organization.name);
        setLogoUrl(res.organization.logoUrl ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      run();
    }
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
        
        <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-24 lg:px-8 text-center">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={orgName}
              className="mx-auto h-20 w-20 rounded-2xl object-cover shadow-xl shadow-gray-200/50 ring-1 ring-gray-900/10 mb-8"
            />
          ) : (
            <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center shadow-xl shadow-blue-900/5 ring-1 ring-gray-900/10 mb-8">
              <Building2 className="h-10 w-10 text-blue-600" />
            </div>
          )}
          
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl mb-6">
            Join the team at <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{orgName || "us"}</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-600">
            Explore our open positions and find where you belong. We're looking for passionate individuals to help us build the future.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">Open Positions</h2>
          <span className="ml-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800">
            {jobs.length}
          </span>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="h-4 w-1/4 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2 mb-6">
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-3" />
            <h3 className="text-lg font-medium text-red-800 mb-1">Oops! Something went wrong</h3>
            <p className="text-red-600">{error}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No open positions</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              We don't have any open roles at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {jobs.map((job) => (
              <PublicJobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
