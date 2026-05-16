import { NextRequest, NextResponse } from "next/server";
import type { PolicyExtraction } from "@/lib/types";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

// Mock extraction returned when ANTHROPIC_API_KEY is not configured.
// Shows a realistic policy with coverage gaps so the UI can be demoed.
function mockExtraction(state: string): PolicyExtraction {
  return {
    carrierName: "State Farm",
    effectiveDate: "2024-07-01",
    expirationDate: "2025-07-01",
    monthlyPremium: 386,
    annualPremium: 4632,
    coverages: {
      liability:         { bodily: "100/300", property: "100" },
      collision:         { deductible: 500,   active: true  },
      comprehensive:     { deductible: 250,   active: true  },
      uninsuredMotorist: { active: false },
      medical:           { limit: undefined,  active: false },
    },
    stateMinimumsComparison: {
      liabilityAdequate: true,
      uninsuredMotoristPresent: false,
      gaps:
        state === "NY" || state === "IL" || state === "WI" || state === "NC" || state === "VA"
          ? [`Uninsured motorist coverage is required in ${state} but not present in policy`]
          : [],
    },
    confidenceScore: 0,
    extractionWarnings: [
      "AI analysis not configured — set ANTHROPIC_API_KEY to enable real document extraction.",
      "This is a sample policy shown for demonstration purposes.",
    ],
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Request must be multipart/form-data." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  const state = formData.get("state");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  if (typeof state !== "string" || !/^[A-Za-z]{2}$/.test(state)) {
    return NextResponse.json(
      { error: '"state" must be a 2-letter state code.' },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File exceeds 10 MB limit." },
      { status: 413 },
    );
  }

  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}. Use JPEG, PNG, or PDF.` },
      { status: 415 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ extraction: mockExtraction(state.toUpperCase()) });
  }

  try {
    const { analyzeInsuranceDocument } = await import("@/lib/claude");

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const extraction = await analyzeInsuranceDocument(
      base64,
      file.type as "image/jpeg" | "image/png" | "application/pdf",
      state.toUpperCase(),
    );

    return NextResponse.json({ extraction });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[/api/analyze] Document analysis failed:", message);
    return NextResponse.json(
      { error: `Analysis failed: ${message}` },
      { status: 500 },
    );
  }
}
