import { NextRequest, NextResponse } from "next/server";
import { fallbackVerification, sanitizeVerification } from "@/lib/verification";
import type { WorkerVerificationInput } from "@/lib/verification";

export const runtime = "nodejs";

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    trustScore: { type: "number", minimum: 0, maximum: 100 },
    consistencyScore: { type: "number", minimum: 0, maximum: 100 },
    verificationStatus: { type: "string", enum: ["Verified", "Pending review", "Needs review"] },
    fraudRisk: { type: "string", enum: ["Low", "Medium", "High"] },
    workerStrengths: { type: "array", items: { type: "string" } },
    recommendation: { type: "string" },
    careerSuggestions: { type: "array", items: { type: "string" } },
    portfolioSummary: { type: "string" },
  },
  required: ["summary", "trustScore", "consistencyScore", "verificationStatus", "fraudRisk", "workerStrengths", "recommendation", "careerSuggestions", "portfolioSummary"],
};

function isVerificationInput(value: unknown): value is WorkerVerificationInput {
  if (!value || typeof value !== "object") return false;
  const input = value as Record<string, unknown>;
  return typeof input.workerName === "string" && typeof input.workerId === "string" && typeof input.jobType === "string" && typeof input.contractorName === "string" && typeof input.wage === "number" && typeof input.hoursWorked === "number" && typeof input.location === "string" && typeof input.date === "string" && typeof input.description === "string";
}

export async function POST(request: NextRequest) {
  let body: { worker?: WorkerVerificationInput; previousWorkHistory?: WorkerVerificationInput[]; contractorVerification?: { contractorName?: string; verificationTimestamp?: string; verificationId?: string } };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
  if (!isVerificationInput(body.worker)) return NextResponse.json({ error: "Missing or invalid worker information" }, { status: 400 });

  const fallback = fallbackVerification(body.worker);
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) return NextResponse.json({ verification: fallback, fallback: true, reason: "GROK_API_KEY is not configured" });

  const history = Array.isArray(body.previousWorkHistory) ? body.previousWorkHistory.slice(0, 25) : [];
  const prompt = `Analyze this contractor-approved informal worker work record for a digital work passport. Do not claim independent verification beyond the supplied contractor confirmation. Assess only the completeness and consistency of the information provided. Look for duplicate jobs, impossible hours, repeated fake submissions, and unrealistic contractor approvals. If suspicious, set verificationStatus to "Needs review"; otherwise use "Verified". Return the required JSON only.\n\nCurrent work record:\n${JSON.stringify(body.worker)}\n\nContractor confirmation:\n${JSON.stringify(body.contractorVerification || {})}\n\nPrevious verified work history (may be empty):\n${JSON.stringify(history)}`;

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.GROK_MODEL || "grok-4.5",
        temperature: 0.2,
        response_format: { type: "json_schema", json_schema: { name: "worker_verification", strict: true, schema: responseSchema } },
        messages: [
          { role: "system", content: "You are a careful work-record analyst. Never invent evidence, endorsements, credentials, or verification. Scores are 0–100 and reflect only record completeness and internal consistency." },
          { role: "user", content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`xAI request failed with ${response.status}`);
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("xAI returned no content");
    const verification = sanitizeVerification(JSON.parse(content), fallback);
    return NextResponse.json({ verification, fallback: false });
  } catch (error) {
    console.error("Worker verification request failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ verification: fallback, fallback: true, reason: "AI verification is temporarily unavailable" });
  }
}
