import React from "react";
import { Radar, ScanSearch, LifeBuoy } from "lucide-react";
import Reveal from "./Reveal.jsx";

const STEPS = [
  {
    n: "01",
    icon: Radar,
    title: "MONITOR",
    desc: "Drones monitor affected disaster zones and provide real-time situational awareness.",
  },
  {
    n: "02",
    icon: ScanSearch,
    title: "DETECT",
    desc: "Potential survivors are identified and prioritized based on emergency conditions.",
  },
  {
    n: "03",
    icon: LifeBuoy,
    title: "RESPOND",
    desc: "Emergency teams can quickly coordinate and dispatch the appropriate rescue action.",
  },
];

export default function HowItWorks() {
  return (
    <div className="section" id="how-it-works">
      <Reveal className="section-head">
        <div className="section-kicker">Process</div>
        <h2 className="section-title">How NEXORA Works</h2>
      </Reveal>

      <div className="steps">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 110}>
            <div className="step-card">
              <div className="step-num">{s.n}</div>
              <div className="step-icon">
                <s.icon size={20} />
              </div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
