import { NextRequest, NextResponse } from "next/server";
import type {
  FairScoreInputs,
  FairScoreResult,
  PremiumResult,
  CoachRecommendation,
  ScoreNarrative,
  VehicleKey,
  CoverageLevel,
} from "@/lib/types";
import {
  computeFairScore,
  computePremium,
  getCoachRecommendations,
  getScoreNarrative,
  VEHICLE_DATA,
} from "@/lib/ai-engine";

// Valid vehicle keys derived from VEHICLE_DATA at runtime
const VALID_VEHICLES = new Set<string>(Object.keys(VEHICLE_DATA));
const VALID_COVERAGE_LEVELS = new Set<string>(["basic", "standard", "premium"]);

interface FairScoreResponse {
  fairScore: FairScoreResult;
  premium: PremiumResult;
  recommendations: CoachRecommendation[];
  narrative: ScoreNarrative;
  totalSavingsPotential: number;
}

function validateInputs(body: unknown): { inputs: FairScoreInputs } | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Request body must be a JSON object." };
  }

  const b = body as Record<string, unknown>;

  // Required string fields
  if (typeof b.vehicle !== "string" || !VALID_VEHICLES.has(b.vehicle)) {
    return {
      error: `"vehicle" must be one of: ${Array.from(VALID_VEHICLES).join(", ")}`,
    };
  }

  if (typeof b.state !== "string" || !/^[A-Za-z]{2}$/.test(b.state)) {
    return { error: '"state" must be a 2-letter US state code (e.g. "CA").' };
  }

  if (
    typeof b.coverageLevel !== "string" ||
    !VALID_COVERAGE_LEVELS.has(b.coverageLevel)
  ) {
    return {
      error: `"coverageLevel" must be one of: ${Array.from(VALID_COVERAGE_LEVELS).join(", ")}`,
    };
  }

  // Required numeric fields
  const numericFields = [
    "usHistoryYears",
    "intlHistoryYears",
    "annualMiles",
  ] as const;

  for (const field of numericFields) {
    if (typeof b[field] !== "number" || !isFinite(b[field] as number) || (b[field] as number) < 0) {
      return { error: `"${field}" must be a non-negative number.` };
    }
  }

  // Required boolean fields
  const boolFields = ["cleanRecord", "defensiveCourse"] as const;
  for (const field of boolFields) {
    if (typeof b[field] !== "boolean") {
      return { error: `"${field}" must be a boolean.` };
    }
  }

  const inputs: FairScoreInputs = {
    vehicle: b.vehicle as VehicleKey,
    state: (b.state as string).toUpperCase(),
    usHistoryYears: b.usHistoryYears as number,
    intlHistoryYears: b.intlHistoryYears as number,
    annualMiles: b.annualMiles as number,
    coverageLevel: b.coverageLevel as CoverageLevel,
    cleanRecord: b.cleanRecord as boolean,
    defensiveCourse: b.defensiveCourse as boolean,
  };

  return { inputs };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 },
    );
  }

  const validation = validateInputs(body);
  if ("error" in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { inputs } = validation;

  const fairScore = computeFairScore(inputs);
  const premium = computePremium(inputs, fairScore);
  const recommendations = getCoachRecommendations(inputs, fairScore, premium);
  const narrative = getScoreNarrative(inputs, fairScore);

  const totalSavingsPotential = recommendations.reduce(
    (sum, r) => sum + r.savings,
    0,
  );

  const responseBody: FairScoreResponse = {
    fairScore,
    premium,
    recommendations,
    narrative,
    totalSavingsPotential,
  };

  return NextResponse.json(responseBody, { status: 200 });
}
