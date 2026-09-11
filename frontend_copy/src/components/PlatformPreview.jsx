import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronRight, MapPin, Users } from "lucide-react";
import Reveal from "./Reveal.jsx";

export default function PlatformPreview() {
  const navigate = useNavigate();

  return (
    <div className="section" id="preview">
      <Reveal className="section-head">
        <div className="section-kicker">Platform preview</div>
        <h2 className="section-title">Everything your team needs, in one view</h2>
      </Reveal>

      <Reveal delay={100}>
        <div className="preview-frame">
          <div className="preview-chrome">
            <span />
            <span />
            <span />
          </div>
          <div className="preview-inner">
            <div className="preview-drone-bar">
              <div className="pd-id">🚁 UAV-01</div>
              <div className="preview-mini-stat">Battery <b>82%</b></div>
              <div className="preview-mini-stat">Altitude <b>120 m</b></div>
              <div className="preview-mini-stat">Speed <b>15 m/s</b></div>
              <div className="preview-flow">
                <MapPin size={12} /> Drone info
                <ChevronRight size={12} />
                Live map
                <ChevronRight size={12} />
                <Users size={12} /> Survivors
              </div>
            </div>

            <div className="preview-split">
              <div className="preview-map">
                <svg viewBox="0 0 400 220">
                  <circle cx="120" cy="90" r="46" fill="none" stroke="#EF4444" strokeDasharray="4 5" strokeWidth="1.4" opacity="0.6" />
                  <circle cx="270" cy="140" r="36" fill="none" stroke="#F59E0B" strokeDasharray="4 5" strokeWidth="1.4" opacity="0.6" />
                  <circle cx="150" cy="95" r="5" fill="#22D3EE" />
                  <circle cx="118" cy="88" r="4" fill="#EF4444" />
                  <circle cx="200" cy="60" r="4" fill="#F59E0B" />
                  <circle cx="260" cy="150" r="4" fill="#FACC15" />
                  <circle cx="90" cy="150" r="4" fill="#F59E0B" />
                </svg>
              </div>
              <div className="preview-list">
                <div className="preview-row" style={{ "--edge": "#EF4444" }}>
                  <b>SRV-025 · Critical</b>
                  Structural collapse — Sector D1
                </div>
                <div className="preview-row" style={{ "--edge": "#F59E0B" }}>
                  <b>SRV-021 · High</b>
                  Flooded residential — Sector B4
                </div>
                <div className="preview-row" style={{ "--edge": "#FACC15" }}>
                  <b>SRV-019 · Medium</b>
                  Debris field — Sector C2
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="preview-cta">
        <Reveal delay={160}>
          <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
            Open Command Dashboard
            <ArrowRight size={15} />
          </button>
        </Reveal>
      </div>
    </div>
  );
}
