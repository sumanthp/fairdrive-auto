"use client";

import type { CoachRecommendation } from "@/lib/types";

interface Props {
  recommendations: CoachRecommendation[];
  totalSavings: number;
  fairScoreTotal: number | null;
}

export default function CoachView({ recommendations, totalSavings, fairScoreTotal }: Props) {
  return (
    <div className="view-grid">
      <article className="panel large-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">AI Premium Coach</p>
            <h3>{recommendations.length > 0 ? `${recommendations.length} savings actions found` : "Next best actions"}</h3>
          </div>
          <span className={`status-pill${recommendations.length > 0 ? " success" : ""}`}>
            {recommendations.length > 0 ? "AI-powered" : "Compute FairScore first"}
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="coach-list">
            <button type="button" className="coach-item">
              <div className="coach-item-header">
                <strong>Upload foreign no-claims letter</strong>
              </div>
              <span>Can help an agent package your profile for partner review.</span>
              <span className="coach-action">Add to Passport →</span>
            </button>
            <button type="button" className="coach-item">
              <div className="coach-item-header">
                <strong>Compare deductible options</strong>
              </div>
              <span>See monthly cost impact before changing coverage.</span>
              <span className="coach-action">Compute FairScore to see personalized estimate →</span>
            </button>
            <button type="button" className="coach-item">
              <div className="coach-item-header">
                <strong>Review vehicle alternatives</strong>
              </div>
              <span>Some models cost far less to insure for new U.S. drivers.</span>
              <span className="coach-action">Use Estimator →</span>
            </button>
          </div>
        ) : (
          <div className="coach-list">
            {recommendations.map(r => (
              <button key={r.priority} type="button" className="coach-item">
                <div className="coach-item-header">
                  <strong>{r.icon} {r.title}</strong>
                  {r.savings > 0 && (
                    <span className="savings-badge">–${r.savings}/mo</span>
                  )}
                </div>
                <span>{r.detail}</span>
                <span className="coach-action">{r.action} →</span>
              </button>
            ))}
          </div>
        )}

        <p className="muted" style={{ marginTop: "1rem", fontSize: "0.78rem", lineHeight: 1.5 }}>
          These are planning estimates. Real savings depend on carrier appetite,
          state regulations, and verified documentation. A licensed agent reviews before any policy is bound.
        </p>
      </article>

      <article className="panel">
        <p className="eyebrow">Total savings potential</p>
        {totalSavings > 0 ? (
          <div className="metric-row">
            <span>All actions combined</span>
            <strong style={{ color: "var(--brand)" }}>${totalSavings}/mo potential</strong>
          </div>
        ) : (
          <p className="muted">
            {fairScoreTotal === null
              ? "Compute your FairScore to see personalized savings."
              : "Savings estimates are shown above for each action."}
          </p>
        )}
        <p className="muted" style={{ marginTop: "0.75rem", fontSize: "0.85rem", lineHeight: 1.5 }}>
          Estimates never constitute a guarantee. Actual savings vary by carrier,
          coverage selection, and state regulation.
        </p>
      </article>
    </div>
  );
}
