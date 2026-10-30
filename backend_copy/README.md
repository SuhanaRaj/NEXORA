# SIH DRONE RESCUE AI — FINAL ONE-SHOT DEMO

## What this version does

This is the final SIH presentation prototype for a phone-as-drone demonstration.

### Core pipeline

PHONE / IP WEBCAM
    -> live video
    -> YOLO26 person detection
    -> BoT-SORT multi-person tracking
    -> survivor count + unique tracking IDs
    -> disaster-specific AI decision engine
    -> priority score / red emergency observation zone

PHONE GPS / TELEMETRY
    -> live latitude/longitude
    -> map marker
    -> persistent flight trail
    -> first valid position = HOME / LAUNCH
    -> GPS loss / low battery / manual RTH = fail-safe state

## Three independent disaster AI engines

FLOOD AI:
- survivor concentration
- elevated roofs / stranded groups
- floodwater/current/power-line hazards
- shoreline/grid scan policy

EARTHQUAKE AI:
- survivor concentration near structures
- collapsed structure/rooftop priority
- unstable-structure standoff
- sector/grid scan policy

LANDSLIDE AI:
- survivor concentration along debris/roads
- unstable slope / secondary slide avoidance
- contour/segmented scan policy

The project does NOT falsely claim three separately trained neural networks.
The shared vision model is YOLO26; the three AI decision engines are separate
disaster-specific policies. Three separately trained vision models would require
separate labeled datasets and weights.

## Map

The map uses the ArcGIS services shown in the supplied partner screenshot:
- World Street Map
- World Topo Map
- World Imagery
- World Terrain Base

These are selected directly in the dashboard. The map follows the current
phone/drone GPS position and can recenter on it.

## Phone GPS — real phone location

The final build does **not depend on IP Webcam's GPS sensor API**. The tested IP
Webcam setup can provide the camera stream while its GPS endpoint returns no
coordinates. Instead, the project includes a secure local **Phone GPS Link**.

When the backend starts, it prints a URL similar to:

https://192.168.x.x:8443/phone-gps

Open that URL on the **same phone** that is running IP Webcam Pro. Accept the
local certificate warning if Chrome shows one, then tap **START PHONE GPS** and
allow precise location. The phone browser's real Geolocation API sends latitude,
longitude, altitude, speed and accuracy to the dashboard over the local network.
The dashboard gives this browser GPS source priority over the simulator and the
IP Webcam sensor fallback. The first valid phone GPS position becomes HOME.

The browser Geolocation API is designed to provide latitude/longitude and can
provide altitude, speed, heading and accuracy when available.

If phone GPS is unavailable, the included GPS simulator can still drive the demo.

## Installation

Use Python 3.11.

Create a venv outside the project folder if Windows denies folder creation:

python -m venv "$env:USERPROFILE\SIH_Drone_Rescue_AI_FINAL_venv"

Activate:

& "$env:USERPROFILE\SIH_Drone_Rescue_AI_FINAL_venv\Scripts\Activate.ps1"

Install CUDA PyTorch (for your RTX 2050):

python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu130

Install the project:

python -m pip install -r requirements.txt

Verify:

python -c "import torch; print(torch.cuda.is_available()); print(torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU')"

## Run

Terminal 1:
python -m backend.main

Laptop dashboard:
http://127.0.0.1:8000

The backend also starts an HTTPS phone-GPS bridge on port 8443. The exact LAN
URL is printed in the terminal and appears in the dashboard under PHONE GPS LINK.

Terminal 2 (optional simulator):
python simulator\gps_simulator.py

## Phone camera

Keep phone and laptop on the same Wi-Fi/hotspot.

In IP Webcam Pro start the server. If the app shows:
http://192.168.x.x:8080

enter:
http://192.168.x.x:8080/video

in the dashboard and click CONNECT.

The backend will also attempt:
http://192.168.x.x:8080/sensors.json

for phone GPS.

## Presentation flow

1. Start backend.
2. Open dashboard.
3. Start phone IP Webcam.
4. Connect phone video.
5. Open the printed/dashboard **Phone GPS Link** on the same phone. Accept the
   local HTTPS certificate warning if prompted and tap START PHONE GPS.
6. Select FLOOD AI / EARTHQUAKE AI / LANDSLIDE AI.
7. Show one, two, then three people entering the camera frame.
8. Current People changes immediately; Total Unique tracks the session.
9. Move the phone and show the real phone GPS/map position following it.
10. The first valid phone GPS position is HOME.
10. Stop phone GPS or trigger low battery in the simulator to show the RTH fail-safe state.
11. Use SIMULATE RETURN HOME for the dashboard animation/demo.

## Critical safety architecture

This is a laptop/phone demonstration. A real drone must have autonomous
RTL/RTH implemented onboard the flight controller. Internet, Wi-Fi, the laptop,
and this dashboard must never be the sole safety dependency.

## Map attribution

The ArcGIS basemaps are displayed with Esri attribution in the Leaflet map
controls. Check the current service terms/attribution requirements before any
public or commercial deployment.
