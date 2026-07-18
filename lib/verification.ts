import type { VerificationReport, VerificationStatus, WorkRecord } from "@/types/work";

export type WorkerVerificationInput = Omit<WorkRecord, "id" | "createdAt" | "verification" | "verificationStatus" | "status" | "verificationMetadata">;

export function fallbackVerification(input: Pick<WorkerVerificationInput, "workerName" | "jobType">): VerificationReport {
  return {
    summary: `${input.workerName}'s ${input.jobType} record has been saved and is ready for review.`,
    trustScore: 50,
    consistencyScore: 50,
    verificationStatus: "Pending review",
    fraudRisk: "Low",
    workerStrengths: ["Work record created", "Job details captured"],
    recommendation: "Add a supporting document or contractor endorsement when available.",
    careerSuggestions: ["Keep recording completed jobs", "Add relevant training certificates"],
    portfolioSummary: `${input.workerName} is building a professional portfolio in ${input.jobType}.`,
    source: "fallback",
  };
}

export function sanitizeVerification(value: Partial<VerificationReport>, fallback: VerificationReport): VerificationReport {
  const status: VerificationStatus = value.verificationStatus === "Verified" || value.verificationStatus === "Needs review" || value.verificationStatus === "Pending review" ? value.verificationStatus : fallback.verificationStatus;
  const fraudRisk = value.fraudRisk === "Low" || value.fraudRisk === "Medium" || value.fraudRisk === "High" ? value.fraudRisk : fallback.fraudRisk;
  return {
    summary: typeof value.summary === "string" ? value.summary : fallback.summary,
    trustScore: typeof value.trustScore === "number" && Number.isFinite(value.trustScore) ? Math.max(0, Math.min(100, Math.round(value.trustScore))) : fallback.trustScore,
    consistencyScore: typeof value.consistencyScore === "number" && Number.isFinite(value.consistencyScore) ? Math.max(0, Math.min(100, Math.round(value.consistencyScore))) : fallback.consistencyScore,
    verificationStatus: status,
    fraudRisk,
    workerStrengths: Array.isArray(value.workerStrengths) ? value.workerStrengths.filter((item): item is string => typeof item === "string").slice(0, 5) : fallback.workerStrengths,
    recommendation: typeof value.recommendation === "string" ? value.recommendation : fallback.recommendation,
    careerSuggestions: Array.isArray(value.careerSuggestions) ? value.careerSuggestions.filter((item): item is string => typeof item === "string").slice(0, 5) : fallback.careerSuggestions,
    portfolioSummary: typeof value.portfolioSummary === "string" ? value.portfolioSummary : fallback.portfolioSummary,
    source: "ai",
  };
}
