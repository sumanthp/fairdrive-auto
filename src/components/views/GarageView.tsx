import type { VehicleKey } from "@/lib/types";
import { VEHICLE_DATA } from "@/lib/ai-engine";
import StatusPill from "@/components/ui/StatusPill";

interface Props {
  vehicle: VehicleKey;
}

export default function GarageView({ vehicle }: Props) {
  const vehicleData = VEHICLE_DATA[vehicle];
  return (
    <div className="view-grid">
      <article className="panel large-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Garage</p>
            <h3>{vehicleData.label}</h3>
          </div>
          <StatusPill variant="warning">Coverage gaps</StatusPill>
        </div>
        <div className="coverage-map">
          <div className="coverage-row">
            <span>Liability</span>
            <strong className="good">$100k / $300k</strong>
          </div>
          <div className="coverage-row">
            <span>Collision deductible</span>
            <strong>$500</strong>
          </div>
          <div className="coverage-row">
            <span>Comprehensive</span>
            <strong className="good">Active</strong>
          </div>
          <div className="coverage-row">
            <span>Uninsured motorist</span>
            <strong className="warn">Missing</strong>
          </div>
        </div>
      </article>

      <article className="panel">
        <p className="eyebrow">Insurance Passport</p>
        <h3>62% complete</h3>
        <div className="progress-track">
          <span style={{ width: "62%" }} />
        </div>
        <ul className="task-list">
          <li className="done">U.S. license added</li>
          <li className="done">Vehicle verified</li>
          <li>Foreign license pending</li>
          <li>No-claims proof pending</li>
        </ul>
      </article>

      <article className="panel">
        <p className="eyebrow">Savings path</p>
        <h3>3 actions found</h3>
        <ul className="task-list">
          <li>Upload no-claims letter — est. save $38/mo</li>
          <li>Compare $1,000 deductible — est. save $32/mo</li>
          <li>Add uninsured motorist coverage</li>
        </ul>
      </article>
    </div>
  );
}
