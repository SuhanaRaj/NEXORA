import time
from threading import Lock


class BrowserGPS:
    """Receives real phone GPS coordinates from the phone browser bridge."""

    def __init__(self):
        self._lock = Lock()
        self.latest = None
        self.last_rx = 0.0
        self.status = "phone GPS bridge offline"

    def update(self, payload):
        lat = payload.get("latitude")
        lon = payload.get("longitude")
        if lat is None or lon is None:
            raise ValueError("latitude and longitude are required")
        lat = float(lat)
        lon = float(lon)
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            raise ValueError("invalid latitude/longitude")
        now = time.time()
        point = {
            "latitude": lat,
            "longitude": lon,
            "altitude": float(payload.get("altitude") or 0),
            "speed": float(payload.get("speed") or 0),
            "accuracy": float(payload.get("accuracy") or 0),
            "heading": float(payload.get("heading") or 0),
            "source": "phone_gps_browser",
            "timestamp": now,
        }
        with self._lock:
            self.latest = point
            self.last_rx = now
            self.status = "phone GPS live"
        return point

    def get(self):
        with self._lock:
            return (dict(self.latest) if self.latest else None), self.last_rx, self.status
