import os

HOST = os.getenv("DRONE_HOST", "0.0.0.0")
PORT = int(os.getenv("DRONE_PORT", "8000"))

GPS_UDP_PORT = int(os.getenv("GPS_UDP_PORT", "5005"))
GPS_TIMEOUT_SEC = float(os.getenv("GPS_TIMEOUT_SEC", "6"))
RTH_BATTERY_THRESHOLD = float(os.getenv("RTH_BATTERY_THRESHOLD", "20"))

CAMERA_SOURCE = os.getenv("CAMERA_SOURCE", "0")
MODEL_PATH = os.getenv("YOLO_MODEL", "yolo26n.pt")
TRACKER = os.getenv("YOLO_TRACKER", "botsort.yaml")
CONFIDENCE = float(os.getenv("YOLO_CONFIDENCE", "0.30"))
IMG_SIZE = int(os.getenv("YOLO_IMG_SIZE", "512"))
MAX_AI_FPS = float(os.getenv("MAX_AI_FPS", "24"))

# Public ArcGIS cached map services from the partner screenshot.
ARC_GIS_SERVICES = {
    "street": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    "topo": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    "imagery": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    "terrain": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
}
