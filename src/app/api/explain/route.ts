import { NextRequest, NextResponse } from "next/server";
import type { PolicyExtraction } from "@/lib/types";

// Streams an AI explanation of a policy document.
// Returns Server-Sent Events (text/event-stream) so the UI can render tokens as they arrive.

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { extraction: PolicyExtraction; fairScoreTotal: number; state: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.extraction || typeof body.fairScoreTotal !== "number" || !body.state) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // Return a static explanation when no API key is set
    const fallback = `Your current policy with ${body.extraction.carrierName ?? "your carrier"} shows a monthly premium of $${body.extraction.monthlyPremium ?? "N/A"}. The rate appears elevated due to limited U.S. insurance history — a pattern FairDrive's FairCredit system is designed to address by crediting international driving experience.\n\nYour FairScore of ${body.fairScoreTotal}/100 reflects vehicle repair costs, driving credential, and geographic risk factors. ${body.extraction.stateMinimumsComparison?.gaps.length ? `Coverage gaps identified: ${body.extraction.stateMinimumsComparison.gaps.join("; ")}.` : "Your current coverages meet state minimums."}\n\nTop actions: (1) Upload a certified no-claims letter from your home country insurer — this can help carrier partners recognize your clean record. (2) Review your collision deductible — raising it from $500 to $1,000 typically reduces monthly premium by 8–12%.`;
    return new NextResponse(fallback, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  try {
    const { streamQuoteExplanation } = await import("@/lib/claude");

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamQuoteExplanation(
            body.extraction,
            body.fairScoreTotal,
            body.state,
          )) {
            controller.enqueue(encoder.encode(chunk));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[/api/explain] Streaming failed:", message);
    return NextResponse.json({ error: `Explanation failed: ${message}` }, { status: 500 });
  }
}
