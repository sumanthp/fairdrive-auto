import Link from "next/link";

export default function MarketingPage() {
  return (
    <div className="marketing-body">
      <header className="marketing-nav">
        <a className="brand marketing-brand" href="/" aria-label="FairDrive home">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>
            <span className="brand-name">FairDrive</span>
            <span className="brand-subtitle">Auto Insurance Passport</span>
          </span>
        </a>
        <nav aria-label="Marketing navigation">
          <a href="#product">Product</a>
          <a href="#mvp">MVP</a>
          <a href="#trust">Trust</a>
          <Link className="nav-cta" href="/dashboard">Launch App</Link>
        </nav>
      </header>

      <main>
        <section className="marketing-hero">
          <div className="marketing-hero-copy">
            <p className="eyebrow">AI-native auto insurance</p>
            <h1>Auto insurance for drivers whose history did not start in the U.S.</h1>
            <p>
              FairDrive helps immigrants, H1B workers, students, and first-time U.S.
              drivers understand expensive premiums, organize stronger evidence, and
              find a path toward better options where available.
            </p>
            <div className="hero-actions">
              <Link className="primary-button" href="/dashboard">Launch App</Link>
              <a className="secondary-button" href="#product">See product</a>
            </div>
          </div>

          <div className="marketing-hero-visual" aria-label="FairDrive product preview">
            <div className="marketing-device">
              <div className="device-topline">
                <span></span>
                <strong>$386/mo</strong>
              </div>
              <div className="device-car">
                <div className="device-car-roof"></div>
                <div className="device-car-body"></div>
                <div className="device-wheel left"></div>
                <div className="device-wheel right"></div>
              </div>
              <div className="device-insight">
                <span>Premium insight</span>
                <strong>3 actions may improve your profile</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="marketing-band" id="product">
          <div className="section-heading">
            <p className="eyebrow">Product</p>
            <h2>A digital garage for insurance clarity</h2>
            <p>
              The experience starts with the car, then guides users through coverage,
              documents, quotes, and savings actions without traditional insurance friction.
            </p>
          </div>

          <div className="marketing-grid three">
            <article className="marketing-card">
              <span className="card-index">01</span>
              <h3>3D Vehicle Garage</h3>
              <p>
                Users explore coverage around their selected vehicle, inspect gaps,
                and compare models before buying a car.
              </p>
            </article>
            <article className="marketing-card">
              <span className="card-index">02</span>
              <h3>Insurance Passport</h3>
              <p>
                A reusable profile for U.S. license, foreign license, no-claims proof,
                current policy, vehicle data, and future drive score.
              </p>
            </article>
            <article className="marketing-card">
              <span className="card-index">03</span>
              <h3>AI Quote Explainer</h3>
              <p>
                Upload a quote or policy and get a plain-language explanation of premium
                drivers, coverage gaps, and realistic next steps.
              </p>
            </article>
          </div>
        </section>

        <section className="marketing-split" id="mvp">
          <div>
            <p className="eyebrow">MVP wedge</p>
            <h2>Start with the pain users already feel</h2>
            <p>
              The first release should focus on quote upload, premium explanation,
              Insurance Passport completion, and licensed-agent handoff. Telematics and
              full carrier integrations should come after demand is proven.
            </p>
          </div>
          <div className="mvp-list">
            <div>
              <strong>Explain</strong>
              <span>Why is this premium so high?</span>
            </div>
            <div>
              <strong>Organize</strong>
              <span>What proof can make my profile stronger?</span>
            </div>
            <div>
              <strong>Compare</strong>
              <span>Which car or coverage choice changes the cost?</span>
            </div>
            <div>
              <strong>Escalate</strong>
              <span>When should a licensed agent review my options?</span>
            </div>
          </div>
        </section>

        <section className="marketing-band" id="trust">
          <div className="section-heading">
            <p className="eyebrow">Trust and compliance</p>
            <h2>Fairness needs careful wording and real guardrails</h2>
          </div>
          <div className="marketing-grid two">
            <article className="marketing-card">
              <h3>Clear Promise</h3>
              <p>
                FairDrive should not guarantee savings. It should help users understand
                premiums, organize evidence, compare options, and find a path toward better
                costs where available.
              </p>
            </article>
            <article className="marketing-card">
              <h3>Human Handoff</h3>
              <p>
                AI can explain and prepare, but regulated recommendations and binding
                workflows need licensed-agent or partner support.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
