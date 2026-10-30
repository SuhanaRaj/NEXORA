import React from "react";
import LandingNav from "../components/LandingNav.jsx";
import Hero from "../components/Hero.jsx";
import HowItWorks from "../components/HowItWorks.jsx";
import PlatformPreview from "../components/PlatformPreview.jsx";

export default function LandingPage() {
  return (
    <div className="landing">
      <LandingNav />
      <Hero />
      <HowItWorks />
      <PlatformPreview />

      <div className="l-footer">
        <div className="logo-word">
          NEXORA<span>.</span>
        </div>
        <div className="l-footer-note">
          Next-Generation AI Drone Intelligence & Response System
        </div>
      </div>
    </div>
  );
}
