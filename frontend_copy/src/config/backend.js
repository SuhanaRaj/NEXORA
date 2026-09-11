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
