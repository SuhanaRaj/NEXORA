import json
import socket
import threading
import time
from dataclasses import dataclass, asdict


@dataclass
class GPSData:
    latitude: float
    longitude: float
    altitude: float = 0.0
    speed: float = 0.0
    battery: float = 100.0
    timestamp: float = 0.0
    source: str = "telemetry"

    def to_dict(self):
        return asdict(self)


class GPSReceiver:
    def __init__(self, port=5005):
        self.port = port
        self.running = False
        self.thread = None
        self.latest = None
        self.last_rx = 0.0
        self._lock = threading.Lock()

    def start(self):
        if self.running:
            return
        self.running = True
        self.thread = threading.Thread(target=self._loop, daemon=True)
        self.thread.start()

    def stop(self):
        self.running = False

    def _loop(self):
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind(("0.0.0.0", self.port))
        sock.settimeout(1.0)
        while self.running:
            try:
                raw, _ = sock.recvfrom(4096)
                payload = json.loads(raw.decode("utf-8"))
                gps = GPSData(
                    latitude=float(payload["latitude"]),
                    longitude=float(payload["longitude"]),
                    altitude=float(payload.get("altitude", 0)),
                    speed=float(payload.get("speed", 0)),
                    battery=float(payload.get("battery", 100)),
                    timestamp=float(payload.get("timestamp", time.time())),
                    source=str(payload.get("source", "telemetry")),
                )
                with self._lock:
                    self.latest = gps
                    self.last_rx = time.time()
            except (socket.timeout, ValueError, KeyError, json.JSONDecodeError):
                continue
            except OSError:
                break
        sock.close()

    def get(self):
        with self._lock:
            return self.latest, self.last_rx
