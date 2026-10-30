import { useCallback, useEffect, useRef, useState } from "react";
import { CAMERA_FRAME_URL, PHONE_GPS_URL } from "../config/backend.js";

// AI detection frames: resized + compressed before sending, sent at a
// deliberately low rate so the backend never sees a firehose of full-res
// frames. This is independent from the local <video> preview, which stays
// at the browser's native camera framerate the whole time — the two are
// intentionally decoupled so the UI never feels laggy while frames are
// being uploaded in the background.
const FRAME_INTERVAL_MS = 140; // ~7 FPS, inside the requested 5-10 FPS range
const MAX_FRAME_WIDTH = 640;
const JPEG_QUALITY = 0.7;

// Phone GPS updates are throttled independently of the frame rate above —
// there is no need to hit the browser's geolocation API 7 times a second.
const GEO_MIN_INTERVAL_MS = 3500;

function describeError(kind, err) {
  switch (kind) {
    case "unsupported":
      return "This browser does not support camera access (getUserMedia is unavailable). Try a recent version of Chrome, Edge, or Safari.";
    case "denied":
      return "Camera permission was denied. Allow camera access for this site in your browser's site settings, then try again.";
    case "unavailable":
      return "No camera was found on this device.";
    case "in-use":
      return "The camera is already in use by another application or browser tab. Close it and try again.";
    default:
      return err && err.message ? `Could not start the camera (${err.message}).` : "Could not start the camera.";
  }
}

function classifyGetUserMediaError(err) {
  const name = err && err.name;
  if (name === "NotAllowedError" || name === "PermissionDeniedError") return "denied";
  if (name === "NotFoundError" || name === "DevicesNotFoundError") return "unavailable";
  if (name === "NotReadableError" || name === "TrackStartError") return "in-use";
  if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") return "overconstrained";
  return "error";
}

function stopStreamTracks(stream) {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {
      // already stopped — fine
    }
  });
}

/**
 * Manages a single getUserMedia camera session: starting/stopping it,
 * switching between cameras (front/rear on phones, or multiple webcams on a
 * laptop), streaming downsized JPEG frames to the existing AI backend at a
 * low, fixed rate, and — while the camera is live — watching the browser's
 * geolocation so a detection made from this device carries this device's
 * real position (see backend/browser_gps.py + /api/phone-gps, both
 * pre-existing and reused as-is here).
 */
export default function useCameraStream() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const sendTimerRef = useRef(null);
  const sendingRef = useRef(false);
  const geoWatchIdRef = useRef(null);
  const lastGeoSentRef = useRef(0);
  const facingModeRef = useRef("user");
  const deviceIndexRef = useRef(0);

  // "idle" | "starting" | "live" | "denied" | "unavailable" | "in-use" | "unsupported" | "error"
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [facingMode, setFacingMode] = useState("user");
  const [devices, setDevices] = useState([]);
  const [switchNotice, setSwitchNotice] = useState("");

  // "idle" | "requesting" | "live" | "denied" | "unavailable" | "timeout" | "unsupported"
  const [geoStatus, setGeoStatus] = useState("idle");
  const [geoAccuracy, setGeoAccuracy] = useState(null);

  const isSupported =
    typeof navigator !== "undefined" &&
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  const clearSendTimer = useCallback(() => {
    if (sendTimerRef.current) {
      clearInterval(sendTimerRef.current);
      sendTimerRef.current = null;
    }
  }, []);

  const clearGeoWatch = useCallback(() => {
    if (geoWatchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
      geoWatchIdRef.current = null;
    }
  }, []);

  const refreshDevices = useCallback(async () => {
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices(list.filter((d) => d.kind === "videoinput"));
    } catch {
      // Device labels/ids are only reliable after permission is granted —
      // if this fails, the switch button falls back to facingMode toggling.
    }
  }, []);

  const attachStream = useCallback((stream) => {
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      const playPromise = videoRef.current.play();
      if (playPromise && playPromise.catch) playPromise.catch(() => {});
    }
  }, []);

  const sendGeoUpdate = useCallback((position) => {
    const now = Date.now();
    if (now - lastGeoSentRef.current < GEO_MIN_INTERVAL_MS) return;
    lastGeoSentRef.current = now;
    const { latitude, longitude, altitude, speed, accuracy, heading } = position.coords;
    fetch(PHONE_GPS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        latitude,
        longitude,
        altitude: altitude ?? undefined,
        speed: speed ?? undefined,
        accuracy: accuracy ?? undefined,
        heading: heading ?? undefined,
      }),
    }).catch(() => {
      // Best-effort — the next watchPosition tick will retry.
    });
  }, []);

  const startGeoWatch = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("requesting");
    clearGeoWatch();
    geoWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setGeoStatus("live");
        setGeoAccuracy(
          Number.isFinite(position.coords.accuracy) ? Math.round(position.coords.accuracy) : null
        );
        sendGeoUpdate(position);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setGeoStatus("denied");
        else if (err.code === err.POSITION_UNAVAILABLE) setGeoStatus("unavailable");
        else setGeoStatus("timeout");
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 8000 }
    );
  }, [clearGeoWatch, sendGeoUpdate]);

  // Captures the current video frame to an offscreen canvas, downsizes it,
  // and posts it as a compressed JPEG. Runs on a fixed interval separate
  // from the video element's own framerate (the preview stays smooth
  // regardless of network conditions), and skips a tick rather than queuing
  // if the previous upload hasn't finished yet or the tab is backgrounded.
  const sendFrameLoop = useCallback(() => {
    clearSendTimer();
    sendTimerRef.current = setInterval(() => {
      if (sendingRef.current) return;
      if (typeof document !== "undefined" && document.hidden) return;

      const video = videoRef.current;
      if (!video || video.readyState < 2 /* HAVE_CURRENT_DATA */) return;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;

      if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
      const canvas = canvasRef.current;
      const scale = Math.min(1, MAX_FRAME_WIDTH / vw);
      canvas.width = Math.round(vw * scale);
      canvas.height = Math.round(vh * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          sendingRef.current = true;
          const form = new FormData();
          form.append("file", blob, "frame.jpg");
          fetch(CAMERA_FRAME_URL, { method: "POST", body: form })
            .catch(() => {
              // A dropped frame is fine — the next tick sends a fresher one.
            })
            .finally(() => {
              sendingRef.current = false;
            });
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    }, FRAME_INTERVAL_MS);
  }, [clearSendTimer]);

  const start = useCallback(async () => {
    if (!isSupported) {
      setStatus("unsupported");
      setErrorMessage(describeError("unsupported"));
      return;
    }
    setStatus("starting");
    setErrorMessage("");
    setSwitchNotice("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingModeRef.current,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      attachStream(stream);
      setStatus("live");
      refreshDevices();
      sendFrameLoop();
      startGeoWatch();
    } catch (err) {
      const kind = classifyGetUserMediaError(err);
      const normalized = kind === "overconstrained" ? "error" : kind;
      setStatus(normalized);
      setErrorMessage(describeError(normalized, err));
    }
  }, [isSupported, attachStream, refreshDevices, sendFrameLoop, startGeoWatch]);

  const stop = useCallback(() => {
    clearSendTimer();
    clearGeoWatch();
    stopStreamTracks(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
    setGeoStatus("idle");
    setGeoAccuracy(null);
    setSwitchNotice("");
  }, [clearSendTimer, clearGeoWatch]);

  const switchCamera = useCallback(async () => {
    setSwitchNotice("");
    let constraints;
    let nextFacing = facingModeRef.current;
    let nextDeviceIndex = deviceIndexRef.current;

    if (devices.length > 1) {
      nextDeviceIndex = (deviceIndexRef.current + 1) % devices.length;
      constraints = {
        video: {
          deviceId: { exact: devices[nextDeviceIndex].deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
    } else {
      // Force an actual change with an exact constraint — an "ideal"
      // facingMode can silently return the same camera again.
      nextFacing = facingModeRef.current === "user" ? "environment" : "user";
      constraints = {
        video: {
          facingMode: { exact: nextFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      // Only stop the old stream after the new one succeeds, so a failed
      // switch never leaves the user with no camera at all.
      stopStreamTracks(streamRef.current);
      attachStream(newStream);
      facingModeRef.current = nextFacing;
      setFacingMode(nextFacing);
      deviceIndexRef.current = nextDeviceIndex;
      refreshDevices();
    } catch {
      setSwitchNotice("Only one camera is available on this device.");
    }
  }, [devices, attachStream, refreshDevices]);

  // Cleanup on unmount — never leak a camera stream, a pending upload
  // interval, or a geolocation watch.
  useEffect(() => {
    return () => {
      clearSendTimer();
      clearGeoWatch();
      stopStreamTracks(streamRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    videoRef,
    status,
    errorMessage,
    start,
    stop,
    switchCamera,
    facingMode,
    canSwitch: true,
    switchNotice,
    geoStatus,
    geoAccuracy,
    isSupported,
    isLive: status === "live",
  };
}
