import threading
import time
from collections import deque

import cv2
import numpy as np
import torch
from ultralytics import YOLO

from .ai_profiles import PROFILES
from .config import MODEL_PATH, TRACKER, CONFIDENCE, IMG_SIZE, MAX_AI_FPS


class PersonDetector:
    def __init__(self):
        self.device = 0 if torch.cuda.is_available() else "cpu"
        self.model = YOLO(MODEL_PATH)
        self.running = False
        self.thread = None
        self.frame_lock = threading.Lock()
        self.latest_frame = None
        self.latest_jpeg = None
        self.current_people = 0
        self.unique_ids = set()
        self.avg_confidence = 0.0
        self.ai_fps = 0.0
        self.last_inference = 0.0
        self._fps_times = deque(maxlen=30)
        self._lock = threading.Lock()
        self.source_label = "no camera"
        self._new_tracks = []
        # Which producer last called submit() and when — lets the local
        # hardware camera (camera.py) back off automatically while a
        # browser/phone stream is actively pushing frames, and resume the
        # instant it stops, without any manual mode switch.
        self._last_submit_source = None
        self._last_submit_ts = 0.0

    def start(self):
        if self.running:
            return
        self.running = True
        self.thread = threading.Thread(target=self._loop, daemon=True)
        self.thread.start()

    def stop(self):
        self.running = False

    def submit(self, frame, source="camera"):
        # Always keep only the newest frame: no stale-frame queue.
        with self.frame_lock:
            self.latest_frame = frame
        with self._lock:
            self._last_submit_source = source
            self._last_submit_ts = time.time()

    def browser_active(self, timeout=2.5):
        """True if a browser/phone frame arrived within `timeout` seconds —
        used by camera.py to yield the shared detector to the live browser
        stream instead of overwriting it with the local hardware camera."""
        with self._lock:
            return (
                self._last_submit_source == "browser"
                and (time.time() - self._last_submit_ts) < timeout
            )

    def reset_tracking(self):
        with self._lock:
            self.unique_ids.clear()

    def pop_new_tracks(self):
        """Atomically drain and return track IDs seen for the first time
        since the last call — the real signal a 'new survivor detected'
        event is built from, not a guess."""
        with self._lock:
            items, self._new_tracks = self._new_tracks, []
            return items

    def _loop(self):
        interval = 1.0 / max(1.0, MAX_AI_FPS)
        while self.running:
            started = time.perf_counter()
            with self.frame_lock:
                frame = None if self.latest_frame is None else self.latest_frame.copy()
            if frame is None:
                time.sleep(0.01)
                continue

            try:
                result = self.model.track(
                    frame,
                    persist=True,
                    tracker=TRACKER,
                    classes=[0],
                    conf=CONFIDENCE,
                    imgsz=IMG_SIZE,
                    device=self.device,
                    verbose=False,
                    half=bool(torch.cuda.is_available()),
                )[0]

                people = 0
                ids = []
                confidences = []
                detections = []  # (track_id, confidence) pairs, only for boxes with a track id

                if result.boxes is not None:
                    for box in result.boxes:
                        conf = float(box.conf[0])
                        confidences.append(conf)
                        people += 1
                        if box.id is not None:
                            box_id = int(box.id[0])
                            ids.append(box_id)
                            detections.append((box_id, conf))

                if ids:
                    with self._lock:
                        new_ids = [pair for pair in detections if pair[0] not in self.unique_ids]
                        self.unique_ids.update(ids)
                        if new_ids:
                            now_ts = time.time()
                            for track_id, conf in new_ids:
                                self._new_tracks.append({
                                    "track_id": track_id,
                                    "confidence": round(conf, 3),
                                    "timestamp": now_ts,
                                })
                            self._new_tracks = self._new_tracks[-200:]

                annotated = result.plot()
                cv2.putText(
                    annotated,
                    f"CURRENT PEOPLE  {people}",
                    (18, 36),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.85,
                    (0, 255, 255),
                    2,
                    cv2.LINE_AA,
                )
                ok, encoded = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 82])
                if ok:
                    with self._lock:
                        self.latest_jpeg = encoded.tobytes()
                        self.current_people = people
                        self.avg_confidence = float(np.mean(confidences)) if confidences else 0.0
                        now = time.perf_counter()
                        self._fps_times.append(now)
                        if len(self._fps_times) >= 2:
                            self.ai_fps = (len(self._fps_times) - 1) / (
                                self._fps_times[-1] - self._fps_times[0]
                            )

                elapsed = time.perf_counter() - started
                time.sleep(max(0.001, interval - elapsed))
            except Exception as exc:
                # Keep service alive if a single frame fails.
                time.sleep(0.05)

    def stats(self, mode):
        with self._lock:
            profile = PROFILES[mode].evaluate(self.current_people, self.avg_confidence)
            frame_source = self._last_submit_source
            frame_age = None if not self._last_submit_ts else round(time.time() - self._last_submit_ts, 1)
            return {
                "current_people": self.current_people,
                "unique_people": len(self.unique_ids),
                "avg_confidence": round(self.avg_confidence, 3),
                "ai_fps": round(self.ai_fps, 1),
                "device": "cuda:0" if self.device != "cpu" else "cpu",
                "engine": profile.engine,
                "priority": profile.priority,
                "priority_score": profile.score,
                "priority_label": profile.label,
                "priority_rationale": profile.rationale,
                "guidance": profile.guidance,
                # Which producer is currently feeding the detector — "browser"
                # (React getUserMedia stream) or "camera" (backend-owned
                # hardware/IP camera via CameraReader) — and how stale that
                # feed is, in seconds.
                "frame_source": frame_source,
                "frame_age": frame_age,
            }

    def jpeg(self):
        with self._lock:
            return self.latest_jpeg
