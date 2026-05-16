"use client";

import { useState } from "react";
import type { VehicleKey } from "@/lib/types";
import { VEHICLE_DATA } from "@/lib/ai-engine";

const estimates: Record<VehicleKey, Record<string, [number, number]>> = {
  accord: { none: [310, 430], short: [250, 350], long: [190, 280] },
  camry:  { none: [290, 410], short: [235, 330], long: [180, 265] },
  bmw:    { none: [430, 590], short: [360, 500], long: [275, 405] },
  tesla:  { none: [390, 540], short: [320, 455], long: [245, 370] },
  crv:    { none: [275, 390], short: [225, 315], long: [175, 255] },
};

export default function EstimatorView() {
  const [vehicle, setVehicle] = useState<VehicleKey>("accord");
  const [history, setHistory] = useState("none");
  const [result, setResult] = useState<{ lo: number; hi: number; label: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const [lo, hi] = estimates[vehicle][history];
    setResult({ lo, hi, label: VEHICLE_DATA[vehicle].label });
  }

  return (
    <div className="view-grid">
      <article className="panel large-panel">
        <p className="eyebrow">Before-you-buy estimator</p>
        <h3>Check insurance cost before choosing a car</h3>
        <form className="estimator-form" onSubmit={handleSubmit}>
          <label>
            Vehicle
            <select value={vehicle} onChange={e => setVehicle(e.target.value as VehicleKey)}>
              {(Object.keys(VEHICLE_DATA) as VehicleKey[]).map(k => (
                <option key={k} value={k}>{VEHICLE_DATA[k].label}</option>
              ))}
            </select>
          </label>
          <label>
            U.S. insurance history
            <select value={history} onChange={e => setHistory(e.target.value)}>
              <option value="none">No prior U.S. policy</option>
              <option value="short">Less than 1 year</option>
              <option value="long">1+ year</option>
            </select>
          </label>
          <button className="primary-button" type="submit">Estimate</button>
        </form>

        {result ? (
          <div className="estimate-result">
            <span>{result.label}</span>
            <strong>${result.lo} – ${result.hi}/mo</strong>
            <p>
              This is a planning estimate. Use the FairScore tab to see the impact of your
              international driving history, state, and mileage on the full AI model.
            </p>
          </div>
        ) : (
          <div className="estimate-result">
            <span>Estimated range</span>
            <strong>$310 – $430/mo</strong>
            <p>High repair costs and no prior U.S. insurance history increase the range.</p>
          </div>
        )}
      </article>
    </div>
  );
}
