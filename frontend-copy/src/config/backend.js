// Centralized backend connection settings.
//
// Override at build/dev time with a `.env` file at the project root
// (see .env.example) — Vite only reads variables prefixed VITE_:
//
//   VITE_API_BASE_URL=http://192.168.1.50:8000
//
// Defaults to localhost so `npm run dev` works out of the box against a
// backend started with `python -m backend.main` on the same machine.

const rawBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_BASE_URL = rawBase.replace(/\/+$/, "");
export const WS_URL = API_BASE_URL.replace(/^http/, "ws") + "/ws";
export const VIDEO_FEED_URL = `${API_BASE_URL}/video_feed`;

// Browser-camera integration (CameraFeed.jsx / useCameraStream.js): frames
// captured via getUserMedia are posted here and fed into the SAME
// PersonDetector/YOLO pipeline the existing /video_feed and /ws already use
// — see backend/main.py's /api/camera/frame endpoint.
export const CAMERA_FRAME_URL = `${API_BASE_URL}/api/camera/frame`;

// Existing phone-GPS bridge endpoint (backend/browser_gps.py) — reused as-is
// so a detection made from a phone's camera carries that phone's real
// location, not the drone's assumed position.
export const PHONE_GPS_URL = `${API_BASE_URL}/api/phone-gps`;
