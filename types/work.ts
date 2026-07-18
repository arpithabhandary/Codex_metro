export type VerificationStatus = "Verified" | "Pending review" | "Needs review";

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
  verificationStatus: VerificationStatus;
  verification: VerificationReport;
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
