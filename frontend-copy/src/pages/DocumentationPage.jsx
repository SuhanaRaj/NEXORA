import React, { useState } from "react";
import { Radar, Cpu, Camera, Radio, Volume2, Satellite, BatteryCharging, Cog } from "lucide-react";
import DocNav from "../components/DocNav.jsx";
import DroneModelViewer from "../components/DroneModelViewer.jsx";
import ComponentInfoPanel from "../components/ComponentInfoPanel.jsx";
import FlowDiagram from "../components/FlowDiagram.jsx";
import Reveal from "../components/Reveal.jsx";
import { DRONE_COMPONENTS } from "../data/droneComponents.js";

const COMPONENT_ICONS = {
  frame: Cog,
  motors: Radar,
  propellers: Radar,
  "flight-controller": Cpu,
  battery: BatteryCharging,
  gps: Satellite,
  camera: Camera,
  speaker: Volume2,
};

const WORKFLOW_STEPS = [
  { title: "Drone", desc: "Airborne over the monitored area" },
  { title: "Camera + Sensors", desc: "Capture visual and positional data" },
  { title: "Data Collection", desc: "Readings gathered onboard in real time" },
  { title: "Communication", desc: "Data sent from drone to platform" },
  { title: "THE SPADE Platform", desc: "Receives and organizes incoming data" },
  { title: "Live Dashboard", desc: "Presents the current situation visually" },
  { title: "Operator", desc: "Reviews the dashboard and makes decisions" },
];

const ARCHITECTURE_STEPS = [
  { title: "Drone", desc: "Physical airframe" },
  { title: "Camera / GPS / Flight Controller / Other Components", desc: "Onboard hardware" },
  { title: "Data Communication", desc: "Link between drone and platform" },
  { title: "THE SPADE Dashboard", desc: "Central monitoring interface" },
  { title: "Operator", desc: "Human decision-maker" },
];

export default function DocumentationPage() {
  const [activeId, setActiveId] = useState(null);

  const handleSelect = (id) => setActiveId((prev) => (prev === id ? null : id));

  return (
    <div className="landing doc-page">
      <DocNav />

      {/* 1. HERO / INTRODUCTION */}
      <div className="hero doc-hero">
        <Reveal>
          <div>
            <div className="hero-label">
              <span className="dot" />
              TECHNICAL DOCUMENTATION
            </div>
            <h1>
              THE SPADE —<br />
              <span className="accent">Drone Documentation</span>
            </h1>
            <p className="lead">
              THE SPADE is a drone-assisted monitoring and situational-awareness system.
              The drone collects field information from the air, and the software
              dashboard provides a centralized interface for monitoring that
              information in real time.
            </p>
          </div>
        </Reveal>
      </div>

      {/* 2. INTERACTIVE 3D DRONE MODEL + 4. LABELS */}
      <div className="section doc-viewer-section" id="model">
        <Reveal className="section-head">
          <div className="section-kicker">Interactive model</div>
          <h2 className="section-title">Explore the drone</h2>
          <p className="doc-viewer-note">
            Drag to orbit, scroll to zoom. Click a marker on the model — or a card below —
            to see what that part does.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="doc-viewer-layout">
            <DroneModelViewer activeId={activeId} onSelect={handleSelect} />
            <ComponentInfoPanel activeId={activeId} onClose={() => setActiveId(null)} />
          </div>
        </Reveal>

        <div className="doc-model-disclaimer">
          Note: this CAD export merges the assembly into a single mesh, so component
          markers are placed by approximate position rather than bound to named
          sub-parts. See the README note in <code>droneComponents.js</code> for details.
        </div>
      </div>

      {/* 3. DRONE COMPONENTS */}
      <div className="section" id="components">
        <Reveal className="section-head">
          <div className="section-kicker">Hardware</div>
          <h2 className="section-title">Drone components</h2>
        </Reveal>

        <div className="doc-comp-grid">
          {DRONE_COMPONENTS.map((c, i) => {
            const Icon = COMPONENT_ICONS[c.id] || Cog;
            return (
              <Reveal key={c.id} delay={i * 60}>
                <button
                  className={`doc-comp-card${activeId === c.id ? " active" : ""}`}
                  onClick={() => handleSelect(c.id)}
                >
                  <div className="doc-comp-icon">
                    <Icon size={18} />
                  </div>
                  <div className="doc-comp-name">{c.name}</div>
                  <div className="doc-comp-purpose">{c.purpose}</div>
                  <div className="doc-comp-role">{c.role}</div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* 5. HOW THE DRONE WORKS */}
      <div className="section" id="workflow">
        <Reveal className="section-head">
          <div className="section-kicker">Process</div>
          <h2 className="section-title">How the drone works</h2>
        </Reveal>
        <Reveal delay={80}>
          <FlowDiagram steps={WORKFLOW_STEPS} direction="vertical" />
        </Reveal>
      </div>

      {/* 6. MONITORING SYSTEM */}
      <div className="section" id="monitoring">
        <Reveal className="section-head">
          <div className="section-kicker">System overview</div>
          <h2 className="section-title">How the drone and platform work together</h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="doc-monitor-grid">
            <div className="step-card">
              <div className="step-icon"><Radar size={20} /></div>
              <div className="step-title">FIELD SENSING</div>
              <div className="step-desc">
                The drone acts as SPADE's field and aerial sensing unit — it is physically
                present over the area being monitored.
              </div>
            </div>
            <div className="step-card">
              <div className="step-icon"><Cpu size={20} /></div>
              <div className="step-title">ONBOARD COLLECTION</div>
              <div className="step-desc">
                Onboard components — camera, GPS, and other sensors — collect the
                information relevant to the current mission.
              </div>
            </div>
            <div className="step-card">
              <div className="step-icon"><Radio size={20} /></div>
              <div className="step-title">TRANSMISSION</div>
              <div className="step-desc">
                That information is transmitted from the drone to THE SPADE platform
                for processing and display.
              </div>
            </div>
            <div className="step-card">
              <div className="step-icon"><Satellite size={20} /></div>
              <div className="step-title">CENTRALIZED VIEW</div>
              <div className="step-desc">
                The dashboard provides a centralized monitoring view, and the operator
                uses it to understand the current situation and respond.
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* 7. DASHBOARD INTEGRATION */}
      <div className="section" id="integration">
        <Reveal className="section-head">
          <div className="section-kicker">Integration</div>
          <h2 className="section-title">Drone → Dashboard relationship</h2>
        </Reveal>
        <Reveal delay={80}>
          <FlowDiagram
            steps={[
              { title: "Physical Drone" },
              { title: "Data / Communication" },
              { title: "THE SPADE Platform" },
              { title: "Live Dashboard" },
              { title: "Operator" },
            ]}
            direction="horizontal"
          />
        </Reveal>
      </div>

      {/* 8. TECHNICAL ARCHITECTURE */}
      <div className="section" id="architecture">
        <Reveal className="section-head">
          <div className="section-kicker">Architecture</div>
          <h2 className="section-title">Technical architecture</h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="doc-arch-card">
            <FlowDiagram steps={ARCHITECTURE_STEPS} direction="vertical" />
          </div>
        </Reveal>
      </div>

      {/* 9. SPEAKER — explicit callout */}
      <div className="section" id="speaker">
        <Reveal>
          <div className="doc-speaker-card">
            <div className="doc-comp-icon">
              <Volume2 size={20} />
            </div>
            <div>
              <div className="doc-speaker-title">Speaker</div>
              <p>
                The drone includes a speaker, providing an audio output channel that can
                be used for warnings, announcements, or communication — depending on what
                is implemented on top of it. This is currently a one-way output only;
                THE SPADE does not implement two-way audio communication.
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="l-footer">
        <div className="logo-word">
          SPADE<span>.</span>
        </div>
        <div className="l-footer-note">Smart Platform for Autonomous Disaster Emergency Response</div>
      </div>
    </div>
  );
}
