import React from "react";
import { useNavigate } from "react-router-dom";
import Wordmark from "./Wordmark.jsx";

export default function DocNav() {
  const navigate = useNavigate();
  return (
    <div className="l-nav scrolled">
      <Wordmark onClick={() => navigate("/landing")} />
      <div className="l-nav-links">
        <button className="l-link" onClick={() => navigate("/landing")}>Landing</button>
        <button className="l-link" onClick={() => navigate("/dashboard")}>Dashboard</button>
        <span className="l-link doc-nav-active">Documentation</span>
      </div>
    </div>
  );
}
