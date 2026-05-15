from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import asyncio
import time
import random
import math
from detector import detector

app = FastAPI(title="SKYGUARD AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Startup ────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    detector.start_capture()
    print("[SKYGUARD] Backend online. Surveillance active.")


@app.on_event("shutdown")
async def shutdown_event():
    detector.stop_capture()


# ─── Video Stream ─────────────────────────────────────────────────────────

def frame_generator():
    """Yield MJPEG frames continuously."""
    while True:
        frame_bytes = detector.get_frame_bytes()
        if frame_bytes:
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
            )
        time.sleep(0.04)


@app.get("/video")
def video_feed():
    return StreamingResponse(
        frame_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


# ─── Alerts ───────────────────────────────────────────────────────────────

@app.get("/alerts")
def get_alerts():
    return JSONResponse(content={"alerts": detector.get_alerts()})


# ─── Detections ───────────────────────────────────────────────────────────

@app.get("/detections")
def get_detections():
    return JSONResponse(content={
        "detections": detector.get_detections(),
        "history": detector.get_history(),
    })


# ─── Telemetry ────────────────────────────────────────────────────────────

_start_time = time.time()

@app.get("/telemetry")
def get_telemetry():
    t = time.time() - _start_time

    battery = max(5, 87 - (t / 60) * 0.5)  # slow drain
    altitude = 120 + 15 * math.sin(t / 8)
    speed = 24 + 6 * math.sin(t / 5) + random.uniform(-1, 1)
    signal = min(100, 92 + 5 * math.sin(t / 3))
    lat = 12.9716 + 0.0005 * math.sin(t / 12)
    lon = 77.5946 + 0.0005 * math.cos(t / 12)

    modes = ["PATROL", "PATROL", "PATROL", "INTERCEPT", "HOVER"]
    mode = modes[int(t / 15) % len(modes)]

    return JSONResponse(content={
        "battery": round(battery, 1),
        "altitude": round(altitude, 1),
        "speed": round(speed, 1),
        "signal": round(signal, 1),
        "lat": round(lat, 6),
        "lon": round(lon, 6),
        "mode": mode,
        "uptime": int(t),
        "threats_detected": len(detector.get_history()),
    })


# ─── Health ───────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "online", "system": "SKYGUARD AI", "version": "1.0.0"}


# ─── Control ─────────────────────────────────────────────────────────────

@app.post("/camera/start")
def camera_start():
    detector.start_capture()
    return {"status": "Camera started"}


@app.post("/camera/stop")
def camera_stop():
    detector.stop_capture()
    return {"status": "Camera stopped"}
