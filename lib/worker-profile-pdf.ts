"use client";

import { jsPDF } from "jspdf";
import type { PortfolioReport, WorkRecord } from "@/types/work";

const navy: [number, number, number] = [15, 45, 105];
const blue: [number, number, number] = [37, 99, 235];
const slate: [number, number, number] = [51, 65, 85];
const muted: [number, number, number] = [100, 116, 139];

function money(value: number) { return `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`; }
function date(value: string) { return value ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "-"; }
function truncate(value: string, max: number) { return value.length > max ? `${value.slice(0, max - 1)}...` : value; }

export function downloadWorkerProfilePdf({ records, portfolio }: { records: WorkRecord[]; portfolio: PortfolioReport | null }) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const worker = records[0];
  const totalEarnings = records.reduce((total, record) => total + record.wage, 0);
  const averageEarnings = records.length ? totalEarnings / records.length : 0;
  const verified = records.filter((record) => record.verificationStatus === "Verified").length;
  const skills = portfolio?.topSkills.length ? portfolio.topSkills : [...new Set(records.map((record) => record.jobType))].slice(0, 5);

  pdf.setFillColor(...navy); pdf.rect(0, 0, 210, 48, "F");
  pdf.setFillColor(...blue); pdf.circle(188, 12, 25, "F");
  pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.text("KAI WORK PASSPORT", 15, 13);
  pdf.setFontSize(22); pdf.text(worker?.workerName || "Worker profile", 15, 24);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.text(worker ? `Worker ID: ${worker.workerId}  |  Primary skill: ${worker.jobType}` : "Professional work profile", 15, 32);
  pdf.setFontSize(8); pdf.text("Prepared from self-recorded Kai work history", 15, 39);

  const metricY = 56;
  const metrics = [["COMPLETED JOBS", String(records.length)], ["AVERAGE EARNINGS", money(averageEarnings)], ["VERIFIED JOBS", String(verified)], ["TRUST SCORE", worker?.verification ? `${worker.verification.trustScore}/100` : "-" ]];
  metrics.forEach(([label, value], index) => { const x = 15 + index * 46; pdf.setFillColor(246, 249, 255); pdf.roundedRect(x, metricY, 41, 19, 2, 2, "F"); pdf.setTextColor(...muted); pdf.setFont("helvetica", "bold"); pdf.setFontSize(6.5); pdf.text(label, x + 3, metricY + 6); pdf.setTextColor(...navy); pdf.setFontSize(11); pdf.text(value, x + 3, metricY + 14); });

  let y = 84;
  const section = (title: string) => { pdf.setDrawColor(219, 234, 254); pdf.line(15, y, 195, y); y += 6; pdf.setTextColor(...blue); pdf.setFont("helvetica", "bold"); pdf.setFontSize(7.5); pdf.text(title.toUpperCase(), 15, y); y += 4; };
  const paragraph = (text: string, maxLines = 3) => { pdf.setTextColor(...slate); pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5); const lines = pdf.splitTextToSize(text, 180).slice(0, maxLines); pdf.text(lines, 15, y); y += lines.length * 4.2 + 4; };

  section("Professional summary");
  paragraph(portfolio?.professionalSummary || "This profile will develop as completed work records are added to Kai.");

  section("Skills, experience and reliability");
  pdf.setTextColor(...slate); pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.text("Top skills", 15, y); pdf.setFont("helvetica", "normal"); pdf.text(skills.length ? skills.join("  |  ") : "Not recorded yet", 43, y); y += 5;
  pdf.setFont("helvetica", "bold"); pdf.text("Experience", 15, y); pdf.setFont("helvetica", "normal"); pdf.text(portfolio?.experienceLevel || (records.length ? "Building experience" : "Not assessed yet"), 43, y); y += 5;
  pdf.setFont("helvetica", "bold"); pdf.text("Reliability", 15, y); pdf.setFont("helvetica", "normal"); const reliability = pdf.splitTextToSize(portfolio?.reliabilitySummary || "Reliability will be assessed as work history grows.", 150).slice(0, 2); pdf.text(reliability, 43, y); y += reliability.length * 4.2 + 4;

  section("Work history");
  pdf.setFillColor(248, 250, 252); pdf.rect(15, y, 180, 7, "F"); pdf.setTextColor(...muted); pdf.setFont("helvetica", "bold"); pdf.setFontSize(6.5); pdf.text("JOB / SKILL", 18, y + 4.5); pdf.text("CONTRACTOR", 74, y + 4.5); pdf.text("DATE", 123, y + 4.5); pdf.text("EARNINGS", 151, y + 4.5); pdf.text("STATUS", 176, y + 4.5); y += 11;
  const history = records.slice(0, 5);
  if (!history.length) { pdf.setTextColor(...muted); pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.text("No completed jobs recorded yet.", 18, y + 2); y += 8; }
  history.forEach((record) => { pdf.setTextColor(...slate); pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.text(truncate(record.jobType, 27), 18, y); pdf.text(truncate(record.contractorName, 24), 74, y); pdf.text(date(record.date), 123, y); pdf.text(money(record.wage), 151, y); pdf.setTextColor(...(record.verificationStatus === "Verified" ? [5, 150, 105] as [number, number, number] : [180, 83, 9] as [number, number, number])); pdf.text(record.verificationStatus === "Verified" ? "Verified" : "Review", 176, y); y += 6; });
  y += 2;

  section("Portfolio notes");
  pdf.setTextColor(...slate); pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.text("Languages", 15, y); pdf.setFont("helvetica", "normal"); pdf.text("Not recorded", 43, y); y += 5;
  pdf.setFont("helvetica", "bold"); pdf.text("Contractor endorsements", 15, y); pdf.setFont("helvetica", "normal"); pdf.text("Not recorded", 52, y); y += 5;
  pdf.setFont("helvetica", "bold"); pdf.text("Career guidance", 15, y); pdf.setFont("helvetica", "normal"); pdf.text(truncate(portfolio?.careerGrowthSuggestions[0] || "Keep recording completed jobs consistently.", 95), 43, y); y += 7;
  pdf.setFillColor(255, 251, 235); pdf.roundedRect(15, y, 180, 17, 2, 2, "F"); pdf.setTextColor(120, 53, 15); pdf.setFont("helvetica", "bold"); pdf.setFontSize(7); pdf.text("LOAN APPLICATION SUPPORT", 18, y + 5); pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); const loanLines = pdf.splitTextToSize(portfolio?.potentialLoanReadinessSummary || "This profile may be used as supporting documentation when applying for a loan. Lenders make the final decision.", 174).slice(0, 2); pdf.text(loanLines, 18, y + 10);

  pdf.setDrawColor(226, 232, 240); pdf.line(15, 283, 195, 283); pdf.setTextColor(...muted); pdf.setFontSize(6.5); pdf.text("Generated by Kai - AI Work Passport. This profile is based on self-recorded data and is not a guarantee of employment, eligibility, insurance, or credit approval.", 15, 288);
  pdf.save(`kai-work-passport-${(worker?.workerName || "worker").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`);
}
