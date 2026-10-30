import React from "react";
import { Battery, Mountain, Wind } from "lucide-react";

export default function DroneInfo({ drone }) {
  return (
    <div className="drone-info">
      <div className="drone-id">
        <div className="drone-emoji">🚁</div>
        <div className="drone-names">
          <div className="drone-code">{drone.id}</div>
          <div className="drone-alias">{drone.alias}</div>
        </div>
      </div>

      <div className="drone-status">
        <span className="dot cyan dot-pulse" />
        {drone.status}
      </div>

      <div className="divider-v" />

      <div className="stat-group">
        <div className="stat">
          <div className="stat-label">Battery</div>
          <div className="stat-value-row">
            <Battery size={14} className="stat-icon" />
            <span className="stat-value tabular">{drone.battery}%</span>
          </div>
          <div className="battery-track">
            <div className="battery-fill" style={{ width: `${drone.battery}%` }} />
          </div>
        </div>

        <div className="stat">
          <div className="stat-label">Altitude</div>
          <div className="stat-value-row">
            <Mountain size={14} className="stat-icon" />
            <span className="stat-value tabular">{drone.altitude}</span>
            <span className="stat-unit">m</span>
          </div>
        </div>

        <div className="stat">
          <div className="stat-label">Speed</div>
          <div className="stat-value-row">
            <Wind size={14} className="stat-icon" />
            <span className="stat-value tabular">{drone.speed}</span>
            <span className="stat-unit">m/s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
