from flask import Flask, Response
from picamera2 import Picamera2
import cv2, io, time

app = Flask(__name__)
picam = Picamera2()
picam.configure(picam.create_video_configuration(
    main={"size": (640, 480), "format": "RGB888"}
))
picam.start()

def generate():
    while True:
        frame = picam.capture_array()
        frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        _, buf = cv2.imencode('.jpg', frame_bgr, [cv2.IMWRITE_JPEG_QUALITY, 75])
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n'
               + buf.tobytes() + b'\r\n')
        time.sleep(0.04)

@app.route('/stream')
def stream():
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, threaded=True)