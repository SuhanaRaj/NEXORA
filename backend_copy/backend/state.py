import time
import math
from threading import Lock


def haversine_m(a, b):
    if not a or not b:
        return 0.0
    R = 6371000.0
    p1 = math.radians(a["latitude"])
    p2 = math.radians(b["latitude"])
    dp = math.radians(b["latitude"] - a["latitude"])
    dl = math.radians(b["longitude"] - a["longitude"])
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))


class AppState:
    def __init__(self):
        self.lock = Lock()
        self.mode = "flood"
        self.home = None
        self.position = None
        self.trail = []
        self.last_gps = 0.0
        self.manual_rth = False
        self.phone_gps_status = "not connected"
        self.detection_events = []
        self._survivor_seq = 0

    def update_position(self, gps):
        with self.lock:
            point = {
                "latitude": gps["latitude"],
                "longitude": gps["longitude"],
                "altitude": gps.get("altitude", 0),
                "speed": gps.get("speed", 0),
                "battery": gps.get("battery", 100),
                "source": gps.get("source", "telemetry"),
                "timestamp": gps.get("timestamp", time.time()),
            }
            if self.home is None or (point["source"] == "phone_gps_browser" and self.home.get("source") != "phone_gps_browser"):
                self.home = dict(point)
            self.position = point
            self.last_gps = time.time()
            if not self.trail or haversine_m(self.trail[-1], point) >= 1.0:
                self.trail.append({
                    "latitude": point["latitude"],
                    "longitude": point["longitude"],
                })
                self.trail = self.trail[-1200:]

    def set_mode(self, mode):
        if mode in ("flood", "earthquake", "landslide"):
            with self.lock:
                self.mode = mode

    def add_detection_event(self, track, ai_now, position):
        """Turn a newly-seen AI track into a survivor_detected event.

        `track` = {"track_id", "confidence", "timestamp"} from PersonDetector's
        own new-track buffer (real per-detection confidence, real track id).
        `ai_now` = detector.stats(mode) at the moment of detection — reuses the
        SAME priority logic already computed for the scene (ai_profiles.py),
        rather than inventing a separate per-survivor priority rule.
        `position` = current drone/phone position, if any. This is the
        DRONE'S position, not a triangulated survivor position — the AI only
        knows the person was somewhere in the camera frame at that moment, so
        the location is recorded explicitly as approximate.
        """
        with self.lock:
            self._survivor_seq += 1
            event = {
                "event": "survivor_detected",
                "id": f"SRV-{self._survivor_seq:03d}",
                "track_id": track["track_id"],
                "confidence": track["confidence"],
                "priority": ai_now.get("priority", "MEDIUM"),
                "status": "Detected",
                "detected_by": "SPADE-DRONE-01",
                "timestamp": track["timestamp"],
                "latitude": position["latitude"] if position else None,
                "longitude": position["longitude"] if position else None,
                "location_is_approximate": True,
            }
            self.detection_events.append(event)
            self.detection_events = self.detection_events[-100:]
            return event

    def snapshot(self, detector, camera):
        with self.lock:
            position = dict(self.position) if self.position else None
            home = dict(self.home) if self.home else None
            trail = list(self.trail)
            mode = self.mode
            last_gps = self.last_gps
            phone_gps_status = self.phone_gps_status
            manual_rth = self.manual_rth

        ai = detector.stats(mode)
        gps_age = None if not last_gps else round(time.time() - last_gps, 1)
        gps_timeout = gps_age is None or gps_age > 6
        battery = position.get("battery", 100) if position else 100
        low_battery = battery <= 20
        failsafe = manual_rth or gps_timeout or low_battery

        return {
            "mode": mode,
            "position": position,
            "home": home,
            "trail": trail,
            "gps_age": gps_age,
            "gps_timeout": gps_timeout,
            "battery_low": low_battery,
            "failsafe": failsafe,
            "failsafe_reason": (
                "Manual RTH" if manual_rth else
                "GPS link lost" if gps_timeout else
                "Battery at or below 20%" if low_battery else
                "Standby"
            ),
            "phone_gps_status": phone_gps_status,
            "camera": camera.get_status(),
            "ai": ai,
            "last_detection": self.detection_events[-20:],
        }
