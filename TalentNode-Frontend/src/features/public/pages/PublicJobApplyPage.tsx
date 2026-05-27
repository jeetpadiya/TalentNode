import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, MapPin, Clock, Briefcase, Calendar, ChevronRight } from "lucide-react";

import type { PublicJobDetailResponse } from "../services/publicPortalApi";
import {
  getPublicJobById,
  submitPublicApplication,
} from "../services/publicPortalApi";

import PublicApplicationForm from "../components/PublicApplicationForm";
import PublicJobsBoardPreview from "../components/PublicJobsBoardPreview";

export default function PublicJobApplyPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobDetail, setJobDetail] = useState<PublicJobDetailResponse | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getPublicJobById(String(jobId ?? ""));
        setJobDetail(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) run();
  }, [jobId]);

  const org = useMemo(() => jobDetail?.organization, [jobDetail]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-sm font-medium text-slate-500">Loading position details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full rounded-2xl border border-red-100 bg-white p-8 text-center shadow-xl shadow-red-100/50">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load job</h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-gray-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            onClick={() => navigate(-1)}
          >
            Go back to jobs
          </button>
        </div>
      </div>
    );
  }

  if (!jobDetail) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Bar */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={() => navigate(`/public/${org?.slug}/jobs`)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all roles
            </button>
            {org?.logoUrl && (
              <img src={org.logoUrl} alt={org.name} className="h-8 w-8 rounded-lg object-cover" />
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 lg:mt-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          
          {/* Left Column: Job Details */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* Job Header */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-medium text-blue-600">
                <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1">
                  <Building2 className="h-4 w-4" />
                  {org?.name}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{jobDetail.job.department ? jobDetail.job.department.split('|').pop() : "General"}</span>
              </div>
              
              <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl mb-6">
                {jobDetail.job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {jobDetail.job.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{jobDetail.job.location}</span>
                  </div>
                )}
                {jobDetail.job.workMode && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="capitalize">{jobDetail.job.workMode}</span>
                  </div>
                )}
                {jobDetail.job.employmentType && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span className="capitalize">{jobDetail.job.employmentType.replace('_', ' ')}</span>
                  </div>
                )}
              </div>

              {jobDetail.job.applicationDeadline && (
                <div className="mt-6 flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm font-medium text-orange-800 border border-orange-100">
                  <Calendar className="h-4 w-4" />
                  Apply before {new Date(jobDetail.job.applicationDeadline).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              )}
            </div>

            {/* Description & Responsibilities */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm space-y-8">
              {jobDetail.job.description && (
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About the role</h2>
                  <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed">
                    {jobDetail.job.description.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-4 last:mb-0">{paragraph}</p>
                    ))}
                  </div>
                </section>
              )}

              {(jobDetail.job.responsibilities?.length ?? 0) > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">What you'll do</h2>
                  <ul className="space-y-3">
                    {jobDetail.job.responsibilities?.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-600">
                        <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-blue-500"></span>
                        <span className="leading-relaxed">{r}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {(jobDetail.job.requirements?.length ?? 0) > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">What we're looking for</h2>
                  <ul className="space-y-3">
                    {jobDetail.job.requirements?.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-600">
                        <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-indigo-500"></span>
                        <span className="leading-relaxed">{r}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>

          {/* Right Column: Application Form & Other Roles */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <div className="sticky top-24">
              <PublicApplicationForm
                jobDetail={jobDetail}
                onSubmit={async (payload: any) => {
                  const normalizedPayload = {
                    ...payload,
                    phone: payload.phone?.trim() || undefined,
                    location: payload.location?.trim() || undefined,
                    links: payload.links?.filter((l: any) => l.value?.trim()),
                  };

                  let finalPayload: any = normalizedPayload;

                  if (payload.resume) {
                    const formData = new FormData();
                    formData.append('name', normalizedPayload.name);
                    formData.append('email', normalizedPayload.email);
                    if (normalizedPayload.phone) formData.append('phone', normalizedPayload.phone);
                    if (normalizedPayload.location) formData.append('location', normalizedPayload.location);
                    
                    if (normalizedPayload.links && normalizedPayload.links.length > 0) {
                      formData.append('links', JSON.stringify(normalizedPayload.links));
                    }
                    if (normalizedPayload.customQuestionAnswers && normalizedPayload.customQuestionAnswers.length > 0) {
                      formData.append('customQuestionAnswers', JSON.stringify(normalizedPayload.customQuestionAnswers));
                    }

                    formData.append('resume', payload.resume);
                    finalPayload = formData;
                  }

                  await submitPublicApplication(
                    jobDetail.job.id,
                    finalPayload,
                  );
                }}
              />
              
              <div className="mt-6">
                <PublicJobsBoardPreview
                  orgSlug={String(org?.slug ?? "")}
                  currentJobId={jobDetail.job.id}
                  maxJobs={3}
                />
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
