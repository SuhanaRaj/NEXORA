import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Wordmark from "./Wordmark.jsx";

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function LandingNav() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`l-nav${scrolled ? " scrolled" : ""}`}>
      <Wordmark onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
      <div className="l-nav-links">
        <button className="l-link" onClick={() => scrollToId("about")}>About</button>
        <button className="l-link" onClick={() => scrollToId("how-it-works")}>How It Works</button>
        <button className="l-link" onClick={() => scrollToId("preview")}>Dashboard</button>
        <button className="l-link" onClick={() => navigate("/documentation")}>Documentation</button>
        <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
          Launch Platform
        </button>
      </div>
    </div>
  );
}
