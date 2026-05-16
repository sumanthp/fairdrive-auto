// FairDrive App — view routing, vehicle selection, AI engine wiring

const viewButtons   = document.querySelectorAll("[data-view]");
const targetButtons = document.querySelectorAll("[data-view-target]");
const panels        = document.querySelectorAll("[data-view-panel]");
const quoteUpload   = document.querySelector("#quoteUpload");
const quoteExplanation = document.querySelector("#quoteExplanation");
const estimatorForm = document.querySelector("#estimatorForm");
const vehicleSelect = document.querySelector("#vehicleSelect");
const garageVehicleSelect = document.querySelector("#garageVehicleSelect");
const selectedVehicleName = document.querySelector("#selectedVehicleName");
const vehicleDesignLabel  = document.querySelector("#vehicleDesignLabel");
const historySelect  = document.querySelector("#historySelect");
const estimateResult = document.querySelector("#estimateResult");
const popover = document.querySelector("#coveragePopover");
const hotspots = document.querySelectorAll(".hotspot");

let currentVehicle = "accord";

const vehicleModels = {
  accord: { label: "2023 Honda Accord", design: "Mid-size sedan" },
  camry:  { label: "2023 Toyota Camry", design: "Angular sedan" },
  bmw:    { label: "2023 BMW 330i",     design: "Sport luxury sedan" },
  tesla:  { label: "2023 Tesla Model 3",design: "Minimal EV fastback" },
  crv:    { label: "2023 Honda CR-V",   design: "Compact SUV" },
};

const estimates = {
  accord: { none: [310, 430], short: [250, 350], long: [190, 280] },
  camry:  { none: [290, 410], short: [235, 330], long: [180, 265] },
  bmw:    { none: [430, 590], short: [360, 500], long: [275, 405] },
  tesla:  { none: [390, 540], short: [320, 455], long: [245, 370] },
  crv:    { none: [275, 390], short: [225, 315], long: [175, 255] },
};

const coverageCopy = {
  Collision:    "Protects your car after an accident with another vehicle or object.",
  Comprehensive:"Protects against theft, hail, glass damage, flood, fire, and other non-collision events.",
  Medical:      "Helps cover medical costs for you or passengers after a covered accident.",
};

// ── View routing ──────────────────────────────────────────────────────────────

function setView(view) {
  viewButtons.forEach(b => b.classList.toggle("active", b.dataset.view === view));
  panels.forEach(p => p.classList.toggle("active", p.dataset.viewPanel === view));
}

function setVehicle(vehicle) {
  currentVehicle = vehicle;
  const model = vehicleModels[vehicle];
  selectedVehicleName.textContent = model.label;
  vehicleDesignLabel.textContent  = model.design;
  garageVehicleSelect.value = vehicle;
  vehicleSelect.value = vehicle;
  window.FairDriveCarViewer?.setVehicleModel(vehicle);
}

viewButtons.forEach(b => b.addEventListener("click", () => setView(b.dataset.view)));
targetButtons.forEach(b => b.addEventListener("click", () => setView(b.dataset.viewTarget)));
garageVehicleSelect?.addEventListener("change", () => setVehicle(garageVehicleSelect.value));
vehicleSelect?.addEventListener("change", () => setVehicle(vehicleSelect.value));

// ── Coverage hotspots ─────────────────────────────────────────────────────────

hotspots.forEach(hs => {
  hs.addEventListener("mouseenter", () => {
    const label = hs.dataset.coverage;
    popover.innerHTML = `
      <p class="eyebrow">Coverage</p>
      <strong>${label}</strong>
      <span>${coverageCopy[label]}</span>
    `;
  });
});

// ── Quote upload (simulated OCR) ──────────────────────────────────────────────

quoteUpload?.addEventListener("change", () => {
  const file = quoteUpload.files?.[0];
  if (!file) return;
  quoteExplanation.innerHTML = `
    <p class="eyebrow">Simulated extraction — ${file.name}</p>
    <p>
      In production, Claude AI will extract: carrier name, effective dates, premium
      breakdown, coverage limits, deductibles, and flag gaps against state minimums.
      International no-claims letters from 30+ countries are also parsed.
    </p>
  `;
});

// ── Simple estimator ──────────────────────────────────────────────────────────

estimatorForm?.addEventListener("submit", e => {
  e.preventDefault();
  const v = vehicleSelect.value;
  const h = historySelect.value;
  const [lo, hi] = estimates[v][h];
  estimateResult.innerHTML = `
    <span>${vehicleModels[v].label}</span>
    <strong>$${lo} – $${hi}/mo</strong>
    <p>This range is a planning estimate. Use the FairScore tab to see the impact of
       your international driving history, state, and mileage on the full model.</p>
  `;
});

// ── FairScore engine ──────────────────────────────────────────────────────────

const fairscoreForm    = document.querySelector("#fairscoreForm");
const fairscoreResult  = document.querySelector("#fairscoreResult");
const premiumCompPanel = document.querySelector("#premiumComparePanel");
const scoreNumber      = document.querySelector("#scoreNumber");
const scoreTier        = document.querySelector("#scoreTier");
const scoreBench       = document.querySelector("#scoreBench");
const gaugeFill        = document.querySelector("#gaugeFill");
const factorBarsEl     = document.querySelector("#factorBars");
const scoreNarrativeEl = document.querySelector("#scoreNarrative");
const fairMonthlyEl    = document.querySelector("#fairMonthly");
const tradMonthlyEl    = document.querySelector("#tradMonthly");
const savingsBannerEl  = document.querySelector("#savingsBanner");
const savingsAmountEl  = document.querySelector("#savingsAmount");
const annualEstEl      = document.querySelector("#annualEstimate");
const premiumRangeEl   = document.querySelector("#premiumRange");
const fairscorePill    = document.querySelector("#fairscoreStatusPill");
const coachList        = document.querySelector("#coachList");
const coachPill        = document.querySelector("#coachPill");
const coachHeading     = document.querySelector("#coachHeading");
const totalSavingsEl   = document.querySelector("#totalSavingsDisplay");

// Gauge arc: the SVG path spans 0°→180° (semicircle); map score 0–100 → dashoffset.
// Arc length of "M10,65 A55,55,0,0,1,110,65" ≈ 172.8 px.
const GAUGE_ARC = 172.8;

function setGauge(score) {
  const filled = (score / 100) * GAUGE_ARC;
  gaugeFill.style.strokeDasharray  = `${filled} ${GAUGE_ARC}`;
  gaugeFill.style.strokeDashoffset = 0;
  const hue = Math.round(score * 1.2); // 0 = red, 72 = green-ish at 60
  gaugeFill.style.stroke = `hsl(${hue}, 72%, 52%)`;
}

function scoreTierLabel(score) {
  if (score >= 80) return { label: "Excellent", cls: "tier-green" };
  if (score >= 65) return { label: "Good",      cls: "tier-good" };
  if (score >= 50) return { label: "Fair",      cls: "tier-fair" };
  if (score >= 35) return { label: "Building",  cls: "tier-warn" };
  return                   { label: "High Risk", cls: "tier-danger" };
}

function renderFactorBars(factors) {
  factorBarsEl.innerHTML = Object.values(factors).map(f => {
    const pct = Math.round((f.score / f.max) * 100);
    const color = pct >= 70 ? "var(--brand)" : pct >= 45 ? "var(--brand-2)" : "var(--warn)";
    return `
      <div class="factor-bar">
        <div class="factor-bar-header">
          <span>${f.label}</span>
          <span>${f.score} / ${f.max}</span>
        </div>
        <div class="factor-track">
          <div class="factor-fill" style="width:${pct}%;background:${color}"></div>
        </div>
      </div>
    `;
  }).join("");
}

function renderNarrative(helps, hurts) {
  const helpHtml = helps.length ? `
    <div class="narrative-group">
      <p class="narrative-label good">Helping your score</p>
      <ul>${helps.map(h => `<li>${h}</li>`).join("")}</ul>
    </div>` : "";
  const hurtHtml = hurts.length ? `
    <div class="narrative-group">
      <p class="narrative-label warn">Hurting your score</p>
      <ul>${hurts.map(h => `<li>${h}</li>`).join("")}</ul>
    </div>` : "";
  scoreNarrativeEl.innerHTML = helpHtml + hurtHtml;
}

function renderCoach(recs, totalSavings) {
  coachList.innerHTML = recs.map(r => `
    <button type="button" class="coach-item">
      <div class="coach-item-header">
        <strong>${r.icon} ${r.title}</strong>
        ${r.savings ? `<span class="savings-badge">–$${r.savings}/mo</span>` : ""}
      </div>
      <span>${r.detail}</span>
      <span class="coach-action">${r.action} →</span>
    </button>
  `).join("");
  coachHeading.textContent = `${recs.length} savings actions found`;
  coachPill.textContent = "AI-powered";
  if (totalSavingsEl) totalSavingsEl.textContent = `$${totalSavings}/mo potential`;
}

// Stored last computed results so Coach view can render them
let lastCoachRecs = null;
let lastTotalSavings = 0;

fairscoreForm?.addEventListener("submit", e => {
  e.preventDefault();
  const AI = window.FairDriveAI;
  if (!AI) return;

  const inputs = {
    vehicle:          document.querySelector("#fsVehicle").value,
    state:            document.querySelector("#fsState").value,
    usHistoryYears:   parseInt(document.querySelector("#fsUsHistory").value, 10),
    intlHistoryYears: parseInt(document.querySelector("#fsIntlHistory").value, 10),
    annualMiles:      parseInt(document.querySelector("#fsMileage").value, 10),
    coverageLevel:    document.querySelector("#fsCoverage").value,
    cleanRecord:      document.querySelector("#fsCleanRecord").checked,
    defensiveCourse:  document.querySelector("#fsDefensive").checked,
  };

  const fairScore = AI.computeFairScore(inputs);
  const premium   = AI.computePremium(inputs, fairScore);
  const narrative = AI.getScoreNarrative(inputs, fairScore);
  const recs      = AI.getCoachRecommendations(inputs, fairScore, premium);
  const totalSav  = recs.reduce((sum, r) => sum + (r.savings || 0), 0);

  // Store for coach view
  lastCoachRecs    = recs;
  lastTotalSavings = totalSav;

  // Reveal results
  fairscoreResult.hidden  = false;
  premiumCompPanel.hidden = false;

  // Score gauge
  scoreNumber.textContent = fairScore.total;
  setGauge(fairScore.total);
  const tier = scoreTierLabel(fairScore.total);
  scoreTier.textContent  = tier.label;
  scoreTier.className    = `score-tier ${tier.cls}`;
  scoreBench.textContent = `Market average: 58 · Your score: ${fairScore.total}`;
  fairscorePill.textContent = `Score: ${fairScore.total}`;

  // Factor bars
  renderFactorBars(fairScore.factors);

  // Narrative
  renderNarrative(narrative.helps, narrative.hurts);

  // Premium comparison
  fairMonthlyEl.textContent = `$${premium.monthly}`;
  tradMonthlyEl.textContent = `$${premium.tradMonthly}`;
  annualEstEl.textContent   = `$${premium.annualEstimate.toLocaleString()}/yr`;
  premiumRangeEl.textContent = `$${premium.range[0]} – $${premium.range[1]}/mo`;

  if (premium.fairSavings > 0) {
    savingsBannerEl.hidden   = false;
    savingsAmountEl.textContent = `$${premium.fairSavings}/mo`;
  } else {
    savingsBannerEl.hidden = true;
  }

  // Sync vehicle to garage
  setVehicle(inputs.vehicle);

  // Pre-populate coach
  renderCoach(recs, totalSav);
  if (totalSavingsEl) totalSavingsEl.textContent = `$${totalSav}/mo potential`;
});

// Render coach when user navigates there directly (if FairScore already computed)
viewButtons.forEach(b => {
  if (b.dataset.view === "coach") {
    b.addEventListener("click", () => {
      if (lastCoachRecs) renderCoach(lastCoachRecs, lastTotalSavings);
    });
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────

setVehicle(currentVehicle);
