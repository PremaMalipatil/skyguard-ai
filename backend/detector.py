import cv2
import numpy as np
from ultralytics import YOLO
import time
import random
import threading

# Target classes for surveillance
SURVEILLANCE_CLASSES = {
    0: "person",
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",
    1: "bicycle",
}

THREAT_LEVELS = {
    "person": "HIGH",
    "car": "MEDIUM",
    "truck": "HIGH",
    "motorcycle": "MEDIUM",
    "bus": "LOW",
    "bicycle": "LOW",
}

# Base GPS coordinates (Bengaluru)
BASE_LAT = 12.9716
BASE_LON = 77.5946

class SurveillanceDetector:
    def __init__(self):
        self.model = None
        self.cap = None
        self.running = False
        self.frame_lock = threading.Lock()
        self.latest_frame = None
        self.detections = []
        self.detection_history = []
        self.alerts = []
        self._load_model()

    def _load_model(self):
        try:
            self.model = YOLO("yolov8n.pt")
            print("[SKYGUARD] YOLOv8n model loaded successfully.")
        except Exception as e:
            print(f"[SKYGUARD] Model load error: {e}")
            self.model = None

    def start_capture(self):
        if self.running:
            return
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            # Fallback: generate synthetic frames
            self.cap = None
            print("[SKYGUARD] No webcam found. Using synthetic feed.")
        self.running = True
        self.thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.thread.start()

    def stop_capture(self):
        self.running = False
        if self.cap:
            self.cap.release()
            self.cap = None
        self.latest_frame = None

    def _capture_loop(self):
        while self.running:
            if self.cap and self.cap.isOpened():
                ret, frame = self.cap.read()
                if not ret:
                    # Loop or generate blank
                    frame = self._generate_synthetic_frame()
            else:
                frame = self._generate_synthetic_frame()

            annotated, dets = self._run_detection(frame)

            with self.frame_lock:
                self.latest_frame = annotated
                self.detections = dets

            if dets:
                self._process_alerts(dets)

            time.sleep(0.03)  # ~30fps

    def _generate_synthetic_frame(self):
        """Generate a dark synthetic surveillance frame."""
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        # Add noise texture
        noise = np.random.randint(0, 25, (480, 640, 3), dtype=np.uint8)
        frame = cv2.add(frame, noise)
        # Add grid lines
        for i in range(0, 640, 40):
            cv2.line(frame, (i, 0), (i, 480), (0, 30, 30), 1)
        for i in range(0, 480, 40):
            cv2.line(frame, (0, i), (640, i), (0, 30, 30), 1)
        # Add center crosshair
        cv2.line(frame, (310, 240), (330, 240), (0, 200, 200), 1)
        cv2.line(frame, (320, 230), (320, 250), (0, 200, 200), 1)
        # Overlay text
        cv2.putText(frame, "SKYGUARD AI - NO CAMERA INPUT", (80, 240),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 200, 200), 1)
        cv2.putText(frame, "SYNTHETIC FEED ACTIVE", (140, 270),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 150, 150), 1)
        return frame

    def _run_detection(self, frame):
        if self.model is None:
            return frame, []

        results = self.model(frame, conf=0.35, verbose=False)[0]
        detections = []

        for box in results.boxes:
            cls_id = int(box.cls[0])
            if cls_id not in SURVEILLANCE_CLASSES:
                continue

            label = SURVEILLANCE_CLASSES[cls_id]
            conf = float(box.conf[0])
            x1, y1, x2, y2 = map(int, box.xyxy[0])

            detections.append({
                "label": label,
                "confidence": round(conf, 3),
                "bbox": [x1, y1, x2, y2],
                "threat_level": THREAT_LEVELS.get(label, "LOW"),
                "timestamp": time.strftime("%H:%M:%S"),
                "lat": round(BASE_LAT + random.uniform(-0.002, 0.002), 6),
                "lon": round(BASE_LON + random.uniform(-0.002, 0.002), 6),
            })

            # Color by threat level
            color = {"HIGH": (0, 0, 255), "MEDIUM": (0, 165, 255), "LOW": (0, 255, 255)}.get(
                THREAT_LEVELS.get(label, "LOW"), (0, 255, 0)
            )

            # Draw bounding box
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

            # Corner brackets
            blen = 12
            for px, py, dx, dy in [(x1,y1,1,1),(x2,y1,-1,1),(x1,y2,1,-1),(x2,y2,-1,-1)]:
                cv2.line(frame, (px, py), (px + dx*blen, py), color, 2)
                cv2.line(frame, (px, py), (px, py + dy*blen), color, 2)

            # Label background
            text = f"{label.upper()} {conf:.0%}"
            (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(frame, (x1, y1 - th - 8), (x1 + tw + 6, y1), color, -1)
            cv2.putText(frame, text, (x1 + 3, y1 - 4),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)

        # HUD overlay
        ts = time.strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, f"SKYGUARD AI", (8, 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 255), 1)
        cv2.putText(frame, ts, (8, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 200, 200), 1)
        cv2.putText(frame, f"TARGETS: {len(detections)}", (8, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 100), 1)
        cv2.putText(frame, f"GPS {BASE_LAT}N {BASE_LON}E", (8, frame.shape[0]-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 180, 180), 1)

        # Scan line effect
        scan_y = int((time.time() * 80) % frame.shape[0])
        cv2.line(frame, (0, scan_y), (frame.shape[1], scan_y), (0, 255, 255, 30), 1)

        return frame, detections

    def _process_alerts(self, detections):
        for det in detections:
            if det["label"] in ["person", "truck", "car"]:
                alert = {
                    "id": int(time.time() * 1000),
                    "type": det["label"],
                    "confidence": det["confidence"],
                    "threat_level": det["threat_level"],
                    "timestamp": det["timestamp"],
                    "lat": det["lat"],
                    "lon": det["lon"],
                    "message": f"{det['threat_level']} THREAT: {det['label'].upper()} detected with {det['confidence']:.0%} confidence",
                }
                self.alerts.insert(0, alert)
                self.alerts = self.alerts[:50]  # Keep last 50

                # History
                self.detection_history.insert(0, {
                    "id": alert["id"],
                    "label": det["label"],
                    "confidence": det["confidence"],
                    "threat_level": det["threat_level"],
                    "timestamp": det["timestamp"],
                })
                self.detection_history = self.detection_history[:100]

    def get_frame_bytes(self):
        with self.frame_lock:
            if self.latest_frame is None:
                return None
            _, buf = cv2.imencode(".jpg", self.latest_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            return buf.tobytes()

    def get_alerts(self):
        return self.alerts[:20]

    def get_detections(self):
        return self.detections

    def get_history(self):
        return self.detection_history[:30]


# Singleton
detector = SurveillanceDetector()
