"use client";

import { useState } from "react";
import ScoreGauge from "@/components/ui/ScoreGauge";
import type {
  FairScoreInputs,
  FairScoreResult,
  PremiumResult,
  ScoreNarrative,
  VehicleKey,
  CoverageLevel,
} from "@/lib/types";
import { VEHICLE_DATA, STATE_MULTIPLIERS } from "@/lib/ai-engine";

interface Props {
  fairScore: FairScoreResult | null;
  premium: PremiumResult | null;
  narrative: ScoreNarrative | null;
  onCompute: (inputs: FairScoreInputs) => Promise<void>;
  isLoading: boolean;
}

const STATES = Object.keys(STATE_MULTIPLIERS).sort();

function scoreTierLabel(score: number): { label: string; cls: string } {
  if (score >= 80) return { label: "Excellent", cls: "tier-green" };
  if (score >= 65) return { label: "Good",      cls: "tier-good" };
  if (score >= 50) return { label: "Fair",      cls: "tier-fair" };
  if (score >= 35) return { label: "Building",  cls: "tier-warn" };
  return              { label: "High Risk",  cls: "tier-danger" };
}

export default function FairScoreView({ fairScore, premium, narrative, onCompute, isLoading }: Props) {
  const [vehicle,      setVehicle]      = useState<VehicleKey>("accord");
  const [state,        setState]        = useState("CA");
  const [usHistory,    setUsHistory]    = useState(0);
  const [intlHistory,  setIntlHistory]  = useState(0);
  const [mileage,      setMileage]      = useState(10000);
  const [coverage,     setCoverage]     = useState<CoverageLevel>("standard");
  const [cleanRecord,  setCleanRecord]  = useState(true);
  const [defensive,    setDefensive]    = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onCompute({
      vehicle,
      state,
      usHistoryYears:   usHistory,
      intlHistoryYears: intlHistory,
      annualMiles:      mileage,
      coverageLevel:    coverage,
      cleanRecord,
      defensiveCourse:  defensive,
    });
  }

  const tier = fairScore ? scoreTierLabel(fairScore.total) : null;

  return (
    <div className="view-grid">
      <article className="panel large-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">FairScore — AI Pricing Intelligence</p>
            <h3>Your multi-factor driver risk profile</h3>
          </div>
          <span className={`status-pill${fairScore ? " success" : ""}`}>
            {fairScore ? `Score: ${fairScore.total}` : "Not computed"}
          </span>
        </div>

        <form className="fairscore-form" onSubmit={handleSubmit}>
          <div className="fs-form-grid">
            <label>
              Vehicle
              <select value={vehicle} onChange={e => setVehicle(e.target.value as VehicleKey)}>
                {(Object.keys(VEHICLE_DATA) as VehicleKey[]).map(k => (
                  <option key={k} value={k}>{VEHICLE_DATA[k].label}</option>
                ))}
              </select>
            </label>

            <label>
              State
              <select value={state} onChange={e => setState(e.target.value)}>
                {STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>

            <label>
              U.S. insurance history
              <select value={usHistory} onChange={e => setUsHistory(+e.target.value)}>
                <option value={0}>No prior U.S. policy</option>
                <option value={1}>Less than 1 year</option>
                <option value={2}>1–2 years</option>
                <option value={4}>3–5 years</option>
                <option value={7}>5+ years</option>
              </select>
            </label>

            <label>
              International driving years
              <select value={intlHistory} onChange={e => setIntlHistory(+e.target.value)}>
                <option value={0}>None</option>
                <option value={1}>1–2 years</option>
                <option value={3}>3–4 years</option>
                <option value={5}>5–9 years</option>
                <option value={10}>10+ years</option>
              </select>
            </label>

            <label>
              Annual mileage
              <select value={mileage} onChange={e => setMileage(+e.target.value)}>
                <option value={4000}>Under 5,000 mi</option>
                <option value={6500}>5,000–7,500 mi</option>
                <option value={10000}>7,500–12,000 mi</option>
                <option value={16000}>12,000–20,000 mi</option>
                <option value={25000}>Over 20,000 mi</option>
              </select>
            </label>

            <label>
              Coverage level
              <select value={coverage} onChange={e => setCoverage(e.target.value as CoverageLevel)}>
                <option value="basic">Basic (liability only)</option>
                <option value="standard">Standard (full coverage)</option>
                <option value="premium">Premium (high limits)</option>
              </select>
            </label>
          </div>

          <div className="fs-checks">
            <label className="check-label">
              <input
                type="checkbox"
                checked={cleanRecord}
                onChange={e => setCleanRecord(e.target.checked)}
              />
              Clean driving record (no at-fault incidents in 3 years)
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={defensive}
                onChange={e => setDefensive(e.target.checked)}
              />
              Completed a defensive driving course
            </label>
          </div>

          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? "Computing…" : "Compute FairScore"}
          </button>
        </form>

        {fairScore && tier && (
          <div className="fairscore-result">
            <div className="score-display">
              <ScoreGauge score={fairScore.total} />
              <div className="score-meta">
                <div className={`score-tier ${tier.cls}`}>{tier.label}</div>
                <p className="score-bench">
                  Market average: 58 · Your score: {fairScore.total}
                </p>
              </div>
            </div>

            <div className="factor-bars">
              {Object.values(fairScore.factors).map(f => {
                const pct = Math.round((f.score / f.max) * 100);
                const color = pct >= 70 ? "var(--brand)" : pct >= 45 ? "var(--brand-2)" : "var(--warn)";
                return (
                  <div key={f.label} className="factor-bar">
                    <div className="factor-bar-header">
                      <span>{f.label}</span>
                      <span>{f.score} / {f.max}</span>
                    </div>
                    <div className="factor-track">
                      <div className="factor-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {narrative && (narrative.helps.length > 0 || narrative.hurts.length > 0) && (
              <div className="score-narrative">
                {narrative.helps.length > 0 && (
                  <div className="narrative-group">
                    <p className="narrative-label good">Helping your score</p>
                    <ul>
                      {narrative.helps.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                  </div>
                )}
                {narrative.hurts.length > 0 && (
                  <div className="narrative-group">
                    <p className="narrative-label warn">Hurting your score</p>
                    <ul>
                      {narrative.hurts.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </article>

      {fairScore && premium && (
        <article className="panel">
          <p className="eyebrow">Premium Estimate</p>
          <div className="premium-compare">
            <div className="premium-block fair">
              <span className="pb-label">FairDrive</span>
              <strong className="pb-amount">${premium.monthly}</strong>
              <span className="pb-sub">per month</span>
            </div>
            <div className="premium-block trad">
              <span className="pb-label">Traditional insurer</span>
              <strong className="pb-amount trad-amount">${premium.tradMonthly}</strong>
              <span className="pb-sub">per month</span>
            </div>
          </div>

          {premium.fairSavings > 0 && (
            <div className="savings-banner">
              <span className="eyebrow">FairCredit savings</span>
              <strong>${premium.fairSavings}/mo</strong>
              <p>by crediting your international driving history</p>
            </div>
          )}

          <div className="metric-row" style={{ marginTop: "0.75rem" }}>
            <span>Annual estimate</span>
            <strong>${premium.annualEstimate.toLocaleString()}/yr</strong>
          </div>
          <div className="metric-row">
            <span>Likely range (P25–P75)</span>
            <strong>${premium.range[0]} – ${premium.range[1]}/mo</strong>
          </div>
          <div className="metric-row">
            <span>P10 / P90 band</span>
            <strong style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
              ${premium.ci.p10} – ${premium.ci.p90}/mo
            </strong>
          </div>
        </article>
      )}
    </div>
  );
}
