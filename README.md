# 🛸 SKYGUARD AI — Smart Surveillance Drone System

> AI-powered drone surveillance dashboard with real-time YOLOv8 object detection, live video streaming, threat alerts, radar, and tactical map.

![SKYGUARD AI Dashboard](https://img.shields.io/badge/SKYGUARD-AI-00f5ff?style=for-the-badge&logo=shield&logoColor=white)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-ff6b00?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge)

---

## 🏗️ Project Structure

```
smart-surveillance-drone/
├── backend/
│   ├── main.py           # FastAPI app + all API endpoints
│   ├── detector.py       # YOLOv8 inference + OpenCV capture
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── App.jsx                       # Main dashboard layout
    │   ├── index.css                     # Cyberpunk theme styles
    │   ├── main.jsx
    │   └── components/
    │       ├── Navbar.jsx                # System status navbar
    │       ├── LiveFeed.jsx              # MJPEG stream viewer
    │       ├── AlertPanel.jsx            # Real-time threat alerts
    │       ├── StatsCard.jsx             # Metric cards
    │       ├── TelemetryPanel.jsx        # Drone telemetry
    │       ├── RadarAnimation.jsx        # Canvas radar sweep
    │       ├── MapPanel.jsx              # Leaflet tactical map
    │       └── DetectionHistory.jsx      # Detection log sidebar
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── index.html
```

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- Webcam (optional — synthetic feed provided as fallback)

---

### Step 1 — Backend Setup

```bash
cd smart-surveillance-drone/backend

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate          # macOS/Linux
# venv\Scripts\activate           # Windows

# Install Python dependencies
pip install -r requirements.txt
```

> **Note:** On first run, YOLOv8 will automatically download `yolov8n.pt` (~6MB) from Ultralytics.

---

### Step 2 — Frontend Setup

```bash
cd smart-surveillance-drone/frontend

# Install Node dependencies
npm install
```

---

## ▶️ Running the App

### Start Backend (Terminal 1)

```bash
cd backend
source venv/bin/activate

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend runs at: **http://localhost:8000**

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend runs at: **http://localhost:5173**

Open your browser to `http://localhost:5173` and enjoy! 🎉

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/video` | GET | MJPEG video stream with bounding boxes |
| `/alerts` | GET | Active threat alert list |
| `/detections` | GET | Current detections + history |
| `/telemetry` | GET | Drone telemetry (battery, alt, speed…) |
| `/camera/start` | POST | Start webcam capture |
| `/camera/stop` | POST | Stop webcam capture |
| `/health` | GET | System health check |

---

## 🎯 Detection Classes

| Class | Threat Level | Color |
|---|---|---|
| person | HIGH | 🔴 Red |
| truck | HIGH | 🔴 Red |
| car | MEDIUM | 🟠 Orange |
| motorcycle | MEDIUM | 🟠 Orange |
| bus | LOW | 🔵 Cyan |
| bicycle | LOW | 🔵 Cyan |

---

## 🌟 Features

### 🤖 AI Object Detection
- YOLOv8n pretrained model via Ultralytics
- 0.35 confidence threshold filtering
- Real-time bounding box overlay with corner brackets
- HUD-style annotations (GPS, timestamp, target count)

### 📺 Live Feed System
- MJPEG stream over HTTP
- ON/OFF toggle with camera start/stop API call
- Animated scan line overlay
- Blinking REC indicator
- Zoom in/out controls
- "FEED OFFLINE" state with power animation

### 🚨 Alert System
- Auto-generated alerts for person/vehicle detections
- Threat levels: LOW / MEDIUM / HIGH
- Confidence score + GPS coordinates + timestamp
- Siren sound via Web Audio API on HIGH threats
- Dismissable alert cards with confidence bars

### 📡 Telemetry Panel
- Real-time battery drain simulation
- Sinusoidal altitude/speed variation
- Signal strength, GPS coords, uptime
- Patrol/Intercept/Hover mode cycling

### 🎯 Radar Animation
- Canvas-based rotating sweep at 30fps
- Pulsing blip markers by threat level
- Concentric rings + degree markers

### 🗺️ Tactical Map
- Leaflet + OpenStreetMap with dark cyberpunk filter
- Live drone position marker with pulsing animation
- Threat markers (diamond shape, color-coded)
- Coordinates in footer bar

### 📜 Detection History
- Rolling log of last 30 detections
- Object type, confidence, threat level, timestamp

### 🎨 UI/UX
- Framer Motion boot sequence with progress bar
- Fade/slide animations on all panels
- Glassmorphism panels with animated top borders
- Custom Orbitron + Share Tech Mono fonts
- Cyberpunk color palette: navy, cyan, red glow
- Responsive grid layout

---

## 🔧 Configuration

### Change GPS coordinates (backend/detector.py)
```python
BASE_LAT = 12.9716   # Default: Bengaluru, India
BASE_LON = 77.5946
```

### Change detection confidence threshold (backend/detector.py)
```python
results = self.model(frame, conf=0.35, ...)  # Lower = more detections
```

### Change video source (backend/detector.py)
```python
self.cap = cv2.VideoCapture(0)  # 0 = default webcam, or use a file path
```

---

## 📦 Build for Production

```bash
# Frontend
cd frontend
npm run build
# Output in frontend/dist/

# Backend — use Gunicorn for production
pip install gunicorn
gunicorn main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## 🐛 Troubleshooting

**No webcam?** The system uses a synthetic dark grid feed automatically — all API endpoints still work.

**Backend CORS issues?** The FastAPI backend already allows `*` origins for development.

**Map not loading?** Ensure you have internet access for OpenStreetMap tiles.

**YOLOv8 slow?** Install CUDA-enabled PyTorch for GPU acceleration:
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

---

## 📋 Requirements

### Backend (`requirements.txt`)
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
opencv-python==4.9.0.80
ultralytics==8.2.18
numpy==1.26.4
python-multipart==0.0.9
Pillow==10.3.0
```

### Frontend (`package.json` dependencies)
```json
{
  "framer-motion": "^11.2.10",
  "leaflet": "^1.9.4",
  "lucide-react": "^0.390.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-leaflet": "^4.2.1"
}
```

---

*Built with ❤️ for AI/defense hackathons. SKYGUARD AI — Protecting the perimeter.*
