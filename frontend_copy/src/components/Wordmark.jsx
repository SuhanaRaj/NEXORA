import React from "react";

export default function Wordmark({ onClick }) {
  return (
    <div className="wordmark" onClick={onClick}>
      <div className="logo-mark">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z" fill="#05141A" />
        </svg>
      </div>
      <div className="logo-word">
        NEXORA<span>.</span>
      </div>
    </div>
  );
}
