import { NextRequest, NextResponse } from "next/server";
import { fallbackPortfolio, sanitizePortfolio } from "@/lib/portfolio";
import type { WorkRecord } from "@/types/work";

export const runtime = "nodejs";

const schema = {
  type: "object", additionalProperties: false,
  properties: {
    professionalSummary: { type: "string" }, topSkills: { type: "array", items: { type: "string" } }, experienceLevel: { type: "string" }, reliabilitySummary: { type: "string" }, careerGrowthSuggestions: { type: "array", items: { type: "string" } }, potentialWelfareSchemes: { type: "array", items: { type: "string" } }, potentialInsurancePlans: { type: "array", items: { type: "string" } }, potentialLoanReadinessSummary: { type: "string" },
  },
  required: ["professionalSummary", "topSkills", "experienceLevel", "reliabilitySummary", "careerGrowthSuggestions", "potentialWelfareSchemes", "potentialInsurancePlans", "potentialLoanReadinessSummary"],
};

function isWorkHistory(value: unknown): value is WorkRecord[] { return Array.isArray(value) && value.every((item) => item && typeof item === "object" && typeof (item as WorkRecord).workerName === "string" && typeof (item as WorkRecord).jobType === "string" && typeof (item as WorkRecord).wage === "number"); }

export async function POST(request: NextRequest) {
  let records: WorkRecord[];
  try { const body = await request.json(); records = body.records; } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
  if (!isWorkHistory(records)) return NextResponse.json({ error: "A valid work history is required" }, { status: 400 });
  const history = records.slice(0, 100);
  const fallback = fallbackPortfolio(history);
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) return NextResponse.json({ portfolio: fallback, fallback: true, reason: "GROK_API_KEY is not configured" });
  const completedJobs = history.length;
  const averageEarnings = completedJobs ? Math.round(history.reduce((sum, item) => sum + item.wage, 0) / completedJobs) : 0;
  const verificationRate = completedJobs ? Math.round((history.filter((item) => item.verificationStatus === "Verified").length / completedJobs) * 100) : 0;
  const skills = [...new Set(history.map((item) => item.jobType))];
  const contractors = [...new Set(history.map((item) => item.contractorName))];
  const state = history.find((item) => item.state)?.state || history.find((item) => item.location)?.location || "Not recorded";
  const firstDate = history.map((item) => item.date).filter(Boolean).sort()[0];
  const yearsExperience = firstDate ? Math.max(0, Math.round(((Date.now() - new Date(`${firstDate}T00:00:00`).getTime()) / 31_557_600_000) * 10) / 10) : 0;
  const prompt = `Create a careful professional work-portfolio summary from this entire informal-worker history. Do not claim eligibility, insurance approval, loan approval, or independently verified facts. Make every welfare and insurance suggestion conditional and informational. Each potentialWelfareSchemes item must name a relevant Indian scheme or state/UT labour welfare board and explain why this specific profile may wish to explore it. Do not invent state programmes. The loan-readiness summary must say the portfolio can be used as supporting documentation when applying, but the lender makes the final decision.\n\nDerived worker profile: occupation(s): ${skills.join(", ") || "Not recorded"}; state/location: ${state}; completed jobs: ${completedJobs}; average earnings per recorded job: ₹${averageEarnings}; years of recorded experience: ${yearsExperience}; verified jobs: ${history.filter((item) => item.verificationStatus === "Verified").length}; verification rate: ${verificationRate}%; contractor history: ${contractors.join(", ") || "Not recorded"}.\n\nFull work history:\n${JSON.stringify(history)}`;
  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: process.env.GROK_MODEL || "grok-4.5", temperature: 0.2, response_format: { type: "json_schema", json_schema: { name: "worker_portfolio", strict: true, schema } }, messages: [{ role: "system", content: "You are a cautious career portfolio analyst. Base every statement only on the supplied work history. Do not make financial, insurance, legal, or welfare eligibility determinations." }, { role: "user", content: prompt }] }), signal: AbortSignal.timeout(25_000) });
    if (!response.ok) throw new Error(`xAI request failed with ${response.status}`);
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("xAI returned no content");
    return NextResponse.json({ portfolio: sanitizePortfolio(JSON.parse(content), fallback), fallback: false });
  } catch (error) {
    console.error("Portfolio generation request failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ portfolio: fallback, fallback: true, reason: "AI portfolio generation is temporarily unavailable" });
  }
}
