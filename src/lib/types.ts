// Shared TypeScript types for FairDrive Auto

export type VehicleKey = "accord" | "camry" | "bmw" | "tesla" | "crv";
export type CoverageLevel = "basic" | "standard" | "premium";
export type ViewType = "garage" | "fairscore" | "quote" | "passport" | "estimator" | "coach";
export type DocumentType =
  | "us-license"
  | "foreign-license"
  | "no-claims"
  | "vehicle-reg"
  | "current-policy"
  | "telematics-consent";
export type DocumentStatus = "not-uploaded" | "uploaded" | "verified" | "needs-review";

// ── FairScore ──────────────────────────────────────────────────────────────

export interface FairScoreInputs {
  vehicle: VehicleKey;
  state: string;
  usHistoryYears: number;
  intlHistoryYears: number;
  annualMiles: number;
  coverageLevel: CoverageLevel;
  cleanRecord: boolean;
  defensiveCourse: boolean;
}

export interface FactorScore {
  score: number;
  max: number;
  label: string;
}

export interface FairScoreResult {
  total: number;
  factors: {
    vehicle: FactorScore;
    credential: FactorScore;
    geographic: FactorScore;
    mileage: FactorScore;
    coverage: FactorScore;
  };
}

// Bayesian confidence interval replacing the simple ±10% band
export interface ConfidenceInterval {
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
}

export interface PremiumResult {
  monthly: number;
  tradMonthly: number;
  fairSavings: number;
  range: [number, number];
  ci: ConfidenceInterval;
  annualEstimate: number;
}

export interface CoachRecommendation {
  priority: number;
  icon: string;
  title: string;
  detail: string;
  action: string;
  savings: number;
}

export interface ScoreNarrative {
  helps: string[];
  hurts: string[];
}

// ── Document Intelligence ──────────────────────────────────────────────────

export interface CoverageLimits {
  liability?: { bodily?: string; property?: string };
  collision?: { deductible?: number; active: boolean };
  comprehensive?: { deductible?: number; active: boolean };
  uninsuredMotorist?: { active: boolean };
  medical?: { limit?: number; active: boolean };
}

export interface StateMinimumsComparison {
  liabilityAdequate: boolean;
  uninsuredMotoristPresent: boolean;
  gaps: string[];
}

export interface PolicyExtraction {
  carrierName?: string;
  effectiveDate?: string;
  expirationDate?: string;
  monthlyPremium?: number;
  annualPremium?: number;
  coverages: CoverageLimits;
  stateMinimumsComparison?: StateMinimumsComparison;
  confidenceScore: number;
  extractionWarnings: string[];
}

// ── Insurance Passport ─────────────────────────────────────────────────────

export interface PassportDocument {
  type: DocumentType;
  label: string;
  description: string;
  status: DocumentStatus;
  uploadedAt?: string;
  verifiedAt?: string;
  fileName?: string;
  extractedData?: PolicyExtraction;
  consentGiven: boolean;
  shareWithPartners: boolean;
  required: boolean;
}

export interface PassportState {
  documents: PassportDocument[];
  shareToken?: string;
  completionPct: number;
}

// ── Vehicle Data ───────────────────────────────────────────────────────────

export interface VehicleData {
  label: string;
  msrp: number;
  repairIndex: number;
  theftIndex: number;
  safetyRating: number;
  isEV: boolean;
  baseMonthly: number;
  design: string;
}
