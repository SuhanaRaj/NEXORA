import React from "react";
import { ArrowDown, ArrowRight } from "lucide-react";

export default function FlowDiagram({ steps, direction = "vertical" }) {
  const Arrow = direction === "vertical" ? ArrowDown : ArrowRight;
  return (
    <div className={`doc-flow doc-flow-${direction}`}>
      {steps.map((step, i) => (
        <React.Fragment key={step.title}>
          <div className="doc-flow-step">
            <div className="doc-flow-title">{step.title}</div>
            {step.desc && <div className="doc-flow-desc">{step.desc}</div>}
          </div>
          {i < steps.length - 1 && (
            <div className="doc-flow-arrow">
              <Arrow size={16} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
