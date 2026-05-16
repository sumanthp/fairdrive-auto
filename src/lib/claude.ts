// Claude API integration for FairDrive Auto
// Uses @anthropic-ai/sdk v0.27.x — prompt caching via client.beta.promptCaching.messages
// API key read automatically from ANTHROPIC_API_KEY env var.

import Anthropic from "@anthropic-ai/sdk";
import type {
  PromptCachingBetaTextBlockParam,
  PromptCachingBetaImageBlockParam,
  PromptCachingBetaMessageParam,
} from "@anthropic-ai/sdk/resources/beta/prompt-caching/messages.js";
import type { PolicyExtraction, PassportDocument } from "./types";
import { checkStateMinimumsCompliance } from "./state-minimums";

const client = new Anthropic();

// ── System prompts (stable, long-lived → ideal cache anchor) ─────────────────

const EXTRACTION_SYSTEM_PROMPT = `You are an expert auto insurance document parser.
Extract structured data from insurance policy documents and respond ONLY with valid JSON.
Do not include any text outside the JSON object.
Do not include markdown code fences.
Your response must be parseable by JSON.parse() without any preprocessing.

Extract the following fields into this exact JSON structure:
{
  "carrierName": string or null,
  "effectiveDate": string (ISO 8601 date) or null,
  "expirationDate": string (ISO 8601 date) or null,
  "monthlyPremium": number or null,
  "annualPremium": number or null,
  "coverages": {
    "liability": {
      "bodily": string (format "X/Y" where X=per-person thousands, Y=per-accident thousands) or null,
      "property": string (property damage limit in thousands e.g. "25") or null
    },
    "collision": {
      "deductible": number or null,
      "active": boolean
    },
    "comprehensive": {
      "deductible": number or null,
      "active": boolean
    },
    "uninsuredMotorist": {
      "active": boolean
    },
    "medical": {
      "limit": number or null,
      "active": boolean
    }
  },
  "confidenceScore": number between 0 and 1,
  "extractionWarnings": array of strings describing any issues or missing data
}

Rules:
- Normalize all liability limits to thousands (e.g. $25,000/$50,000 becomes "25/50").
- If a coverage is explicitly listed as "not included" or "$0", set active to false.
- If a coverage is present with any limit, set active to true.
- Use confidenceScore 0.9+ only if you can clearly read all key fields.
- Use confidenceScore 0.5-0.89 if some fields are unclear or partially obscured.
- Use confidenceScore below 0.5 if the document is poor quality or mostly illegible.
- List any ambiguities or missing mandatory fields in extractionWarnings.`;

const EXPLANATION_SYSTEM_PROMPT = `You are a licensed auto insurance advisor helping a first-time US driver understand their policy.

Guidelines:
- Never promise specific savings amounts.
- Never make guarantees about future rates.
- Cite the specific policy document for every claim you make about the driver's current coverage.
- Keep your response under 250 words.
- Use plain language — avoid jargon without explanation.
- Be direct and actionable.`;

// ── Fallback extraction result ────────────────────────────────────────────────

function emptyExtraction(warnings: string[]): PolicyExtraction {
  return {
    coverages: {
      collision: { active: false },
      comprehensive: { active: false },
      uninsuredMotorist: { active: false },
      medical: { active: false },
    },
    confidenceScore: 0,
    extractionWarnings: warnings,
  };
}

// ── Document Analysis ─────────────────────────────────────────────────────────

/**
 * Analyze an insurance document image or PDF using Claude vision.
 * Returns a PolicyExtraction with state minimums compliance appended.
 *
 * Prompt caching is applied to the stable system prompt via
 * client.beta.promptCaching.messages.create (SDK v0.27.x).
 *
 * PDFs are sent as a document content block (supported by the underlying
 * Anthropic API; cast to `any` because SDK v0.27 types predate document blocks).
 */
export async function analyzeInsuranceDocument(
  fileBase64: string,
  mimeType: "image/jpeg" | "image/png" | "application/pdf",
  state: string,
): Promise<PolicyExtraction> {
  const isPdf = mimeType === "application/pdf";

  // Build the content block for the document.
  // For PDFs: the Anthropic API supports document blocks but SDK v0.27 types do not,
  // so we cast. The runtime wire format is correct.
  // For images: use the typed PromptCachingBeta image block.
  const documentBlock: PromptCachingBetaImageBlockParam | Record<string, unknown> =
    isPdf
      ? {
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: fileBase64,
          },
        }
      : {
          type: "image",
          source: {
            type: "base64",
            media_type: mimeType,
            data: fileBase64,
          },
        };

  const systemBlock: PromptCachingBetaTextBlockParam = {
    type: "text",
    text: EXTRACTION_SYSTEM_PROMPT,
    // Cache the stable system prompt — saves ~$0.002 per repeated call on the same content
    cache_control: { type: "ephemeral" },
  };

  const userMessage: PromptCachingBetaMessageParam = {
    role: "user",
    content: [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      documentBlock as any,
      {
        type: "text",
        text: `Extract all insurance data from this document. The insured is in state: ${state}. Return only the JSON object described in the system prompt.`,
      },
    ],
  };

  let rawJson: string;

  try {
    const response = await client.beta.promptCaching.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: [systemBlock],
      messages: [userMessage],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    rawJson = textBlock?.type === "text" ? textBlock.text.trim() : "";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return emptyExtraction([
      `Claude API error during document analysis: ${message}`,
    ]);
  }

  // ── Parse JSON response ────────────────────────────────────────────────────
  let extracted: Omit<PolicyExtraction, "stateMinimumsComparison">;

  try {
    extracted = JSON.parse(rawJson) as Omit<
      PolicyExtraction,
      "stateMinimumsComparison"
    >;
  } catch {
    return emptyExtraction([
      "AI returned non-JSON response — document may be unreadable or unsupported.",
      `Raw response preview: ${rawJson.slice(0, 120)}`,
    ]);
  }

  // ── Validate and coerce the parsed object ──────────────────────────────────
  const coverages = extracted.coverages ?? {};
  const safeExtracted: Omit<PolicyExtraction, "stateMinimumsComparison"> = {
    carrierName: extracted.carrierName ?? undefined,
    effectiveDate: extracted.effectiveDate ?? undefined,
    expirationDate: extracted.expirationDate ?? undefined,
    monthlyPremium: extracted.monthlyPremium ?? undefined,
    annualPremium: extracted.annualPremium ?? undefined,
    coverages: {
      liability: coverages.liability,
      collision: coverages.collision ?? { active: false },
      comprehensive: coverages.comprehensive ?? { active: false },
      uninsuredMotorist: coverages.uninsuredMotorist ?? { active: false },
      medical: coverages.medical ?? { active: false },
    },
    confidenceScore:
      typeof extracted.confidenceScore === "number"
        ? Math.max(0, Math.min(1, extracted.confidenceScore))
        : 0,
    extractionWarnings: Array.isArray(extracted.extractionWarnings)
      ? extracted.extractionWarnings
      : [],
  };

  // ── State minimums compliance ──────────────────────────────────────────────
  const stateMinimumsComparison = checkStateMinimumsCompliance(
    safeExtracted.coverages,
    state,
  );

  return { ...safeExtracted, stateMinimumsComparison };
}

// ── Quote Explanation Stream ──────────────────────────────────────────────────

/**
 * Stream a plain-language explanation of a policy to a first-time US driver.
 * Yields text delta strings as they arrive from Claude.
 *
 * Uses client.beta.promptCaching.messages.stream to cache the stable system prompt.
 */
export async function* streamQuoteExplanation(
  extraction: PolicyExtraction,
  fairScoreTotal: number,
  state: string,
): AsyncGenerator<string> {
  const policyJson = JSON.stringify(extraction, null, 2);
  const gaps =
    extraction.stateMinimumsComparison?.gaps.length
      ? extraction.stateMinimumsComparison.gaps.join("; ")
      : "none identified";

  const userPrompt = `Here is a first-time US driver's current auto insurance policy data extracted from their document:

${policyJson}

Their FairScore is ${fairScoreTotal}/100 (higher is better — reflects vehicle risk, driving history, geography, and mileage).
They are insured in state: ${state}.
Coverage gaps vs state minimums: ${gaps}.

Please explain this policy to them in plain language. Cover:
1. What their current coverage includes and the cost
2. Any coverage gaps compared to ${state} state minimums
3. The top 2 specific actions they can take to reduce their premium

Cite specific numbers from the policy document above. Keep your response under 250 words.`;

  const systemBlock: PromptCachingBetaTextBlockParam = {
    type: "text",
    text: EXPLANATION_SYSTEM_PROMPT,
    cache_control: { type: "ephemeral" },
  };

  const stream = client.beta.promptCaching.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: [systemBlock],
    messages: [{ role: "user", content: userPrompt }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

// ── Passport Summary ──────────────────────────────────────────────────────────

/**
 * Generate a 2-3 sentence professional summary of a driver's insurance passport
 * for a licensed agent to use during underwriting or quoting.
 *
 * Uses claude-haiku-4-5 (fast, low-cost) via the standard messages API.
 * No caching needed — the prompt varies per driver.
 */
export async function generatePassportSummary(
  documents: PassportDocument[],
): Promise<string> {
  const docSummaries = documents
    .map((d) => {
      const base = `${d.label} (${d.status})`;
      if (d.extractedData) {
        const p = d.extractedData;
        const carrier = p.carrierName ? `, carrier: ${p.carrierName}` : "";
        const premium = p.monthlyPremium
          ? `, monthly premium: $${p.monthlyPremium}`
          : "";
        const confidence = `, extraction confidence: ${Math.round(p.confidenceScore * 100)}%`;
        return `${base}${carrier}${premium}${confidence}`;
      }
      return base;
    })
    .join("\n");

  const completedCount = documents.filter(
    (d) => d.status === "verified" || d.status === "uploaded",
  ).length;

  const prompt = `Generate a concise 2-3 sentence professional insurance passport summary for a licensed agent.

Driver's passport status:
- Documents submitted: ${completedCount} of ${documents.length}
- Document details:
${docSummaries}

Write from a third-person perspective as if briefing an underwriter. Focus on what's been verified, any notable coverage history, and overall completeness of the driver's profile.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.type === "text"
    ? textBlock.text.trim()
    : "Passport summary unavailable.";
}
