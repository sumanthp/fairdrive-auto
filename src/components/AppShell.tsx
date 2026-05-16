"use client";

import { useState, useCallback } from "react";
import type {
  ViewType,
  VehicleKey,
  FairScoreResult,
  PremiumResult,
  CoachRecommendation,
  PassportDocument,
  DocumentType,
  FairScoreInputs,
  ScoreNarrative,
} from "@/lib/types";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import HeroPanel from "./HeroPanel";
import GarageView from "./views/GarageView";
import FairScoreView from "./views/FairScoreView";
import QuoteView from "./views/QuoteView";
import PassportView from "./views/PassportView";
import EstimatorView from "./views/EstimatorView";
import CoachView from "./views/CoachView";

// ── Initial passport documents ────────────────────────────────────────────

const INITIAL_DOCS: PassportDocument[] = [
  {
    type: "us-license",
    label: "U.S. Driver's License",
    description: "Your current U.S. driver's license. Required for all policies.",
    status: "verified",
    uploadedAt: "2024-01-15",
    verifiedAt: "2024-01-16",
    fileName: "us_license.pdf",
    consentGiven: true,
    shareWithPartners: false,
    required: true,
  },
  {
    type: "vehicle-reg",
    label: "Vehicle Registration",
    description: "Current vehicle registration document proving ownership.",
    status: "verified",
    uploadedAt: "2024-01-15",
    verifiedAt: "2024-01-16",
    fileName: "vehicle_registration.pdf",
    consentGiven: true,
    shareWithPartners: false,
    required: true,
  },
  {
    type: "foreign-license",
    label: "Foreign Driver's License",
    description: "Your driver's license from your home country. Supports FairCredit recognition.",
    status: "not-uploaded",
    consentGiven: false,
    shareWithPartners: false,
    required: false,
  },
  {
    type: "no-claims",
    label: "No-Claims Certificate",
    description: "Certified letter from your home country insurer confirming claim-free history.",
    status: "not-uploaded",
    consentGiven: false,
    shareWithPartners: false,
    required: false,
  },
  {
    type: "current-policy",
    label: "Current Insurance Policy",
    description: "Your existing U.S. policy declaration page for comparison and gap analysis.",
    status: "not-uploaded",
    consentGiven: false,
    shareWithPartners: false,
    required: false,
  },
  {
    type: "telematics-consent",
    label: "Telematics Consent",
    description: "Consent form for usage-based insurance programs. Can unlock 20–40% savings.",
    status: "not-uploaded",
    consentGiven: false,
    shareWithPartners: false,
    required: false,
  },
];

// ── FairScore API response shape ──────────────────────────────────────────

interface FairScoreApiResponse {
  fairScore: FairScoreResult;
  premium: PremiumResult;
  recommendations: CoachRecommendation[];
  narrative: ScoreNarrative;
  totalSavingsPotential: number;
}

export default function AppShell() {
  // Navigation state
  const [currentView, setCurrentView] = useState<ViewType>("garage");
  const [currentVehicle, setCurrentVehicle] = useState<VehicleKey>("accord");

  // FairScore state
  const [fairScoreResult, setFairScoreResult] = useState<FairScoreResult | null>(null);
  const [premiumResult, setPremiumResult] = useState<PremiumResult | null>(null);
  const [narrative, setNarrative] = useState<ScoreNarrative | null>(null);
  const [coachRecs, setCoachRecs] = useState<CoachRecommendation[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [isComputing, setIsComputing] = useState(false);

  // Passport state
  const [passportDocs, setPassportDocs] = useState<PassportDocument[]>(INITIAL_DOCS);
  const [shareToken, setShareToken] = useState<string | null>(null);

  // ── Compute FairScore ───────────────────────────────────────────────────

  const onComputeFairScore = useCallback(async (inputs: FairScoreInputs) => {
    setIsComputing(true);
    try {
      const res = await fetch("/api/fairscore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });

      if (!res.ok) {
        const err = await res.json() as { error: string };
        throw new Error(err.error ?? "FairScore computation failed");
      }

      const data = await res.json() as FairScoreApiResponse;
      setFairScoreResult(data.fairScore);
      setPremiumResult(data.premium);
      setNarrative(data.narrative);
      setCoachRecs(data.recommendations);
      setTotalSavings(data.totalSavingsPotential);
      setCurrentVehicle(inputs.vehicle);
    } finally {
      setIsComputing(false);
    }
  }, []);

  // ── Passport handlers ───────────────────────────────────────────────────

  const onUploadDoc = useCallback(async (type: DocumentType, file: File) => {
    setPassportDocs(prev =>
      prev.map(d =>
        d.type === type
          ? {
              ...d,
              status: "uploaded" as const,
              fileName: file.name,
              uploadedAt: new Date().toISOString().split("T")[0],
            }
          : d,
      ),
    );
  }, []);

  const onToggleConsent = useCallback(
    (type: DocumentType, field: "consentGiven" | "shareWithPartners") => {
      setPassportDocs(prev =>
        prev.map(d =>
          d.type === type ? { ...d, [field]: !d[field] } : d,
        ),
      );
    },
    [],
  );

  const onShare = useCallback(async (): Promise<string> => {
    const token =
      shareToken ??
      `FD-${Math.random().toString(36).slice(2, 7).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    setShareToken(token);
    return token;
  }, [shareToken]);

  const onDeleteDoc = useCallback(async (type: DocumentType) => {
    setPassportDocs(prev =>
      prev.map(d =>
        d.type === type
          ? {
              ...d,
              status: "not-uploaded" as const,
              fileName: undefined,
              uploadedAt: undefined,
              verifiedAt: undefined,
              extractedData: undefined,
            }
          : d,
      ),
    );
  }, []);

  // ── Render current view ─────────────────────────────────────────────────

  function renderView() {
    switch (currentView) {
      case "garage":
        return <GarageView vehicle={currentVehicle} />;
      case "fairscore":
        return (
          <FairScoreView
            fairScore={fairScoreResult}
            premium={premiumResult}
            narrative={narrative}
            onCompute={onComputeFairScore}
            isLoading={isComputing}
          />
        );
      case "quote":
        return (
          <QuoteView
            fairScoreTotal={fairScoreResult?.total ?? null}
            state="CA"
          />
        );
      case "passport":
        return (
          <PassportView
            documents={passportDocs}
            onUpload={onUploadDoc}
            onToggleConsent={onToggleConsent}
            onShare={onShare}
            onDelete={onDeleteDoc}
          />
        );
      case "estimator":
        return <EstimatorView />;
      case "coach":
        return (
          <CoachView
            recommendations={coachRecs}
            totalSavings={totalSavings}
            fairScoreTotal={fairScoreResult?.total ?? null}
          />
        );
    }
  }

  return (
    <div className="app-shell">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="main-content">
        <TopBar />
        <HeroPanel
          currentVehicle={currentVehicle}
          onVehicleChange={setCurrentVehicle}
          onNavigate={setCurrentView}
        />
        {renderView()}
      </main>
    </div>
  );
}
