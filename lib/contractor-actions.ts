import { fallbackPortfolio } from "@/lib/portfolio";
import { fallbackVerification } from "@/lib/verification";
import type { PortfolioReport, VerificationReport, WorkRecord } from "@/types/work";

export const RECORDS_STORAGE_KEY = "kai-work-records";
export const PORTFOLIO_STORAGE_KEY = "kai-portfolio-summary";

function verifiedHistory(records: WorkRecord[], recordId?: string) {
  return records.filter((record) => record.status === "Verified" && record.id !== recordId);
}

export async function approveWorkRecord(record: WorkRecord, allRecords: WorkRecord[]): Promise<WorkRecord> {
  const timestamp = new Date().toISOString();
  const sequence = allRecords.filter((item) => item.verificationMetadata?.verificationId).length + 1;
  const verificationId = `KAI-${new Date().getFullYear()}-${String(sequence).padStart(5, "0")}`;
  const worker = { workerName: record.workerName, workerId: record.workerId, jobType: record.jobType, contractorName: record.contractorName, wage: record.wage, hoursWorked: record.hoursWorked, location: record.location, state: record.state, date: record.date, description: record.description };
  let verification = fallbackVerification(worker);
  try {
    const response = await fetch("/api/verify-worker", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ worker, previousWorkHistory: verifiedHistory(allRecords, record.id), contractorVerification: { contractorName: record.contractorName, verificationTimestamp: timestamp, verificationId } }) });
    if (response.ok) { const payload = await response.json() as { verification?: VerificationReport }; if (payload.verification) verification = payload.verification; }
  } catch { /* The fallback verification keeps the contractor workflow available. */ }
  const status: WorkRecord["status"] = verification.verificationStatus === "Needs review" ? "Needs Revision" : "Verified";
  return { ...record, status, verificationStatus: verification.verificationStatus, verification, verificationMetadata: { ...record.verificationMetadata, verificationId, verificationTimestamp: timestamp, contractorName: record.contractorName, contractorCompany: record.contractorName, history: [...(record.verificationMetadata?.history || []), { action: "Approved" as const, timestamp, contractorName: record.contractorName, reason: status === "Needs Revision" ? "AI fraud check flagged this record for manual review." : undefined }] } };
}

export function updateWorkRecordStatus(record: WorkRecord, action: "Rejected" | "Requested changes", reason: string) {
  const timestamp = new Date().toISOString();
  return { ...record, status: action === "Rejected" ? "Rejected" as const : "Needs Revision" as const, verificationMetadata: { ...record.verificationMetadata, contractorName: record.contractorName, history: [...(record.verificationMetadata?.history || []), { action, timestamp, contractorName: record.contractorName, reason }] } };
}

export async function refreshVerifiedPortfolio(records: WorkRecord[]) {
  const trustedRecords = verifiedHistory(records);
  let portfolio = fallbackPortfolio(trustedRecords);
  try {
    const response = await fetch("/api/generate-portfolio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ records: trustedRecords }) });
    if (response.ok) { const payload = await response.json() as { portfolio?: PortfolioReport }; if (payload.portfolio) portfolio = payload.portfolio; }
  } catch { /* Fallback remains available. */ }
  window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolio));
  return portfolio;
}

export function persistRecords(records: WorkRecord[]) {
  window.localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event("kai-work-records-updated"));
}
