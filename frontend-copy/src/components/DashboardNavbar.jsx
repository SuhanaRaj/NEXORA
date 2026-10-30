import React from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, Sparkles, BookOpen } from "lucide-react";
import Wordmark from "./Wordmark.jsx";

// This chip used to just be a hardcoded green "System active" decoration.
// It now reflects the real AI backend connection state, in the same spot,
// using the same dot/status-chip styling — so it tells the truth without
// changing the navbar's layout.
const STATUS_META = {
  connected: { cls: "green", label: "AI backend connected" },
  connecting: { cls: "cyan", label: "Connecting to AI backend…" },
  disconnected: { cls: "red", label: "AI backend offline · demo data" },
  error: { cls: "red", label: "AI backend error · demo data" },
};

export default function DashboardNavbar({ onSimulate, backendStatus = "disconnected" }) {
  const navigate = useNavigate();
  const meta = STATUS_META[backendStatus] || STATUS_META.disconnected;

  return (
    <div className="navbar">
      <Wordmark onClick={() => navigate("/")} />
      <div className="navbar-center">Dashboard</div>
      <div className="navbar-right">
        <button className="sim-btn" onClick={() => navigate("/documentation")} title="Documentation">
          <BookOpen size={13} />
          Docs
        </button>
        <button className="sim-btn" onClick={onSimulate}>
          <Sparkles size={13} />
          Simulate detection
        </button>
        <div className="status-chip" title={meta.label}>
          <span className={`dot ${meta.cls} dot-pulse`} />
          {meta.label}
        </div>
        <div className="avatar">
          <UserRound size={16} />
        </div>
      </div>
    </div>
  );
}
