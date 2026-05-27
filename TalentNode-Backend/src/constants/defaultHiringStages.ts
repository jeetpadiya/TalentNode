/** Plain objects embedded on new jobs or backfilled legacy rows. */
export const DEFAULT_HIRING_STAGES = [
  { name: "Applied", order: 0 },
  { name: "Screening", order: 1 },
  { name: "Interview", order: 2 },
  { name: "Offer", order: 3 },
  // Terminal outcomes (recruiters close the ATS loop by moving to these)
  { name: "Hired", order: 4 },
  { name: "Rejected", order: 5 },
  { name: "Withdrawn", order: 6 },
] as const;

