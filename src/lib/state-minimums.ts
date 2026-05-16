// US State Auto Insurance Minimums
// Sources: NAIC, individual state DMV/DOT public data (as of 2024)

import type { CoverageLimits, StateMinimumsComparison } from "./types";

export interface StateMini {
  liabilityBodily: string;   // format: "per-person/per-accident" e.g. "15/30"
  liabilityProperty: string; // per-accident limit in thousands e.g. "5"
  requiresUninsuredMotorist: boolean;
  pipRequired: boolean;
  notes: string;
}

export const STATE_MINIMUMS: Record<string, StateMini> = {
  CA: {
    liabilityBodily: "15/30",
    liabilityProperty: "5",
    requiresUninsuredMotorist: false,
    pipRequired: false,
    notes: "California requires 15/30/5. No-fault or PIP not required. UM/UIM offered but optional.",
  },
  TX: {
    liabilityBodily: "30/60",
    liabilityProperty: "25",
    requiresUninsuredMotorist: false,
    pipRequired: false,
    notes: "Texas raised minimums to 30/60/25 in 2025. PIP optional (must sign waiver to decline).",
  },
  FL: {
    liabilityBodily: "10/20",
    liabilityProperty: "10",
    requiresUninsuredMotorist: false,
    pipRequired: true,
    notes: "Florida is a no-fault state. Requires $10,000 PIP and $10,000 PDL. Bodily injury liability not mandatory for all drivers (but 10/20 if required).",
  },
  NY: {
    liabilityBodily: "25/50",
    liabilityProperty: "10",
    requiresUninsuredMotorist: true,
    pipRequired: true,
    notes: "New York is a no-fault state. Requires $50,000 PIP per person. UM/UIM coverage required at 25/50.",
  },
  IL: {
    liabilityBodily: "25/50",
    liabilityProperty: "20",
    requiresUninsuredMotorist: true,
    pipRequired: false,
    notes: "Illinois requires UM/UIM at 25/50. No PIP requirement.",
  },
  WA: {
    liabilityBodily: "25/50",
    liabilityProperty: "10",
    requiresUninsuredMotorist: false,
    pipRequired: false,
    notes: "Washington state. PIP optional. UM/UIM offered but optional.",
  },
  MA: {
    liabilityBodily: "20/40",
    liabilityProperty: "5",
    requiresUninsuredMotorist: true,
    pipRequired: true,
    notes: "Massachusetts is a no-fault state. Requires $8,000 PIP. UM required at 20/40. Compulsory coverage required.",
  },
  NJ: {
    liabilityBodily: "15/30",
    liabilityProperty: "5",
    requiresUninsuredMotorist: true,
    pipRequired: true,
    notes: "New Jersey no-fault state. Requires PIP ($15k basic or $250k standard). UM required.",
  },
  GA: {
    liabilityBodily: "25/50",
    liabilityProperty: "25",
    requiresUninsuredMotorist: false,
    pipRequired: false,
    notes: "Georgia minimums 25/50/25. No PIP requirement. UM optional.",
  },
  CO: {
    liabilityBodily: "25/50",
    liabilityProperty: "15",
    requiresUninsuredMotorist: false,
    pipRequired: false,
    notes: "Colorado minimums 25/50/15. MedPay optional. UM optional.",
  },
  AZ: {
    liabilityBodily: "25/50",
    liabilityProperty: "15",
    requiresUninsuredMotorist: false,
    pipRequired: false,
    notes: "Arizona minimums 25/50/15. No PIP required. UM optional.",
  },
  VA: {
    liabilityBodily: "30/60",
    liabilityProperty: "20",
    requiresUninsuredMotorist: true,
    pipRequired: false,
    notes: "Virginia raised minimums to 30/60/20 in 2025. UM/UIM required at same limits.",
  },
  NC: {
    liabilityBodily: "30/60",
    liabilityProperty: "25",
    requiresUninsuredMotorist: true,
    pipRequired: false,
    notes: "North Carolina requires UM/UIM at 30/60/25. No PIP requirement.",
  },
  PA: {
    liabilityBodily: "15/30",
    liabilityProperty: "5",
    requiresUninsuredMotorist: false,
    pipRequired: true,
    notes: "Pennsylvania is a choice no-fault state. Requires first-party benefits (medical). UM optional.",
  },
  MD: {
    liabilityBodily: "30/60",
    liabilityProperty: "15",
    requiresUninsuredMotorist: true,
    pipRequired: true,
    notes: "Maryland requires PIP ($2,500 minimum) and UM/UIM at 30/60/15.",
  },
  MI: {
    liabilityBodily: "50/100",
    liabilityProperty: "10",
    requiresUninsuredMotorist: false,
    pipRequired: true,
    notes: "Michigan no-fault state with highest minimum BI at 50/100. PIP required (tiered options available).",
  },
  OH: {
    liabilityBodily: "25/50",
    liabilityProperty: "25",
    requiresUninsuredMotorist: false,
    pipRequired: false,
    notes: "Ohio minimums 25/50/25. No PIP requirement. UM optional.",
  },
  MN: {
    liabilityBodily: "30/60",
    liabilityProperty: "10",
    requiresUninsuredMotorist: true,
    pipRequired: true,
    notes: "Minnesota is a no-fault state. Requires $40,000 PIP (20k medical/20k non-medical). UM required at 25/50.",
  },
  TN: {
    liabilityBodily: "25/50",
    liabilityProperty: "15",
    requiresUninsuredMotorist: false,
    pipRequired: false,
    notes: "Tennessee minimums 25/50/15. No PIP requirement. UM optional.",
  },
  WI: {
    liabilityBodily: "25/50",
    liabilityProperty: "10",
    requiresUninsuredMotorist: true,
    pipRequired: false,
    notes: "Wisconsin requires UM/UIM at 25/50. No PIP requirement.",
  },
};

// Default fallback for unknown states
export const DEFAULT_STATE_MINIMUM: StateMini = {
  liabilityBodily: "25/50",
  liabilityProperty: "25",
  requiresUninsuredMotorist: false,
  pipRequired: false,
  notes: "Default national minimums — verify requirements for your specific state.",
};

/**
 * Parse a liability bodily injury limit string like "25/50" into per-person and per-accident values.
 * Returns null if the format is unexpected.
 */
function parseLiabilityBodily(value: string | undefined): { perPerson: number; perAccident: number } | null {
  if (!value) return null;
  const parts = value.split("/");
  if (parts.length !== 2) return null;
  const perPerson = parseInt(parts[0], 10);
  const perAccident = parseInt(parts[1], 10);
  if (isNaN(perPerson) || isNaN(perAccident)) return null;
  return { perPerson, perAccident };
}

/**
 * Parse a policy bodily liability string from the extraction.
 * Handles formats like "25/50", "25000/50000", "$25,000/$50,000", "100 CSL".
 * Returns thousands-normalized values or null.
 */
function parsePolicyLiabilityBodily(value: string | undefined): { perPerson: number; perAccident: number } | null {
  if (!value) return null;

  // Try slash-separated format, normalize large numbers to thousands
  const slashMatch = value.match(/(\d[\d,]*)\s*\/\s*(\d[\d,]*)/);
  if (slashMatch) {
    const pp = parseInt(slashMatch[1].replace(/,/g, ""), 10);
    const pa = parseInt(slashMatch[2].replace(/,/g, ""), 10);
    if (!isNaN(pp) && !isNaN(pa)) {
      // Normalize: if values look like full dollars (>= 1000), convert to thousands
      return {
        perPerson: pp >= 1000 ? pp / 1000 : pp,
        perAccident: pa >= 1000 ? pa / 1000 : pa,
      };
    }
  }

  return null;
}

/**
 * Compare a policy's coverages against the state minimums.
 * Returns a StateMinimumsComparison indicating adequacy and any gaps.
 */
export function checkStateMinimumsCompliance(
  coverages: CoverageLimits,
  state: string,
): StateMinimumsComparison {
  const minimum = STATE_MINIMUMS[state.toUpperCase()] ?? DEFAULT_STATE_MINIMUM;
  const gaps: string[] = [];

  // ── Liability Bodily Injury ────────────────────────────────────────────────
  const minBI = parseLiabilityBodily(minimum.liabilityBodily);
  const policyBI = parsePolicyLiabilityBodily(coverages.liability?.bodily);

  let liabilityAdequate = false;

  if (!policyBI || !minBI) {
    if (!policyBI) {
      gaps.push(
        `Bodily injury liability not found in policy (state minimum: ${minimum.liabilityBodily} in thousands)`,
      );
    }
    liabilityAdequate = false;
  } else if (policyBI.perPerson < minBI.perPerson || policyBI.perAccident < minBI.perAccident) {
    gaps.push(
      `Bodily injury liability ${policyBI.perPerson}/${policyBI.perAccident}k is below ${state} minimum of ${minimum.liabilityBodily}k`,
    );
    liabilityAdequate = false;
  } else {
    liabilityAdequate = true;
  }

  // ── Liability Property Damage ──────────────────────────────────────────────
  const minPD = parseInt(minimum.liabilityProperty, 10);
  const policyPDRaw = coverages.liability?.property;
  if (policyPDRaw) {
    const rawNum = parseInt(policyPDRaw.replace(/[^0-9]/g, ""), 10);
    const policyPD = rawNum >= 1000 ? rawNum / 1000 : rawNum;
    if (!isNaN(policyPD) && policyPD < minPD) {
      gaps.push(
        `Property damage liability ${policyPD}k is below ${state} minimum of ${minPD}k`,
      );
      liabilityAdequate = false;
    }
  } else {
    gaps.push(
      `Property damage liability not found in policy (state minimum: ${minPD}k)`,
    );
    liabilityAdequate = false;
  }

  // ── Uninsured Motorist ─────────────────────────────────────────────────────
  const uninsuredMotoristPresent = coverages.uninsuredMotorist?.active === true;
  if (minimum.requiresUninsuredMotorist && !uninsuredMotoristPresent) {
    gaps.push(`Uninsured motorist coverage is required in ${state} but not present in policy`);
  }

  // ── PIP / No-Fault ─────────────────────────────────────────────────────────
  if (minimum.pipRequired) {
    const pipPresent = coverages.medical?.active === true;
    if (!pipPresent) {
      gaps.push(
        `Personal Injury Protection (PIP) / no-fault medical coverage is required in ${state}`,
      );
    }
  }

  return {
    liabilityAdequate,
    uninsuredMotoristPresent,
    gaps,
  };
}
