import threading
import time
import cv2
import numpy as np
from urllib.parse import urlparse


class CameraReader:
    def __init__(self, detector):
        self.detector = detector
        self.running = False
        self.thread = None
        self.source = "0"
        self.status = "offline"
        self.fps = 0.0
        self._lock = threading.Lock()
        self._cap = None

    def set_source(self, source: str):
        source = str(source).strip()
        self.source = source
        if self._cap is not None:
            try:
                self._cap.release()
            except Exception:
                pass
            self._cap = None

    def start(self):
        if self.running:
            return
        self.running = True
        self.thread = threading.Thread(target=self._loop, daemon=True)
        self.thread.start()

    def stop(self):
        self.running = False
        if self._cap is not None:
            self._cap.release()

    def _open(self):
        src = self.source
        if src.isdigit():
            cap = cv2.VideoCapture(int(src), cv2.CAP_DSHOW)
        else:
            cap = cv2.VideoCapture(src)
            try:
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            except Exception:
                pass
        if cap.isOpened():
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 960)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 540)
        return cap

    def _loop(self):
        last = time.perf_counter()
        while self.running:
            if self._cap is None or not self._cap.isOpened():
                self.status = f"connecting: {self.source}"
                self._cap = self._open()
                if not self._cap.isOpened():
                    self.status = "offline"
                    time.sleep(0.8)
                    continue

            ok, frame = self._cap.read()
            if not ok:
                self.status = "reconnecting"
                self._cap.release()
                self._cap = None
                time.sleep(0.2)
                continue

            now = time.perf_counter()
            dt = now - last
            last = now
            if dt > 0:
                self.fps = 1.0 / dt
            self.status = "online"
            self.detector.submit(frame)

    def get_status(self):
        return {
            "source": self.source,
            "status": self.status,
            "capture_fps": round(self.fps, 1),
        }
