import type { PublicJob } from "../services/publicPortalApi";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, Clock, IndianRupee, ArrowRight } from "lucide-react";

export default function PublicJobCard({ job }: { job: PublicJob }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600 mb-3 truncate max-w-full">
            {job.department ? job.department.split('|').pop() : "General"}
          </div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {job.title}
          </h3>
          
          <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500">
            {job.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
            )}
            {job.employmentType && (
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                <span className="capitalize">{job.employmentType.replace('_', ' ')}</span>
              </div>
            )}
            {job.workMode && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="capitalize">{job.workMode}</span>
              </div>
            )}
            {(job.salaryMin || job.salaryMax) && (
              <div className="flex items-center gap-1">
                <IndianRupee className="h-4 w-4" />
                <span>
                  {job.salaryMin ? job.salaryMin : ""}
                  {job.salaryMin && job.salaryMax ? " - " : ""}
                  {job.salaryMax ? job.salaryMax : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end justify-between shrink-0">
          {job.applicationDeadline && (
            <span className="mb-4 text-xs font-medium text-orange-500 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100">
              Apply by {new Date(job.applicationDeadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
          <Link
            to={`/public/jobs/${job.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Apply Now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
