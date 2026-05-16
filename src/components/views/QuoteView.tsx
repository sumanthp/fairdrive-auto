"use client";

import { useState, useRef } from "react";
import type { PolicyExtraction } from "@/lib/types";

interface Props {
  fairScoreTotal: number | null;
  state?: string;
}

function ExtractionCard({ extraction }: { extraction: PolicyExtraction }) {
  const c = extraction.coverages;
  return (
    <div className="extraction-card">
      <div className="extraction-section">
        <strong>Carrier &amp; Dates</strong>
        <div>{extraction.carrierName ?? "Unknown carrier"}</div>
        <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
          {extraction.effectiveDate ?? "—"} → {extraction.expirationDate ?? "—"}
        </div>
      </div>

      <div className="extraction-section">
        <strong>Premium</strong>
        <div>${extraction.monthlyPremium ?? "—"}/mo · ${extraction.annualPremium ?? "—"}/yr</div>
      </div>

      <div className="extraction-section">
        <strong>Coverages</strong>
        <div style={{ display: "grid", gap: "0.3rem", fontSize: "0.85rem" }}>
          {c.liability && <span>Liability: {c.liability.bodily ?? "—"} / {c.liability.property ?? "—"}k</span>}
          {c.collision && <span>Collision: {c.collision.active ? `$${c.collision.deductible ?? "—"} deductible` : "Not included"}</span>}
          {c.comprehensive && <span>Comprehensive: {c.comprehensive.active ? `$${c.comprehensive.deductible ?? "—"} deductible` : "Not included"}</span>}
          <span>Uninsured motorist: {c.uninsuredMotorist?.active ? "Active" : <span style={{ color: "var(--warn)" }}>Missing</span>}</span>
          {c.medical && <span>Medical: {c.medical.active ? (c.medical.limit ? `$${c.medical.limit}` : "Active") : "Not included"}</span>}
        </div>
      </div>

      {extraction.stateMinimumsComparison?.gaps.length ? (
        <div className="extraction-section">
          <strong>Coverage gaps vs. state minimums</strong>
          {extraction.stateMinimumsComparison.gaps.map((g, i) => (
            <div key={i} className="gap-item">{g}</div>
          ))}
        </div>
      ) : null}

      <div className="extraction-section">
        <strong>AI Confidence</strong>
        <div className="confidence-bar">
          <div className="factor-bar-header">
            <span>Extraction confidence</span>
            <span>{Math.round(extraction.confidenceScore * 100)}%</span>
          </div>
          <div className="factor-track">
            <div
              className="factor-fill"
              style={{
                width: `${Math.round(extraction.confidenceScore * 100)}%`,
                background: extraction.confidenceScore >= 0.7 ? "var(--brand)" : "var(--warn)",
              }}
            />
          </div>
        </div>
        {extraction.extractionWarnings.map((w, i) => (
          <div key={i} style={{ color: "var(--muted)", fontSize: "0.78rem", marginTop: "0.3rem" }}>{w}</div>
        ))}
      </div>
    </div>
  );
}

export default function QuoteView({ fairScoreTotal, state = "CA" }: Props) {
  const [extraction, setExtraction]   = useState<PolicyExtraction | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [analyzing, setAnalyzing]     = useState(false);
  const [explaining, setExplaining]   = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    setExtraction(null);
    setExplanation("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("state", state);
      const res = await fetch("/api/analyze", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json() as { error: string };
        throw new Error(j.error);
      }
      const data = await res.json() as { extraction: PolicyExtraction };
      setExtraction(data.extraction);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleExplain() {
    if (!extraction) return;
    setExplaining(true);
    setExplanation("");

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extraction, fairScoreTotal: fairScoreTotal ?? 45, state }),
      });
      if (!res.ok) throw new Error("Explain request failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response body");

      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) setExplanation(prev => prev + decoder.decode(value));
      }
    } catch (err) {
      setExplanation(err instanceof Error ? err.message : "Explanation failed");
    } finally {
      setExplaining(false);
    }
  }

  return (
    <div className="view-grid">
      <article className="panel large-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">AI quote explainer</p>
            <h3>Upload or review your current policy</h3>
          </div>
          <span className="status-pill">{analyzing ? "Analyzing…" : extraction ? "Extracted" : "Upload to start"}</span>
        </div>

        <label className="upload-zone">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFile}
          />
          <span className="upload-icon" aria-hidden="true">+</span>
          <strong>Drop your quote or policy here</strong>
          <small>PDF, JPG, or PNG · Claude AI extracts every line item</small>
        </label>

        {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{error}</p>}

        {extraction && (
          <>
            <ExtractionCard extraction={extraction} />
            <button
              className="primary-button"
              type="button"
              style={{ marginTop: "1rem" }}
              onClick={handleExplain}
              disabled={explaining}
            >
              {explaining ? "Generating explanation…" : "Explain this policy (AI)"}
            </button>
          </>
        )}

        {explanation && (
          <div className="explanation-card" style={{ marginTop: "1rem" }}>
            <p className="eyebrow">AI explanation</p>
            <div className="streaming-text">{explanation}</div>
          </div>
        )}

        {!extraction && !analyzing && (
          <div className="explanation-card" id="quoteExplanation">
            <p className="eyebrow">Example explanation</p>
            <p>
              Your premium appears high because the profile has limited prior U.S. insurance history,
              the collision deductible is low, and uninsured motorist coverage is missing.
              The vehicle repair cost index is 62/100, above the sedan average of 55.
            </p>
          </div>
        )}
      </article>

      <article className="panel">
        <p className="eyebrow">Quote summary</p>
        {extraction ? (
          <>
            <div className="metric-row">
              <span>Monthly premium</span>
              <strong>${extraction.monthlyPremium ?? "—"}</strong>
            </div>
            <div className="metric-row">
              <span>Collision deductible</span>
              <strong>${extraction.coverages.collision?.deductible ?? "—"}</strong>
            </div>
            <div className="metric-row">
              <span>Confidence</span>
              <strong style={{ color: extraction.confidenceScore >= 0.7 ? "var(--brand)" : "var(--warn)" }}>
                {Math.round(extraction.confidenceScore * 100)}%
              </strong>
            </div>
          </>
        ) : (
          <>
            <div className="metric-row"><span>Monthly premium</span><strong>$386</strong></div>
            <div className="metric-row"><span>Deductible</span><strong>$500</strong></div>
            <div className="metric-row"><span>Renewal</span><strong>42 days</strong></div>
            <div className="metric-row"><span>Repair cost index</span><strong className="warn">62 / 100</strong></div>
          </>
        )}
      </article>
    </div>
  );
}
