import threading
import time
import requests
from urllib.parse import urlparse


class PhoneGPS:
    """
    Polls IP Webcam's sensors.json endpoint.
    IP Webcam exposes sensor data through its HTTP API. GPS field layouts
    can vary by app version, so extraction is intentionally recursive.
    """

    def __init__(self):
        self.base_url = None
        self.running = False
        self.thread = None
        self.latest = None
        self.last_rx = 0.0
        self.status = "not connected"
        self._lock = threading.Lock()

    def set_camera_url(self, url: str):
        parsed = urlparse(url.strip())
        if parsed.hostname:
            scheme = parsed.scheme or "http"
            port = parsed.port or (443 if scheme == "https" else 80)
            self.base_url = f"{scheme}://{parsed.hostname}:{port}"
        else:
            self.base_url = None
        self.status = "camera configured"

    def start(self):
        if self.running:
            return
        self.running = True
        self.thread = threading.Thread(target=self._loop, daemon=True)
        self.thread.start()

    def stop(self):
        self.running = False

    def _find_coords(self, obj):
        if isinstance(obj, dict):
            lower = {str(k).lower(): v for k, v in obj.items()}
            lat_keys = ("latitude", "lat", "gps_latitude", "gpslat")
            lon_keys = ("longitude", "lon", "lng", "gps_longitude", "gpslon")
            lat = next((lower[k] for k in lat_keys if k in lower), None)
            lon = next((lower[k] for k in lon_keys if k in lower), None)
            if lat is not None and lon is not None:
                try:
                    return float(lat), float(lon)
                except (TypeError, ValueError):
                    pass
            for v in obj.values():
                found = self._find_coords(v)
                if found:
                    return found
        elif isinstance(obj, list):
            for v in obj:
                found = self._find_coords(v)
                if found:
                    return found
        return None

    def _loop(self):
        while self.running:
            if not self.base_url:
                time.sleep(1)
                continue
            try:
                r = requests.get(
                    self.base_url + "/sensors.json",
                    params={"sense": "gps"},
                    timeout=2,
                )
                r.raise_for_status()
                coords = self._find_coords(r.json())
                if coords:
                    lat, lon = coords
                    with self._lock:
                        self.latest = {
                            "latitude": lat,
                            "longitude": lon,
                            "source": "phone_gps",
                            "timestamp": time.time(),
                        }
                        self.last_rx = time.time()
                        self.status = "phone GPS live"
                else:
                    self.status = "camera online; GPS not exposed"
            except Exception:
                self.status = "camera online; GPS unavailable"
            time.sleep(0.7)

    def get(self):
        with self._lock:
            return self.latest, self.last_rx
