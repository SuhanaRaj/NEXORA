import React, { useState } from "react";
import {
  Camera,
  CameraOff,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  Users,
  MapPin,
  Radio,
} from "lucide-react";
import useCameraStream from "../hooks/useCameraStream.js";

const CAMERA_STATUS_META = {
  idle: { label: "Idle", cls: "" },
  starting: { label: "Starting…", cls: "cyan" },
  live: { label: "Live", cls: "green" },
  denied: { label: "Permission denied", cls: "red" },
  unavailable: { label: "No camera found", cls: "red" },
  "in-use": { label: "Camera already in use", cls: "red" },
  unsupported: { label: "Not supported", cls: "red" },
  error: { label: "Error", cls: "red" },
};

const GEO_STATUS_META = {
  idle: { label: "Not requested", cls: "" },
  requesting: { label: "Requesting…", cls: "cyan" },
  live: { label: "Live", cls: "green" },
  denied: { label: "Permission denied", cls: "red" },
  unavailable: { label: "Unavailable", cls: "red" },
  timeout: { label: "Timed out", cls: "orange" },
  unsupported: { label: "Not supported", cls: "red" },
};

export default function CameraFeed({ backendSnapshot, backendStatus }) {
  const [expanded, setExpanded] = useState(false);
  const {
    videoRef,
    status,
    errorMessage,
    start,
    stop,
    switchCamera,
    facingMode,
    switchNotice,
    geoStatus,
    geoAccuracy,
    isSupported,
    isLive,
  } = useCameraStream();

  const ai = backendSnapshot?.ai;
  const cameraBackend = backendSnapshot?.camera;
  const humansDetected = isLive && typeof ai?.current_people === "number" ? ai.current_people : null;

  const detectionLabel = (() => {
    if (!isLive) return "Camera off";
    if (backendStatus !== "connected") return "AI backend offline";
    const usingThisFeed = ai?.frame_source === "browser" && typeof ai?.frame_age === "number" && ai.frame_age < 3;
    if (usingThisFeed) return ai?.priority_label || "Analyzing feed";
    return "Waiting for frames…";
  })();

  const cameraMeta = CAMERA_STATUS_META[status] || CAMERA_STATUS_META.idle;
  const geoMeta = GEO_STATUS_META[geoStatus] || GEO_STATUS_META.idle;

  const showBusy = status === "starting";
  const showOverlayMessage = !isLive && status !== "idle";

  return (
    <div className="camera-panel">
      <button
        type="button"
        className="pane-header camera-panel-header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="pane-title camera-panel-title">
          <Camera size={15} />
          Live Camera Feed
        </div>
        <div className="camera-panel-header-right">
          {isLive && (
            <span className="live-chip">
              <span className="dot red dot-pulse" />
              LIVE
            </span>
          )}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="camera-panel-body">
          <div className="camera-video-wrap">
            <video
              ref={videoRef}
              className={`camera-video${facingMode === "user" ? " mirrored" : ""}`}
              muted
              playsInline
              autoPlay
            />

            {showOverlayMessage && (
              <div className="camera-overlay">
                {showBusy ? (
                  <>
                    <Loader2 size={20} className="spin" />
                    <span>Starting camera…</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={20} />
                    <span>{errorMessage}</span>
                  </>
                )}
              </div>
            )}

            {!isLive && status === "idle" && (
              <div className="camera-overlay camera-overlay-idle">
                <CameraOff size={20} />
                <span>Camera is off</span>
              </div>
            )}
          </div>

          {switchNotice && <div className="camera-inline-notice">{switchNotice}</div>}

          <div className="camera-controls">
            <button className="btn btn-primary" onClick={start} disabled={isLive || status === "starting" || !isSupported}>
              <Camera size={13} />
              Start Camera
            </button>
            <button className="btn btn-ghost" onClick={stop} disabled={!isLive && status !== "starting"}>
              <CameraOff size={13} />
              Stop Camera
            </button>
            <button className="btn btn-ghost" onClick={switchCamera} disabled={!isLive} title="Switch between available cameras">
              <RefreshCw size={13} />
              Switch
            </button>
          </div>

          <div className="camera-status-grid">
            <div className="camera-status-row">
              <span className="camera-status-label">
                <Radio size={12} /> Camera
              </span>
              <span className={`camera-status-value dot-label ${cameraMeta.cls}`}>{cameraMeta.label}</span>
            </div>
            <div className="camera-status-row">
              <span className="camera-status-label">
                <Users size={12} /> Detection
              </span>
              <span className="camera-status-value">{detectionLabel}</span>
            </div>
            <div className="camera-status-row">
              <span className="camera-status-label">
                <Users size={12} /> Humans detected
              </span>
              <span className="camera-status-value tabular">{humansDetected ?? "—"}</span>
            </div>
            <div className="camera-status-row">
              <span className="camera-status-label">
                <MapPin size={12} /> Location
              </span>
              <span className={`camera-status-value dot-label ${geoMeta.cls}`}>
                {geoMeta.label}
                {geoStatus === "live" && geoAccuracy != null ? ` · ±${geoAccuracy}m` : ""}
              </span>
            </div>
          </div>

          {cameraBackend?.status === "standby (browser camera active)" && (
            <div className="camera-inline-note">
              Backend's own hardware camera is on standby while your browser camera is live.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
