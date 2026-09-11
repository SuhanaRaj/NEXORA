// // Converts a backend `survivor_detected` event (see backend/state.py
// // add_detection_event) into the exact survivor shape SPADE's UI already
// // expects (see data/mock.js INITIAL_SURVIVORS) — so MissionMap, SurvivorList,
// // and SurvivorDrawer need no special-casing for AI-sourced vs. simulated
// // survivors.

// const BACKEND_TO_SPADE_PRIORITY = {
//   CRITICAL: "critical",
//   HIGH: "high",
//   MEDIUM: "medium",
//   // The backend's scene-level AI can report LOW when nobody is visible, but
//   // that never reaches a per-survivor event. Mapped defensively anyway,
//   // since SPADE's UI has no "low" tier.
//   LOW: "medium",
// };

// export function backendEventToSurvivor(evt) {
//   const priority = BACKEND_TO_SPADE_PRIORITY[String(evt.priority).toUpperCase()] || "medium";
//   const hasPosition = typeof evt.latitude === "number" && typeof evt.longitude === "number";

//   return {
//     id: evt.id,
//     priority,
//     // Backend gives a track id and confidence, not a situation description —
//     // stating that plainly rather than inventing a scenario like "Debris field".
//     type: `Person detected by onboard AI · track #${evt.track_id}`,
//     // No sector grid exists on the backend or a real GPS fix for the person
//     // specifically (only the drone's own position) — labeled honestly.
//     locationLabel: hasPosition ? "Near drone position (approx.)" : "Location unavailable",
//     time: "just now",
//     lat: hasPosition ? evt.latitude : null,
//     lng: hasPosition ? evt.longitude : null,
//     confidence: Math.round((evt.confidence || 0) * 100),
//     status: "Awaiting Response",
//     detectedBy: evt.detected_by || "AI backend",
//     source: "ai",
//   };
// }

const BACKEND_TO_SPADE_PRIORITY = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "medium",
};

export function backendEventToSurvivor(evt) {
  if (!evt || !evt.id) {
    return null;
  }

  const priority =
    BACKEND_TO_SPADE_PRIORITY[
      String(evt.priority || "MEDIUM").toUpperCase()
    ] || "medium";

  const hasPosition =
    typeof evt.latitude === "number" &&
    typeof evt.longitude === "number";

  const latitude = hasPosition ? evt.latitude : null;
  const longitude = hasPosition ? evt.longitude : null;

  return {
    // ----------------------------------------------------
    // Identification
    // ----------------------------------------------------

    id: evt.id,

    trackId:
      evt.track_id ?? null,

    // ----------------------------------------------------
    // AI information
    // ----------------------------------------------------

    priority,

    type:
      `Person detected by onboard AI · track #${evt.track_id ?? "unknown"}`,

    confidence:
      typeof evt.confidence === "number"
        ? Math.round(evt.confidence * 100)
        : 0,

    detectedBy:
      evt.detected_by || "SPADE-DRONE-01",

    // ----------------------------------------------------
    // Location
    // ----------------------------------------------------

    lat: latitude,

    lng: longitude,

    locationLabel: hasPosition
      ? "Detection point near drone"
      : "Location unavailable",

    locationSource: hasPosition
      ? "Drone GPS at detection time"
      : "No GPS fix",

    locationApproximate:
      evt.location_is_approximate !== false,

    // ----------------------------------------------------
    // Time
    // ----------------------------------------------------

    timestamp:
      evt.timestamp || Date.now(),

    time: "just now",

    // ----------------------------------------------------
    // Status
    // ----------------------------------------------------

    status:
      evt.status === "Detected"
        ? "Awaiting Response"
        : evt.status || "Awaiting Response",

    source: "ai",
  };
}