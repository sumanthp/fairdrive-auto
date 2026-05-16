"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { VehicleKey, ViewType } from "@/lib/types";
import { VEHICLE_DATA } from "@/lib/ai-engine";

const VehicleViewer = dynamic(() => import("./VehicleViewer"), { ssr: false });

interface Props {
  currentVehicle: VehicleKey;
  onVehicleChange: (v: VehicleKey) => void;
  onNavigate: (view: ViewType) => void;
}

type CoverageLabel = "Collision" | "Comprehensive" | "Medical";

const COVERAGE_COPY: Record<CoverageLabel, string> = {
  Collision:
    "Protects your car after an accident with another vehicle or object.",
  Comprehensive:
    "Protects against theft, hail, glass damage, flood, fire, and other non-collision events.",
  Medical:
    "Helps cover medical costs for you or passengers after a covered accident.",
};

const HOTSPOTS: { cls: string; label: CoverageLabel }[] = [
  { cls: "hotspot-front", label: "Collision" },
  { cls: "hotspot-glass", label: "Comprehensive" },
  { cls: "hotspot-cabin", label: "Medical" },
];

export default function HeroPanel({
  currentVehicle,
  onVehicleChange,
  onNavigate,
}: Props) {
  const [popoverCoverage, setPopoverCoverage] =
    useState<CoverageLabel>("Collision");
  const vehicleData = VEHICLE_DATA[currentVehicle];

  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <p className="eyebrow">Current policy insight</p>
        <h2>$386/mo estimated premium</h2>
        <p>
          Your rate appears elevated because the profile has limited U.S.
          insurance history and the vehicle has above-average repair cost.
        </p>
        <div className="hero-actions">
          <button
            className="primary-button"
            type="button"
            onClick={() => onNavigate("fairscore")}
          >
            Compute FairScore
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => onNavigate("quote")}
          >
            Explain my quote
          </button>
        </div>
      </div>

      <div className="vehicle-stage" aria-label="Interactive 3D vehicle garage">
        <div className="model-toolbar">
          <label>
            Vehicle model
            <select
              value={currentVehicle}
              onChange={(e) => onVehicleChange(e.target.value as VehicleKey)}
            >
              <option value="accord">2023 Honda Accord</option>
              <option value="camry">2023 Toyota Camry</option>
              <option value="bmw">2023 BMW 330i</option>
              <option value="tesla">2023 Tesla Model 3</option>
              <option value="crv">2023 Honda CR-V</option>
            </select>
          </label>
          <span>{vehicleData.design}</span>
        </div>

        <VehicleViewer vehicle={currentVehicle} />

        {HOTSPOTS.map(({ cls, label }) => (
          <div
            key={cls}
            className={`hotspot ${cls}`}
            onMouseEnter={() => setPopoverCoverage(label)}
          >
            <span />
          </div>
        ))}

        <div className="coverage-popover">
          <p className="eyebrow">Coverage</p>
          <strong>{popoverCoverage}</strong>
          <span>{COVERAGE_COPY[popoverCoverage]}</span>
        </div>
      </div>
    </section>
  );
}
