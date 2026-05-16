# FairDrive Auto — AI Roadmap

> **Vision:** The first AI-native auto insurer that prices drivers on *who they are*, not just *where they've been insured*. FairDrive replaces the blunt U.S.-history penalty with a multi-dimensional FairScore — unlocking affordable coverage for 8M+ immigrants, international students, and new U.S. drivers who are systematically overcharged.

---

## Why This Market Is Broken

Traditional auto insurance uses U.S. insurance history as a proxy for risk. A driver with 15 years of safe driving in Germany, India, or Brazil arrives in the U.S. and is quoted the same premium as a teenager with no history at all. This is not actuarially sound — it is a data gap that incumbents have never bothered to close.

FairDrive closes that gap with AI.

---

## Core Differentiators

| What incumbents do | What FairDrive does |
|---|---|
| Require 3+ years U.S. history for best rates | Credit verified international driving history (FairCredit) |
| Black-box pricing with no explanation | Transparent FairScore with factor breakdown |
| Static annual pricing | Continuous behavioral repricing (telematics) |
| One-size pricing ignores mileage | Pay-per-mile option for low-usage drivers |
| Require agents for every change | Self-serve AI coach with quantified savings actions |
| English-only, complex forms | Multi-language AI onboarding (Claude-powered) |
| No help understanding your quote | AI Quote Explainer: plain-language breakdown of every line item |

---

## Phased Roadmap

### Phase 1 — AI Foundation (0–6 months)

**Goal:** Replace the demo prototype with a production-grade AI pricing engine and real document processing.

#### 1.1 Tech Stack Modernization
- [ ] Migrate to Next.js 14+ (App Router) with TypeScript
- [ ] Replace CDN Three.js with local `@react-three/fiber` + `@react-three/drei`
- [ ] Set up PostgreSQL (Supabase) for user profiles and document metadata
- [ ] Add Clerk or Auth0 for authentication + MFA
- [ ] Deploy on Vercel with edge functions for sub-100ms API responses
- [ ] Add Sentry for error tracking, PostHog for product analytics

#### 1.2 FairScore Engine (implemented in v0.1)
- [x] Multi-factor pricing model: vehicle risk, driving credential, geographic, mileage, coverage
- [x] FairCredit: international driving years mapped to actuarial credit rate
- [x] Traditional vs. FairDrive premium comparison
- [x] AI coach: ranked savings recommendations with quantified monthly impact
- [x] Score narrative: plain-language explanation of what's helping/hurting
- [ ] Calibrate factors against ISO/NCCI rate filings for 10 target states
- [ ] Bayesian confidence intervals on premium range (replace simple ±10%)
- [ ] A/B test FairScore vs. traditional form for conversion rate

#### 1.3 Document Intelligence (Claude API)
- [ ] Integrate Claude claude-sonnet-4-6 for policy document OCR + extraction
- [ ] Extract: carrier name, effective dates, premium breakdown, coverage limits, deductibles
- [ ] Cross-reference extracted limits against state minimums — flag gaps automatically
- [ ] International document support: parse IDP (International Driving Permit), foreign no-claims letters
- [ ] Structured output schema (JSON) for downstream pricing and comparison
- [ ] Confidence scoring on extracted fields — human review queue for low-confidence items

#### 1.4 Insurance Passport MVP
- [ ] Secure document upload (S3 + pre-signed URLs, client-side encryption)
- [ ] Six document types: U.S. license, foreign license, no-claims proof, vehicle registration, current policy, telematics consent
- [ ] Document verification status with estimated completion time
- [ ] Passport share link: generate a read-only URL drivers share with agents
- [ ] Privacy controls: per-document consent, granular partner sharing toggles
- [ ] GDPR/CCPA-compliant deletion

---

### Phase 2 — Intelligence Layer (6–12 months)

**Goal:** Build the AI systems that create a sustainable moat — behavioral pricing, document intelligence at scale, and multi-language onboarding.

#### 2.1 Telematics & Behavioral Scoring
- [ ] SDK integration: Arity (Allstate), Verisk DriveAbility, or LexisNexis Telematics One
- [ ] Mobile SDK for iOS/Android: accelerometer + GPS trip scoring (no constant tracking)
- [ ] Drive Score factors: hard braking, acceleration, cornering, night driving %, distracted driving proxy
- [ ] Consent-first architecture: users see their own score before it's shared with any carrier
- [ ] Drive Score improves FairScore continuously — monthly premium repricing for good drivers

#### 2.2 Claude-Powered Quote Explainer
- [ ] Streaming AI explanation of every quote line item (Claude claude-sonnet-4-6 via Anthropic API)
- [ ] Source-backed answers: every AI claim links to the policy document page or carrier rate filing
- [ ] Multi-turn conversation: "Why is my comprehensive so high?" → follow-up questions
- [ ] Guardrails: no guaranteed savings claims, no specific carrier recommendations without licensed-agent handoff
- [ ] Prompt caching for common query patterns — reduce latency and API cost
- [ ] Multilingual: Spanish, Hindi, Mandarin, Korean, Portuguese, Tagalog (top immigrant languages)

#### 2.3 Market Intelligence Layer
- [ ] Carrier rate filing scraper: parse state DOI rate filings (public record) for 10 states
- [ ] Market median premium by: vehicle + state + profile tier + coverage level
- [ ] "You are paying X% above market median" benchmark shown to every user
- [ ] Carrier appetite model: which carriers are currently hungry for new-to-US customers
- [ ] Integration with Verisk LOCATION, ISO territories for geographic risk data

#### 2.4 AI Onboarding
- [ ] Replace long-form application with conversational AI intake (Claude-powered chat)
- [ ] Dynamic question tree: ask only what's relevant based on prior answers
- [ ] Reduce average onboarding time from 12 minutes → under 3 minutes
- [ ] Sentiment analysis: detect frustrated users, route to human agent proactively
- [ ] Voice onboarding: Web Speech API for accessibility

---

### Phase 3 — Market Entry (12–18 months)

**Goal:** Go from intelligence platform to licensed insurance distribution. First revenue.

#### 3.1 Licensed Distribution Infrastructure
- [ ] Apply for MGA (Managing General Agent) license in top 5 states (TX, CA, FL, NY, IL)
- [ ] Carrier appointments: Progressive, Mercury, Dairyland (appetite for new drivers)
- [ ] E&O insurance for agent operations
- [ ] Compliance engine: state-by-state rule matrix for what AI can/cannot recommend
- [ ] Licensed agent network: 1099 agents on standby for regulated handoffs
- [ ] ACORD XML integration for carrier submission

#### 3.2 FairBind Product
- [ ] Real-time bindable quotes from 3+ carriers for each FairScore profile
- [ ] "Best carrier match" AI: routes each profile to the carrier currently pricing that risk favorably
- [ ] Instant digital ID cards (PDF + Apple/Google Wallet)
- [ ] Policy management: mid-term changes, payments, claims FNOL via chat
- [ ] Carrier API integrations: Progressive API, Openly, Coterie (modern carriers with APIs)

#### 3.3 FairCredit Verification Network
- [ ] Partner with international insurers (UK, India, Germany, Canada) for direct record verification
- [ ] CARFAX International (existing database of 30+ countries)
- [ ] Certified translation service for foreign no-claims letters
- [ ] Risk model recalibration: measure loss ratio of FairCredit customers vs. traditional new drivers
- [ ] Actuarial sign-off: file rate adjustments for verified FairCredit cohort

#### 3.4 Pay-Per-Mile Product
- [ ] White-label Metromile/Mile Auto for FairDrive customers
- [ ] Base rate (parked car coverage) + per-mile rate
- [ ] Target: immigrant drivers who commute by transit and drive <6,000 mi/year
- [ ] OBD-II plug-in device or mobile app odometer (no GPS required for basic tier)

---

### Phase 4 — Scale (18–24 months)

**Goal:** National footprint, category leadership, and defensible AI data moat.

#### 4.1 Continuous Learning Pricing
- [ ] Cohort loss ratio analysis: FairCredit customers vs. traditional new-driver cohort
- [ ] Monthly model refresh: retrain FairScore weights on actual loss data
- [ ] Adverse selection detection: flag profiles scoring anomalously high against loss history
- [ ] Federated learning: improve Drive Score model without centralizing raw GPS data
- [ ] MLflow for experiment tracking, model versioning, and rollback

#### 4.2 Community & Network Effects
- [ ] Referral program: immigrant community networks (Desi diaspora, Indian Professionals, etc.)
- [ ] Group policies: employers sponsoring FairDrive for H1B hires (B2B channel)
- [ ] University partnerships: international student insurance packages
- [ ] Affinity groups: alumni associations, cultural organizations

#### 4.3 Claims Intelligence
- [ ] AI-first FNOL (First Notice of Loss): guided photo documentation via mobile
- [ ] Computer vision for damage severity estimation (reduce cycle time)
- [ ] Fraud detection: cross-reference claim patterns against network data
- [ ] Subrogation automation: identify recovery opportunities automatically

#### 4.4 Platform Expansion
- [ ] Renters insurance bundling (natural adjacent product for apartment-dwelling immigrants)
- [ ] International health insurance bridge product (gap coverage during first 90 days)
- [ ] Data licensing to carriers: anonymized FairScore insights (opt-in only)

---

## Technology Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FairDrive Platform                    │
├──────────────┬──────────────────────┬───────────────────┤
│   Web/App    │    AI Services       │  Data & Carriers  │
├──────────────┼──────────────────────┼───────────────────┤
│ Next.js 14   │ Claude claude-sonnet-4-6          │ PostgreSQL/Supabase│
│ React Three  │ - Quote Explainer    │ S3 (documents)    │
│ Fiber (3D)   │ - Doc Extraction     │ Verisk APIs       │
│ Clerk Auth   │ - Onboarding Chat    │ LexisNexis        │
│              │ FairScore Engine     │ ISO Territory     │
│              │ - Multi-factor model │ Carrier APIs:     │
│              │ - FairCredit calc    │ - Progressive     │
│              │ - Coach recs         │ - Mercury         │
│              │ Drive Score SDK      │ - Openly          │
│              │ - Arity / Verisk     │ ACORD XML         │
│              │ MLflow (versioning)  │ Stripe (payments) │
└──────────────┴──────────────────────┴───────────────────┘
```

---

## Regulatory Strategy

| Requirement | Approach |
|---|---|
| State insurance license | MGA structure — partner with licensed carrier fronts (Homepoint, Spinnaker) |
| Rate filing | File FairScore methodology with state DOIs; actuarial justification for FairCredit |
| AI fairness | Avoid protected classes; FairCredit uses years of history, not country of origin |
| Data privacy | CCPA/GDPR compliant; per-document consent; right to deletion |
| Document AI | Disclosures when AI is used for extraction; human review queue |
| Savings claims | Never promise specific savings; always "estimate" with disclaimer |

---

## Revenue Model

| Stream | Timing | Margin |
|---|---|---|
| Commission on bound policies (12–15% of premium) | Phase 3 | ~75% gross margin |
| Pay-per-mile policy administration fee | Phase 3 | ~65% |
| FairCredit verification premium ($15–25/verification) | Phase 2 | ~80% |
| Group policy admin fee (employer channel) | Phase 4 | ~70% |
| Carrier data licensing (opt-in anonymized FairScore data) | Phase 4 | ~90% |

---

## Key Risk Guardrails

1. **Never promise guaranteed savings** — always use "estimate" and show disclaimer
2. **International history = credit, not substitution** — FairCredit supplements US history, never replaces actuarial factors
3. **Immigration documents are optional** — never required; ITIN ≠ immigration status for pricing
4. **No protected class proxies** — country of birth is never an input; only driving years and verified records
5. **Licensed agent handoff** — AI coaches and explains; a licensed human binds the policy
6. **Source-backed AI answers** — every Claude response must cite the policy document or rate filing
7. **Consent before sharing** — users approve each partner data share; no silent routing

---

## Success Metrics

| Metric | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|---|---|---|---|---|
| Users with FairScore computed | 1,000 | 25,000 | 200,000 | 1M+ |
| Avg FairScore delta vs. traditional | +8 pts | +12 pts | +14 pts | +16 pts |
| Monthly savings surfaced (median) | $42 | $58 | $67 | $74 |
| Policies bound | 0 | 0 | 5,000 | 50,000 |
| Loss ratio (FairCredit cohort) | — | — | <72% | <68% |
| NPS | — | 58 | 65 | 72 |

---

*FairDrive Auto — pricing drivers on who they are, not just where they've been insured.*
