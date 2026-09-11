import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal.jsx";
import DroneCanvas from "./DroneCanvas.jsx";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="hero" id="about">
      <Reveal>
        <div>
          <div className="hero-label">
            <span className="dot" />
            Next Generation AI Drone Intelligence & Response System
          </div>
          <h1>
            Respond faster.
            <br />
            <span className="accent">Save more lives.</span>
          </h1>
          <p className="lead">
            NEXORA brings drone monitoring, survivor detection, and emergency
            coordination into one intelligent response platform.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
              Launch Dashboard
              <ArrowRight size={15} />
            </button>
            <button
              className="btn btn-ghost"
              onClick={() =>
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Learn more
            </button>
          </div>
        </div>
      </Reveal>

      <div className="hero-visual">
        <div className="hero-blob" />
        <DroneCanvas />
      </div>
    </div>
  );
}
