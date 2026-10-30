import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL, WS_URL } from "../config/backend.js";

const RECONNECT_DELAY_MS = 2500;

/**
 * Connects to the existing FastAPI backend's /ws endpoint (state.snapshot()
 * broadcast every ~250ms) and the /api/state endpoint for an immediate first
 * paint. No new backend mechanism — this only consumes what already exists.
 *
 * Returns:
 *   status        "connecting" | "connected" | "disconnected" | "error"
 *   snapshot       latest full snapshot object from the backend, or null
 *   newEvents      survivor_detected events not yet consumed by the caller
 *   consumeEvents  call after processing newEvents to clear them
 */
export default function useBackendConnection() {
  const [status, setStatus] = useState("connecting");
  const [snapshot, setSnapshot] = useState(null);
  // const [newEvents, setNewEvents] = useState([]);
  const [newEvents, setNewEvents] = useState([]);
  const initializedRef = useRef(false);

  const seenEventIds = useRef(new Set());
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const unmounted = useRef(false);

  // const applySnapshot = useCallback((data) => {
  //   if (!data || typeof data !== "object") return;
  //   setSnapshot(data);

  //   const events = Array.isArray(data.last_detection) ? data.last_detection : [];
  //   const fresh = events.filter((e) => e && e.id && !seenEventIds.current.has(e.id));
  //   if (fresh.length > 0) {
  //     fresh.forEach((e) => seenEventIds.current.add(e.id));
  //     setNewEvents((prev) => [...prev, ...fresh]);
  //   }
  // }, []);

  const applySnapshot = useCallback((data) => {
  if (!data || typeof data !== "object") return;

  setSnapshot(data);

  const events = Array.isArray(data.last_detection)
    ? data.last_detection
    : [];

  // First snapshot = existing backend history.
  // Do NOT show these as new notifications.
  if (!initializedRef.current) {
    events.forEach((e) => {
      if (e?.id) {
        seenEventIds.current.add(e.id);
      }
    });

    initializedRef.current = true;
    return;
  }

  // From now on, only genuinely new events are forwarded.
  const fresh = events.filter(
    (e) => e?.id && !seenEventIds.current.has(e.id)
  );

  if (fresh.length > 0) {
    fresh.forEach((e) => seenEventIds.current.add(e.id));

    setNewEvents((prev) => [...prev, ...fresh]);
  }
}, []);

  useEffect(() => {
    unmounted.current = false;

    // Immediate first paint via the existing REST endpoint, while the socket
    // handshake is still in flight. Safe to fail silently — the WS loop
    // below is what actually keeps the connection alive.
    fetch(`${API_BASE_URL}/api/state`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !unmounted.current) applySnapshot(data);
      })
      .catch(() => {});

    function connect() {
      if (unmounted.current) return;
      let ws;
      try {
        ws = new WebSocket(WS_URL);
      } catch {
        setStatus("error");
        scheduleReconnect();
        return;
      }
      wsRef.current = ws;
      setStatus((prev) => (prev === "connected" ? prev : "connecting"));

      ws.onopen = () => {
        if (!unmounted.current) setStatus("connected");
      };

      ws.onmessage = (event) => {
        try {
          applySnapshot(JSON.parse(event.data));
        } catch {
          // Malformed frame — ignore, keep the connection alive.
        }
      };

      ws.onerror = () => {
        if (!unmounted.current) setStatus("error");
      };

      ws.onclose = () => {
        if (unmounted.current) return;
        setStatus("disconnected");
        scheduleReconnect();
      };
    }

    function scheduleReconnect() {
      window.clearTimeout(reconnectTimer.current);
      reconnectTimer.current = window.setTimeout(connect, RECONNECT_DELAY_MS);
    }

    connect();

    return () => {
      unmounted.current = true;
      window.clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // don't trigger a reconnect on unmount
        wsRef.current.close();
      }
    };
  }, [applySnapshot]);

  const consumeEvents = useCallback(() => {
    setNewEvents([]);
  }, []);

  return { status, snapshot, newEvents, consumeEvents };
}
