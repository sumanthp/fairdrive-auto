// FairDrive AI Pricing Engine
// Multi-factor FairScore model: replaces blunt "no US history" penalty
// with a holistic assessment that credits international driving experience.

const VEHICLE_DATA = {
  accord: {
    label: "2023 Honda Accord",
    msrp: 28000,
    repairIndex: 62,
    theftIndex: 45,
    safetyRating: 88,
    isEV: false,
    baseMonthly: 320,
  },
  camry: {
    label: "2023 Toyota Camry",
    msrp: 27000,
    repairIndex: 58,
    theftIndex: 42,
    safetyRating: 90,
    isEV: false,
    baseMonthly: 300,
  },
  bmw: {
    label: "2023 BMW 330i",
    msrp: 44000,
    repairIndex: 88,
    theftIndex: 55,
    safetyRating: 85,
    isEV: false,
    baseMonthly: 480,
  },
  tesla: {
    label: "2023 Tesla Model 3",
    msrp: 41000,
    repairIndex: 82,
    theftIndex: 38,
    safetyRating: 92,
    isEV: true,
    baseMonthly: 440,
  },
  crv: {
    label: "2023 Honda CR-V",
    msrp: 31000,
    repairIndex: 60,
    theftIndex: 40,
    safetyRating: 86,
    isEV: false,
    baseMonthly: 285,
  },
};

// State rate multipliers relative to national average (1.0)
const STATE_MULTIPLIERS = {
  CA: 1.42, FL: 1.38, MI: 1.52, NY: 1.35, TX: 1.28,
  IL: 1.18, NJ: 1.45, MA: 1.25, MD: 1.30, GA: 1.22,
  WA: 1.12, CO: 1.15, AZ: 1.19, PA: 1.10, VA: 1.07,
  NC: 1.08, OH: 1.05, MN: 1.06, WI: 1.01, TN: 1.03,
};

// Mapping of international driving years to credit rate (0.0 – 0.30)
// FairCredit: the core differentiator — foreign history is not zero.
const INTL_CREDIT_TIERS = [
  { minYears: 10, rate: 0.30 },
  { minYears: 5,  rate: 0.22 },
  { minYears: 3,  rate: 0.15 },
  { minYears: 1,  rate: 0.08 },
  { minYears: 0,  rate: 0.00 },
];

function getIntlCreditRate(years) {
  const tier = INTL_CREDIT_TIERS.find(t => years >= t.minYears);
  return tier ? tier.rate : 0;
}

// FairScore: 0–100. Higher = lower risk = lower premium.
// Market average is ~58. New-to-US drivers with no history score ~32–40.
// With FairCredit applied, those same drivers can reach 50–65.
function computeFairScore(inputs) {
  const { vehicle, usHistoryYears, intlHistoryYears, annualMiles, state, cleanRecord, defensiveCourse } = inputs;
  const vd = VEHICLE_DATA[vehicle];

  // Factor 1: Vehicle Risk (max 30 pts)
  // Lower repair cost + lower theft + higher safety = more points
  const repairPenalty = (vd.repairIndex / 100) * 12;
  const theftPenalty  = (vd.theftIndex  / 100) * 6;
  const safetyBonus   = (vd.safetyRating / 100) * 12;
  const vehicleScore  = Math.max(0, Math.min(30, 30 - repairPenalty - theftPenalty + safetyBonus - 12));

  // Factor 2: Driving Credential (max 35 pts)
  // FairCredit: international history gets partial credit instead of zero.
  const usCredit    = Math.min(usHistoryYears * 4, 20);
  const intlCredit  = getIntlCreditRate(intlHistoryYears) * 20;
  const recordBonus = cleanRecord      ? 8 : 0;
  const courseBonus = defensiveCourse  ? 5 : 0;
  // Cold-start penalty only if truly zero history (no US, no intl)
  const coldStart   = (usHistoryYears === 0 && intlHistoryYears === 0) ? -15 : 0;
  const credentialScore = Math.max(0, Math.min(35, usCredit + intlCredit + recordBonus + courseBonus + coldStart));

  // Factor 3: Geographic Risk (max 20 pts)
  const stateMult = STATE_MULTIPLIERS[state] || 1.10;
  const geoScore  = Math.max(0, Math.min(20, 20 - (stateMult - 1.0) * 50));

  // Factor 4: Mileage Pattern (max 10 pts)
  // Low mileage = lower exposure
  const mileScore =
    annualMiles <= 5000  ? 10 :
    annualMiles <= 7500  ? 8  :
    annualMiles <= 12000 ? 6  :
    annualMiles <= 20000 ? 3  : 1;

  // Factor 5: Coverage Behavior (max 5 pts — higher deductibles show responsibility)
  const coverageScore = 5;

  const raw = vehicleScore + credentialScore + geoScore + mileScore + coverageScore;
  const total = Math.max(10, Math.min(95, Math.round(raw)));

  return {
    total,
    factors: {
      vehicle:    { score: Math.round(Math.max(0, vehicleScore)),    max: 30, label: "Vehicle Risk" },
      credential: { score: Math.round(Math.max(0, credentialScore)), max: 35, label: "Driving Credential" },
      geographic: { score: Math.round(Math.max(0, geoScore)),        max: 20, label: "Geographic Risk" },
      mileage:    { score: mileScore,                                max: 10, label: "Mileage Pattern" },
      coverage:   { score: coverageScore,                            max: 5,  label: "Coverage Behavior" },
    },
  };
}

// What a traditional insurer would score — ignoring international history.
function computeTraditionalScore(inputs) {
  return computeFairScore({ ...inputs, intlHistoryYears: 0 });
}

// Monthly premium from FairScore + state multiplier + coverage level.
function computePremium(inputs, fairScore) {
  const { vehicle, state, coverageLevel } = inputs;
  const vd = VEHICLE_DATA[vehicle];
  const stateMult = STATE_MULTIPLIERS[state] || 1.10;
  const coverageMult =
    coverageLevel === "basic"      ? 0.72 :
    coverageLevel === "premium"    ? 1.28 : 1.0;

  // Each point above 58 shaves ~1.2% off premium; below 58 adds 1.2%
  const fairAdj = 1 - ((fairScore.total - 58) * 0.012);
  const monthly  = Math.max(80, Math.round(vd.baseMonthly * stateMult * coverageMult * fairAdj));

  const tradScore = computeTraditionalScore(inputs);
  const tradAdj   = 1 - ((tradScore.total - 58) * 0.012);
  const tradMonthly = Math.max(80, Math.round(vd.baseMonthly * stateMult * coverageMult * tradAdj));

  const fairSavings = Math.max(0, tradMonthly - monthly);

  return {
    monthly,
    tradMonthly,
    fairSavings,
    range: [Math.round(monthly * 0.90), Math.round(monthly * 1.12)],
    annualEstimate: monthly * 12,
  };
}

// AI coach: ranked, savings-quantified action items.
function getCoachRecommendations(inputs, fairScore, premium) {
  const recs = [];
  const vd = VEHICLE_DATA[inputs.vehicle];

  if (inputs.intlHistoryYears >= 2 && inputs.usHistoryYears < 2) {
    recs.push({
      priority: 1,
      icon: "✦",
      title: "Submit International Driving Record (FairCredit)",
      detail: `${inputs.intlHistoryYears} years of verified foreign driving qualifies for FairCredit recognition. Most partner carriers accept a certified no-claims letter from your home country insurer.`,
      action: "Add to Passport",
      savings: Math.round(premium.fairSavings * 0.65),
    });
  }

  if (!inputs.cleanRecord) {
    recs.push({
      priority: 2,
      icon: "◎",
      title: "Clear or Dispute DMV Record Items",
      detail: "Even one at-fault incident can add 30–50% to your premium for 3 years. If the incident was minor or ≥3 years ago, some carriers will re-rate sooner.",
      action: "Review record",
      savings: Math.round(premium.monthly * 0.22),
    });
  }

  if (!inputs.defensiveCourse) {
    recs.push({
      priority: 3,
      icon: "◆",
      title: "Complete a Defensive Driving Course",
      detail: "Online courses take 4–6 hours and cost $20–$50. Most U.S. carriers offer 5–10% discount for verified completion and it signals commitment to safe driving.",
      action: "Find a course",
      savings: Math.round(premium.monthly * 0.07),
    });
  }

  if (inputs.annualMiles > 8000) {
    recs.push({
      priority: 4,
      icon: "◈",
      title: "Enroll in Pay-Per-Mile Coverage",
      detail: `At ${inputs.annualMiles.toLocaleString()} miles/year you're paying for more exposure than you use. Usage-based policies from carriers like Metromile or Mile Auto can save 20–40% for drivers under 10,000 mi/year.`,
      action: "Check eligibility",
      savings: Math.round(premium.monthly * 0.18),
    });
  }

  if (vd.repairIndex > 75) {
    recs.push({
      priority: 5,
      icon: "◇",
      title: `Switch to a Lower Repair-Cost Vehicle`,
      detail: `The ${vd.label} has a repair cost index of ${vd.repairIndex}/100 — well above average. A Honda CR-V (index 60) or Toyota Camry (index 58) could reduce your premium significantly without sacrificing quality.`,
      action: "Compare vehicles",
      savings: Math.round(premium.monthly * 0.17),
    });
  }

  recs.push({
    priority: 6,
    icon: "◉",
    title: "Raise Collision Deductible to $1,000",
    detail: "Moving from a $500 to $1,000 collision deductible typically reduces monthly premium by 8–12%. Keep the difference in an emergency fund — statistically, most drivers go years without a claim.",
    action: "Model the tradeoff",
    savings: Math.round(premium.monthly * 0.10),
  });

  return recs.sort((a, b) => a.priority - b.priority);
}

// Describe what's hurting and helping the FairScore
function getScoreNarrative(inputs, fairScore) {
  const helps = [];
  const hurts = [];
  const vd = VEHICLE_DATA[inputs.vehicle];

  if (vd.safetyRating >= 88) helps.push(`${vd.label} has a top safety rating`);
  if (vd.repairIndex > 75)   hurts.push(`${vd.label} has above-average repair costs`);
  if (inputs.intlHistoryYears >= 3) helps.push(`${inputs.intlHistoryYears} years of international driving history (FairCredit)`);
  if (inputs.usHistoryYears === 0 && inputs.intlHistoryYears === 0) hurts.push("no driving history on file anywhere");
  if (inputs.cleanRecord)    helps.push("clean driving record");
  if (!inputs.cleanRecord)   hurts.push("incidents on driving record");
  if (inputs.defensiveCourse) helps.push("defensive driving certification");
  if (inputs.annualMiles <= 7500) helps.push("low annual mileage");
  if (inputs.annualMiles > 15000) hurts.push("high annual mileage increases exposure");

  const stateMult = STATE_MULTIPLIERS[inputs.state] || 1.10;
  if (stateMult >= 1.30) hurts.push(`${inputs.state} is a high-cost insurance state`);
  if (stateMult <= 1.08) helps.push(`${inputs.state} has below-average insurance rates`);

  return { helps, hurts };
}

window.FairDriveAI = {
  computeFairScore,
  computeTraditionalScore,
  computePremium,
  getCoachRecommendations,
  getScoreNarrative,
  VEHICLE_DATA,
  STATE_MULTIPLIERS,
};
