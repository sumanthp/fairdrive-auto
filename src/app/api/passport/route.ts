import { NextRequest, NextResponse } from "next/server";
import type { PassportDocument, DocumentType } from "@/lib/types";

// Demo-mode passport state — in production, this would be fetched from Supabase
// keyed by the authenticated user's ID.
const INITIAL_DOCUMENTS: PassportDocument[] = [
  {
    type: "us-license",
    label: "U.S. Driver's License",
    description: "Required to bind a policy with most U.S. carriers.",
    status: "verified",
    uploadedAt: "2024-06-15T10:22:00Z",
    verifiedAt: "2024-06-15T10:23:41Z",
    fileName: "us-license.jpg",
    consentGiven: true,
    shareWithPartners: true,
    required: true,
  },
  {
    type: "foreign-license",
    label: "Foreign Driver's License",
    description: "Supports FairCredit international history recognition.",
    status: "not-uploaded",
    consentGiven: false,
    shareWithPartners: false,
    required: false,
  },
  {
    type: "no-claims",
    label: "No-Claims Certificate",
    description: "Certified letter from your home country insurer proving clean record.",
    status: "not-uploaded",
    consentGiven: false,
    shareWithPartners: false,
    required: false,
  },
  {
    type: "vehicle-reg",
    label: "Vehicle Registration",
    description: "Current vehicle registration confirming ownership and VIN.",
    status: "verified",
    uploadedAt: "2024-06-15T10:25:00Z",
    verifiedAt: "2024-06-15T10:26:12Z",
    fileName: "registration.pdf",
    consentGiven: true,
    shareWithPartners: true,
    required: true,
  },
  {
    type: "current-policy",
    label: "Current Insurance Policy",
    description: "Your active policy declaration page for comparison and gap analysis.",
    status: "not-uploaded",
    consentGiven: false,
    shareWithPartners: false,
    required: false,
  },
  {
    type: "telematics-consent",
    label: "Telematics Consent",
    description: "Opt-in for Drive Score — unlock usage-based discounts.",
    status: "not-uploaded",
    consentGiven: false,
    shareWithPartners: false,
    required: false,
  },
];

function generateShareToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars (0, O, 1, I)
  let token = "";
  for (let i = 0; i < 8; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export async function GET(): Promise<NextResponse> {
  const completedCount = INITIAL_DOCUMENTS.filter(
    (d) => d.status === "verified" || d.status === "uploaded",
  ).length;
  const completionPct = Math.round((completedCount / INITIAL_DOCUMENTS.length) * 100);

  return NextResponse.json({
    documents: INITIAL_DOCUMENTS,
    completionPct,
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body must be an object." }, { status: 400 });
  }

  const { action } = body as Record<string, unknown>;

  if (action === "share") {
    const token = generateShareToken();
    return NextResponse.json({ shareToken: token });
  }

  if (action === "delete") {
    const { type } = body as Record<string, unknown>;
    if (typeof type !== "string") {
      return NextResponse.json({ error: '"type" is required for delete.' }, { status: 400 });
    }
    const validTypes: DocumentType[] = [
      "us-license", "foreign-license", "no-claims",
      "vehicle-reg", "current-policy", "telematics-consent",
    ];
    if (!validTypes.includes(type as DocumentType)) {
      return NextResponse.json({ error: `Unknown document type: ${type}` }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: `Unknown action: ${String(action)}` }, { status: 400 });
}
