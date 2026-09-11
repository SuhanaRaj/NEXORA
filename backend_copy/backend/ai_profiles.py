"""
Three independent disaster decision engines.

The vision detector is shared infrastructure (YOLO person detection + tracking).
Each disaster has its own decision policy, priorities, severity thresholds,
and mission guidance. This is deliberately not presented as three separately
trained neural networks; true disaster-specific vision models require trained
weights and labeled data.
"""

from dataclasses import dataclass


@dataclass
class AIResult:
    mode: str
    engine: str
    priority: str
    score: int
    label: str
    rationale: str
    guidance: list[str]


class DisasterAI:
    def __init__(self, mode: str):
        self.mode = mode.lower()

    def evaluate(self, current_people: int, avg_confidence: float, altitude: float | None = None) -> AIResult:
        if self.mode == "flood":
            return self._flood(current_people, avg_confidence)
        if self.mode == "earthquake":
            return self._earthquake(current_people, avg_confidence)
        return self._landslide(current_people, avg_confidence)

    def _score(self, people: int, conf: float, multiplier: float) -> int:
        return max(0, min(100, int((people * 22 + conf * 28) * multiplier)))

    def _flood(self, people, conf):
        score = self._score(people, conf, 1.12)
        if people >= 4 or score >= 80:
            priority, label = "CRITICAL", "HIGH SURVIVOR CONCENTRATION"
        elif people >= 2 or score >= 50:
            priority, label = "HIGH", "MULTIPLE SURVIVORS DETECTED"
        elif people == 1:
            priority, label = "MEDIUM", "SURVIVOR DETECTED"
        else:
            priority, label = "LOW", "NO SURVIVORS CURRENTLY VISIBLE"
        return AIResult(
            "flood", "FLOOD RESCUE AI", priority, score, label,
            "Flood policy prioritizes visible survivor concentration and rapid safe-area assessment.",
            ["Prioritize stranded groups and elevated roofs.",
             "Avoid floodwater, strong currents and power-line hazards.",
             "Prefer shoreline/grid scan and safe high-ground access."]
        )

    def _earthquake(self, people, conf):
        score = self._score(people, conf, 1.05)
        if people >= 4 or score >= 80:
            priority, label = "CRITICAL", "MULTIPLE SURVIVORS / COLLAPSE ZONE"
        elif people >= 2 or score >= 50:
            priority, label = "HIGH", "SURVIVORS NEAR STRUCTURES"
        elif people == 1:
            priority, label = "MEDIUM", "SURVIVOR DETECTED"
        else:
            priority, label = "LOW", "NO SURVIVORS CURRENTLY VISIBLE"
        return AIResult(
            "earthquake", "EARTHQUAKE RESCUE AI", priority, score, label,
            "Earthquake policy prioritizes survivor density while maintaining standoff from unstable structures.",
            ["Prioritize collapsed-structure edges and rooftops.",
             "Maintain standoff from unstable buildings.",
             "Use sector/grid search and avoid secondary-collapse zones."]
        )

    def _landslide(self, people, conf):
        score = self._score(people, conf, 1.08)
        if people >= 4 or score >= 80:
            priority, label = "CRITICAL", "HIGH PRIORITY DEBRIS CORRIDOR"
        elif people >= 2 or score >= 50:
            priority, label = "HIGH", "SURVIVORS IN LANDSLIDE ZONE"
        elif people == 1:
            priority, label = "MEDIUM", "SURVIVOR DETECTED"
        else:
            priority, label = "LOW", "NO SURVIVORS CURRENTLY VISIBLE"
        return AIResult(
            "landslide", "LANDSLIDE RESCUE AI", priority, score, label,
            "Landslide policy prioritizes survivor concentration along debris and road corridors.",
            ["Prioritize debris and blocked-road corridors.",
             "Avoid unstable slopes and secondary-slide areas.",
             "Use contour/segmented scanning from safe standoff."]
        )


PROFILES = {m: DisasterAI(m) for m in ("flood", "earthquake", "landslide")}
