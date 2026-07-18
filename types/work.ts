export type VerificationStatus = "Verified" | "Pending review" | "Needs review";
export type JobStatus = "Pending Verification" | "Verified" | "Rejected" | "Needs Revision";

export interface VerificationHistoryEntry {
  action: "Approved" | "Rejected" | "Requested changes" | "Submitted";
  timestamp: string;
  contractorName: string;
  reason?: string;
}

export interface VerificationMetadata {
  verificationId?: string;
  verificationTimestamp?: string;
  contractorName: string;
  contractorCompany?: string;
  history: VerificationHistoryEntry[];
  contractorSubmittedDetails?: {
    wage: number;
    hoursWorked: number;
    location: string;
    date: string;
    description: string;
    submittedAt: string;
  };
  detailsMatched?: boolean;
}

export interface ContractorMessage {
  id: string;
  workerId: string;
  contractorName: string;
  question: string;
  createdAt: string;
}

export interface VerificationReport {
  summary: string;
  trustScore: number;
  consistencyScore: number;
  verificationStatus: VerificationStatus;
  fraudRisk: "Low" | "Medium" | "High";
  workerStrengths: string[];
  recommendation: string;
  careerSuggestions: string[];
  portfolioSummary: string;
  source: "ai" | "fallback";
}

export interface PortfolioReport {
  professionalSummary: string;
  topSkills: string[];
  experienceLevel: string;
  reliabilitySummary: string;
  careerGrowthSuggestions: string[];
  potentialWelfareSchemes: string[];
  potentialInsurancePlans: string[];
  potentialLoanReadinessSummary: string;
  source: "ai" | "fallback";
}

export interface WorkRecord {
  id: string;
  workerName: string;
  workerId: string;
  jobType: string;
  contractorName: string;
  wage: number;
  hoursWorked: number;
  location: string;
  state?: string;
  date: string;
  description: string;
  status: JobStatus;
  verificationStatus: VerificationStatus;
  verification: VerificationReport;
  verificationMetadata: VerificationMetadata;
  createdAt: string;
}

export interface JobFormValues {
  workerName: string;
  workerId: string;
  jobType: string;
  contractorName: string;
  wage: string;
  hoursWorked: string;
  location: string;
  date: string;
  description: string;
}
