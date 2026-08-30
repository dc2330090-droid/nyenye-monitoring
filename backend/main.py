from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
from datetime import datetime, timezone
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="NYENYE API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"


# =====================================================
# ETAT DU SYSTEME
# =====================================================

state = {
    "uno_online": False,
    "esp_online": False,
    "relay": False,

    "ir": 0,

    "rpm": 0.0,
    "rms": 0.0,
    "vrms": 0.0,

    "x": 0.0,
    "y": 0.0,
    "z": 0.0,

    "last_update": None,
}


# =====================================================
# MODELES
# =====================================================

class SensorData(BaseModel):
    ir: int = 0

    rpm: float = 0.0
    rms: float = 0.0
    vrms: float = 0.0

    x: float = 0.0
    y: float = 0.0
    z: float = 0.0

    relay: bool = False


# =====================================================
# PAGE WEB
# =====================================================

@app.get("/")
async def dashboard():

    return FileResponse(
        FRONTEND_DIR / "index.html"
    )


@app.get("/style.css")
async def style():

    return FileResponse(
        FRONTEND_DIR / "style.css",
        media_type="text/css"
    )


@app.get("/app.js")
async def javascript():

    return FileResponse(
        FRONTEND_DIR / "app.js",
        media_type="application/javascript"
    )


# =====================================================
# STATUS
# =====================================================

@app.get("/api/status")
async def status():

    return state


# =====================================================
# ESP32 → API
# =====================================================

@app.post("/api/data")
async def receive_data(data: SensorData):

    state["uno_online"] = True
    state["esp_online"] = True

    state["ir"] = data.ir

    state["rpm"] = data.rpm
    state["rms"] = data.rms
    state["vrms"] = data.vrms

    state["x"] = data.x
    state["y"] = data.y
    state["z"] = data.z

    state["relay"] = data.relay

    state["last_update"] = datetime.now(
        timezone.utc
    ).isoformat()

    print(
        "DATA:",
        state
    )

    return {
        "ok": True,
        "relay": state["relay"]
    }


# =====================================================
# MARCHE
# =====================================================

@app.post("/api/motor/on")
async def motor_on():

    # Pour l'instant :
    # commande stockée côté serveur.
    #
    # Nous connecterons ensuite cette commande
    # à l'ESP32 par WebSocket/MQTT.

    state["relay"] = True

    print("COMMANDE MOTEUR : ON")

    return {
        "ok": True,
        "command": "RELAY_ON",
        "relay": True
    }


# =====================================================
# ARRET
# =====================================================

@app.post("/api/motor/off")
async def motor_off():

    state["relay"] = False

    print("COMMANDE MOTEUR : OFF")

    return {
        "ok": True,
        "command": "RELAY_OFF",
        "relay": False
    }


# =====================================================
# HEALTH CHECK
# =====================================================

@app.get("/health")
async def health():

    return {
        "status": "ok",
        "service": "NYENYE API"
    }
