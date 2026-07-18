import type { PortfolioReport, WorkRecord } from "@/types/work";

export function fallbackPortfolio(records: WorkRecord[]): PortfolioReport {
  const skillCounts = records.reduce<Record<string, number>>((counts, record) => ({ ...counts, [record.jobType]: (counts[record.jobType] || 0) + 1 }), {});
  const topSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).map(([skill]) => skill).slice(0, 4);
  const verified = records.filter((record) => record.verificationStatus === "Verified").length;
  const totalEarnings = records.reduce((total, record) => total + record.wage, 0);
  const averageEarnings = records.length ? Math.round(totalEarnings / records.length) : 0;
  const state = records.find((record) => record.state)?.state || records.find((record) => record.location)?.location || "the worker's state";
  const occupation = topSkills[0] || "the recorded occupation";
  return {
    professionalSummary: records.length ? `${records[0].workerName} has recorded ${records.length} completed job${records.length === 1 ? "" : "s"} in ${topSkills[0] || "their chosen trade"}, with average earnings of ₹${averageEarnings.toLocaleString("en-IN")} per recorded job.` : "Start recording completed jobs to generate a professional portfolio summary.",
    topSkills,
    experienceLevel: records.length >= 20 ? "Established professional" : records.length >= 8 ? "Experienced worker" : records.length >= 3 ? "Developing professional" : records.length ? "Building experience" : "Not assessed yet",
    reliabilitySummary: records.length ? `${records.length} job${records.length === 1 ? " has" : "s have"} been recorded. ${verified} record${verified === 1 ? " is" : "s are"} marked verified.` : "Reliability will be assessed as your work history grows.",
    careerGrowthSuggestions: ["Keep recording completed jobs consistently", "Add certificates and supporting documents", "Request contractor endorsements when available"],
    potentialWelfareSchemes: [
      `e-Shram — ${occupation} work and the recorded location (${state}) suggest the worker may wish to explore unorganised-worker registration and linked social-security services.`,
      `State / UT labour welfare board — ${occupation} workers may have state-specific welfare-board options; check the applicable board in ${state}.`,
      "PM-SYM pension scheme — workers who meet its age, income and social-security conditions may wish to check the voluntary pension option.",
    ],
    potentialInsurancePlans: [
      "PMSBY accident cover — workers with a bank account who meet its conditions may wish to check the annual personal-accident cover.",
      "PMJJBY life cover — eligible bank-account holders may wish to ask their bank about the annual term-life option.",
      "Occupation-appropriate accident or health cover — compare protection needs, exclusions and premiums before choosing a policy.",
    ],
    potentialLoanReadinessSummary: records.length ? "This work passport can be shared as supporting documentation when applying for a loan: it summarizes recorded work, earnings and verified jobs. A lender will still make its own eligibility, affordability and credit decision; this is not an approval or guarantee." : "Record jobs and earnings over time to create supporting documentation you may choose to include in a future loan application. Lenders make the final decision.",
    source: "fallback",
  };
}

export function sanitizePortfolio(value: Partial<PortfolioReport>, fallback: PortfolioReport): PortfolioReport {
  const array = (items: unknown, fallbackItems: string[]) => Array.isArray(items) ? items.filter((item): item is string => typeof item === "string").slice(0, 6) : fallbackItems;
  return {
    professionalSummary: typeof value.professionalSummary === "string" ? value.professionalSummary : fallback.professionalSummary,
    topSkills: array(value.topSkills, fallback.topSkills),
    experienceLevel: typeof value.experienceLevel === "string" ? value.experienceLevel : fallback.experienceLevel,
    reliabilitySummary: typeof value.reliabilitySummary === "string" ? value.reliabilitySummary : fallback.reliabilitySummary,
    careerGrowthSuggestions: array(value.careerGrowthSuggestions, fallback.careerGrowthSuggestions),
    potentialWelfareSchemes: array(value.potentialWelfareSchemes, fallback.potentialWelfareSchemes),
    potentialInsurancePlans: array(value.potentialInsurancePlans, fallback.potentialInsurancePlans),
    potentialLoanReadinessSummary: typeof value.potentialLoanReadinessSummary === "string" ? value.potentialLoanReadinessSummary : fallback.potentialLoanReadinessSummary,
    source: "ai",
  };
}
