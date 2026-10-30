import React, { useCallback, useEffect, useRef, useState } from "react";
import DashboardNavbar from "../components/DashboardNavbar.jsx";
import DroneInfo from "../components/DroneInfo.jsx";
import MissionMap from "../components/MissionMap.jsx";
import SurvivorList from "../components/SurvivorList.jsx";
import SurvivorDrawer from "../components/SurvivorDrawer.jsx";
import CameraFeed from "../components/CameraFeed.jsx";
import ToastStack from "../components/ToastStack.jsx";
import useBackendConnection from "../hooks/useBackendConnection.js";
import { backendEventToSurvivor } from "../utils/detectionMapper.js";
import {
  CENTER,
  DRONE,
  DRONE_STATUSES,
  INITIAL_SURVIVORS,
  SIM_TYPES,
  SIM_SECTORS,
  SIM_PRIORITIES,
} from "../data/mock.js";

const ACTION_COPY = {
  dispatch: { status: "Rescue Team Dispatched", toast: "Rescue team dispatched successfully." },
  supply: { status: "Supply Package En Route", toast: "Supply package request initiated." },
  voice: { status: "Contacted · Awaiting Reply", toast: "Voice message transmitted." },
};

export default function DashboardPage() {
  const [survivors, setSurvivors] = useState(INITIAL_SURVIVORS);
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [flyToId, setFlyToId] = useState(null);
  const [drawerId, setDrawerId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [drone, setDrone] = useState(DRONE);

  const counter = useRef(26);
  const toastId = useRef(0);

  // Real AI backend connection — WebSocket to the existing FastAPI /ws
  // endpoint, REST-seeded on first load. See src/hooks/useBackendConnection.js.
  const { status: backendStatus, snapshot: backendSnapshot, newEvents, consumeEvents } =
    useBackendConnection();

  const pushToast = useCallback((message) => {
    const id = toastId.current++;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const handleView = useCallback((id) => {
    setSelectedId(id);
    setFlyToId(id);
  }, []);

  const handleOpenDetails = useCallback((id) => {
    setSelectedId(id);
    setFlyToId(id);
    setDrawerId(id);
  }, []);

  const handleCloseDrawer = useCallback(() => setDrawerId(null), []);

  // ---- "Simulate Detection" — unchanged mock/demo path, preserved as the
  // fallback this project explicitly asked to keep, regardless of whether
  // a real backend is connected. ----
  const handleSimulate = useCallback(() => {
    const n = counter.current++;
    const priority = SIM_PRIORITIES[Math.floor(Math.random() * SIM_PRIORITIES.length)];
    const type = SIM_TYPES[Math.floor(Math.random() * SIM_TYPES.length)];
    const sector = SIM_SECTORS[Math.floor(Math.random() * SIM_SECTORS.length)];
    const confidence = Math.floor(78 + Math.random() * 20);
    const jitter = () => (Math.random() - 0.5) * 0.012;

    const s = {
      id: `SRV-0${n}`,
      priority,
      type,
      sector,
      locationLabel: `Sector ${sector}`,
      time: "just now",
      lat: CENTER[0] + jitter(),
      lng: CENTER[1] + jitter(),
      confidence,
      status: "Awaiting Response",
      detectedBy: drone.id,
      source: "simulated",
    };

    setSurvivors((prev) => [s, ...prev]);
    const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);
    pushToast(`New ${priorityLabel} Survivor Detected`);
  }, [drone.id, pushToast]);

  const handleAction = useCallback(
    (id, actionKey) => {
      const copy = ACTION_COPY[actionKey];
      if (!copy) return;
      setSurvivors((prev) => prev.map((s) => (s.id === id ? { ...s, status: copy.status } : s)));
      pushToast(copy.toast);
    },
    [pushToast]
  );

  // ---- Real AI detections arriving over the WebSocket. Converted through
  // the same mapper into the exact survivor shape the UI already uses, so
  // they land in the same state array as simulated ones. ----
  useEffect(() => {
    if (newEvents.length === 0) return;
    const mapped = newEvents.map(backendEventToSurvivor);
    setSurvivors((prev) => [...mapped, ...prev]);
    mapped.forEach((s) => {
      const label = s.priority.charAt(0).toUpperCase() + s.priority.slice(1);
      pushToast(`New ${label} Survivor Detected (AI)`);
    });
    consumeEvents();
  }, [newEvents, consumeEvents, pushToast]);

  // ---- Fallback telemetry simulation. Runs unconditionally so nothing
  // regresses when there's no backend — real position data (below) simply
  // overwrites these values on every snapshot once a backend is connected
  // and has a GPS fix. ----
  useEffect(() => {
    const interval = window.setInterval(() => {
      setDrone((prev) => {
        const nextBattery = Math.max(12, +(prev.battery - Math.random() * 0.4).toFixed(1));
        const shouldShiftStatus = Math.random() < 0.08;
        const nextStatus = shouldShiftStatus
          ? DRONE_STATUSES[Math.floor(Math.random() * DRONE_STATUSES.length)]
          : prev.status;
        return {
          ...prev,
          battery: nextBattery,
          status: nextStatus,
          altitude: Math.max(90, Math.min(150, prev.altitude + Math.round((Math.random() - 0.5) * 6))),
          speed: Math.max(6, Math.min(22, +(prev.speed + (Math.random() - 0.5) * 1.5).toFixed(1))),
          lat: prev.lat + (Math.random() - 0.5) * 0.0009,
          lng: prev.lng + (Math.random() - 0.5) * 0.0009,
        };
      });
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  // ---- Real drone/phone position from the backend, when available. Only
  // overrides fields the backend actually reports; falls back to whatever
  // the simulation above last set otherwise. ----
  useEffect(() => {
    const position = backendSnapshot?.position;
    if (!position) return;
    setDrone((prev) => ({
      ...prev,
      lat: typeof position.latitude === "number" ? position.latitude : prev.lat,
      lng: typeof position.longitude === "number" ? position.longitude : prev.lng,
      altitude: typeof position.altitude === "number" ? position.altitude : prev.altitude,
      speed: typeof position.speed === "number" ? position.speed : prev.speed,
      battery: typeof position.battery === "number" ? position.battery : prev.battery,
      status:
        backendSnapshot?.camera?.status === "online"
          ? "Live monitoring"
          : backendSnapshot?.camera?.status
          ? `Camera ${backendSnapshot.camera.status}`
          : prev.status,
    }));
  }, [backendSnapshot]);

  const drawerSurvivor = survivors.find((s) => s.id === drawerId) || null;

  return (
    <div className="spade-root">
      <DashboardNavbar onSimulate={handleSimulate} backendStatus={backendStatus} />
      <DroneInfo drone={drone} />

      <div className="main-split">
        <div className="map-pane">
          <div className="pane-header">
            <div className="pane-title">Live response map</div>
            <div className="live-chip">
              <span className="dot red dot-pulse" />
              LIVE
            </div>
          </div>
          <MissionMap drone={drone} survivors={survivors} onSelectSurvivor={handleView} flyToId={flyToId} />
        </div>

        <div className="list-pane">
          <CameraFeed backendSnapshot={backendSnapshot} backendStatus={backendStatus} />
          <SurvivorList
            survivors={survivors}
            selectedId={selectedId}
            onView={handleView}
            onOpenDetails={handleOpenDetails}
            filter={filter}
            onFilterChange={setFilter}
          />
        </div>
      </div>

      <SurvivorDrawer survivor={drawerSurvivor} onClose={handleCloseDrawer} onAction={handleAction} />
      <ToastStack toasts={toasts} />
    </div>
  );
}
