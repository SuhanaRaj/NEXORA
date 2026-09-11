import asyncio
import ipaddress
import json
import socket
import time
from contextlib import asynccontextmanager
from pathlib import Path
from threading import Thread

from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel

from .browser_gps import BrowserGPS
from .camera import CameraReader
from .config import HOST, PORT, GPS_UDP_PORT
from .detector import PersonDetector
from .gps import GPSReceiver
from .phone_gps import PhoneGPS
from .state import AppState

ROOT = Path(__file__).resolve().parent.parent
RUNTIME_DIR = ROOT / ".runtime"
CERT_FILE = RUNTIME_DIR / "phone_gps_cert.pem"
KEY_FILE = RUNTIME_DIR / "phone_gps_key.pem"
HTTPS_PORT = 8443

state = AppState()
detector = PersonDetector()
camera = CameraReader(detector)
gps = GPSReceiver(GPS_UDP_PORT)
phone_gps = PhoneGPS()
browser_gps = BrowserGPS()


class CameraRequest(BaseModel):
    source: str


class ModeRequest(BaseModel):
    mode: str


class PhoneGPSRequest(BaseModel):
    latitude: float
    longitude: float
    altitude: float | None = None
    speed: float | None = None
    accuracy: float | None = None
    heading: float | None = None


def local_ip():
    """Best-effort LAN IPv4 address for the phone GPS bridge URL."""
    candidates = []
    try:
        hostname = socket.gethostname()
        for info in socket.getaddrinfo(hostname, None, socket.AF_INET):
            candidates.append(info[4][0])
    except Exception:
        pass
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        candidates.insert(0, s.getsockname()[0])
        s.close()
    except Exception:
        pass
    for ip in candidates:
        try:
            addr = ipaddress.ip_address(ip)
            if addr.version == 4 and not addr.is_loopback and not addr.is_link_local:
                return ip
        except ValueError:
            pass
    return "127.0.0.1"


def ensure_tls_certificate():
    """Create a local self-signed certificate containing the current LAN IP."""
    RUNTIME_DIR.mkdir(exist_ok=True)
    ip = local_ip()
    try:
        from cryptography import x509
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.x509.oid import NameOID
        from datetime import datetime, timedelta, timezone

        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "SIH Drone Rescue AI Local"),
            x509.NameAttribute(NameOID.COMMON_NAME, ip),
        ])
        san = [x509.DNSName("localhost"), x509.IPAddress(ipaddress.ip_address("127.0.0.1"))]
        try:
            san.append(x509.IPAddress(ipaddress.ip_address(ip)))
        except ValueError:
            pass
        cert = (
            x509.CertificateBuilder()
            .subject_name(subject)
            .issuer_name(issuer)
            .public_key(key.public_key())
            .serial_number(x509.random_serial_number())
            .not_valid_before(datetime.now(timezone.utc) - timedelta(minutes=1))
            .not_valid_after(datetime.now(timezone.utc) + timedelta(days=365))
            .add_extension(x509.SubjectAlternativeName(san), critical=False)
            .sign(key, hashes.SHA256())
        )
        KEY_FILE.write_bytes(key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption(),
        ))
        CERT_FILE.write_bytes(cert.public_bytes(serialization.Encoding.PEM))
        return str(CERT_FILE), str(KEY_FILE), ip
    except Exception as exc:
        raise RuntimeError(f"Could not create local HTTPS certificate: {exc}") from exc


@asynccontextmanager
async def lifespan(app: FastAPI):
    detector.start()
    camera.start()
    gps.start()
    phone_gps.start()
    task = asyncio.create_task(state_loop())
    yield
    task.cancel()
    gps.stop()
    phone_gps.stop()
    camera.stop()
    detector.stop()


app = FastAPI(title="SIH Disaster Response Drone AI", lifespan=lifespan)

# The frontend (SPADE, Vite dev server) runs on a different origin/port than
# this API, and may also be opened from a LAN IP for phone testing — allow
# any origin rather than hardcoding one, since this is a local/dev deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def state_loop():
    while True:
        telem, _ = gps.get()
        ip_phone, ip_phone_rx = phone_gps.get()
        browser_phone, browser_rx, browser_status = browser_gps.get()

        # Real phone browser GPS is the highest-priority position source.
        if browser_phone and (time.time() - browser_rx) < 5:
            current_battery = state.position["battery"] if state.position else 100
            state.update_position({
                **browser_phone,
                "battery": current_battery,
            })
            state.phone_gps_status = f"phone GPS live • ±{browser_phone.get('accuracy', 0):.0f} m"
        # IP Webcam GPS remains a fallback if a future app version exposes it.
        elif ip_phone and (time.time() - ip_phone_rx) < 3:
            state.update_position({
                **ip_phone,
                "altitude": state.position["altitude"] if state.position else 0,
                "speed": 0,
                "battery": state.position["battery"] if state.position else 100,
            })
            state.phone_gps_status = phone_gps.status
        elif telem:
            state.update_position(telem.to_dict())
            state.phone_gps_status = browser_status if browser_status != "phone GPS bridge offline" else phone_gps.status
        else:
            state.phone_gps_status = browser_status if browser_status != "phone GPS bridge offline" else phone_gps.status

        # Turn any newly-tracked person into a survivor_detected event using
        # the AI's own current priority evaluation — no separate/new logic.
        new_tracks = detector.pop_new_tracks()
        if new_tracks:
            ai_now = detector.stats(state.mode)
            for track in new_tracks:
                state.add_detection_event(track, ai_now, state.position)

        await asyncio.sleep(0.25)


# @app.get("/")
# def index():
#     return FileResponse(ROOT / "frontend" / "index.html")


# @app.get("/phone-gps")
# def phone_gps_page():
#     return FileResponse(ROOT / "frontend" / "phone_gps.html")


# @app.get("/app.js")
# def app_js():
#     return FileResponse(ROOT / "frontend" / "app.js", media_type="application/javascript")


# @app.get("/style.css")
# def style_css():
#     return FileResponse(ROOT / "frontend" / "style.css", media_type="text/css")


# @app.get("/phone-gps.js")
# def phone_gps_js():
#     return FileResponse(ROOT / "frontend" / "phone_gps.js", media_type="application/javascript")


@app.get("/api/network")
def api_network():
    ip = local_ip()
    return {
        "local_ip": ip,
        "phone_gps_url": f"https://{ip}:{HTTPS_PORT}/phone-gps",
        "http_url": f"http://{ip}:{PORT}",
    }


@app.get("/api/state")
def api_state():
    return state.snapshot(detector, camera)


@app.post("/api/mode")
def api_mode(req: ModeRequest):
    state.set_mode(req.mode)
    return {"ok": True, "mode": state.mode}


@app.post("/api/camera")
def api_camera(req: CameraRequest):
    camera.set_source(req.source)
    phone_gps.set_camera_url(req.source)
    return {"ok": True, "source": req.source}


@app.post("/api/phone-gps")
def api_phone_gps(req: PhoneGPSRequest):
    try:
        point = browser_gps.update(req.model_dump())
        return {"ok": True, "latitude": point["latitude"], "longitude": point["longitude"]}
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/api/rth")
def api_rth():
    state.manual_rth = True
    return {"ok": True}


@app.post("/api/rth/reset")
def api_rth_reset():
    state.manual_rth = False
    return {"ok": True}


@app.post("/api/reset-tracking")
def reset_tracking():
    detector.reset_tracking()
    return {"ok": True}


@app.post("/api/gps")
def api_gps(payload: dict):
    state.update_position(payload)
    return {"ok": True}


@app.get("/video_feed")
def video_feed():
    def frames():
        while True:
            jpeg = detector.jpeg()
            if jpeg:
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n"
                    b"Cache-Control: no-cache\r\n\r\n" + jpeg + b"\r\n"
                )
            else:
                time.sleep(0.03)
    return StreamingResponse(frames(), media_type="multipart/x-mixed-replace; boundary=frame")


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            await ws.send_text(json.dumps(state.snapshot(detector, camera)))
            await asyncio.sleep(0.25)
    except Exception:
        pass


def run_server(http=True, https=True):
    import uvicorn
    cert, key, ip = ensure_tls_certificate()
    servers = []

    http_config = uvicorn.Config(app, host=HOST, port=PORT, log_level="info")
    http_server = uvicorn.Server(http_config)
    servers.append(http_server)

    https_config = uvicorn.Config(
        app,
        host=HOST,
        port=HTTPS_PORT,
        log_level="info",
        ssl_certfile=cert,
        ssl_keyfile=key,
        lifespan="off",
    )
    https_server = uvicorn.Server(https_config)
    servers.append(https_server)

    threads = []
    for server in servers:
        t = Thread(target=server.run, daemon=True)
        t.start()
        threads.append(t)

    print("\n=== SIH DRONE RESCUE AI ===")
    print(f"Dashboard: http://127.0.0.1:{PORT}")
    print(f"Phone GPS bridge: https://{ip}:{HTTPS_PORT}/phone-gps")
    print("On the phone, open the Phone GPS bridge URL, accept the local certificate warning, and tap START PHONE GPS.")
    print("============================\n")
    try:
        while any(t.is_alive() for t in threads):
            time.sleep(0.5)
    except KeyboardInterrupt:
        for server in servers:
            server.should_exit = True
        for t in threads:
            t.join(timeout=2)


if __name__ == "__main__":
    run_server()
