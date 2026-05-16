"use client";

import type { ViewType } from "@/lib/types";

interface Props {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const NAV_ITEMS: { view: ViewType; label: string }[] = [
  { view: "garage",    label: "Garage" },
  { view: "fairscore", label: "FairScore" },
  { view: "quote",     label: "Quote" },
  { view: "passport",  label: "Passport" },
  { view: "estimator", label: "Estimator" },
  { view: "coach",     label: "Coach" },
];

export default function Sidebar({ currentView, onViewChange }: Props) {
  return (
    <aside className="sidebar" aria-label="FairDrive navigation">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">F</div>
        <div>
          <p className="brand-name">FairDrive</p>
          <p className="brand-subtitle">Auto Passport</p>
        </div>
      </div>

      <nav className="nav-list" aria-label="Primary">
        {NAV_ITEMS.map(({ view, label }) => (
          <button
            key={view}
            className={`nav-item${currentView === view ? " active" : ""}`}
            type="button"
            onClick={() => onViewChange(view)}
          >
            <span aria-hidden="true">{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-card">
        <p className="eyebrow">FairCredit</p>
        <p>
          Your driving history did not start when you landed in the U.S.
          FairScore credits international experience.
        </p>
      </div>
    </aside>
  );
}
