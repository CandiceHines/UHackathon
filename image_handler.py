import cv2
import os
from datetime import datetime

def capture_image(folder='static/images'):
    capture = cv2.VideoCapture(0)

    if not cap.isOpened():
        raise RuntimeError("Webcam could not be opened.")
    
    # Read one frame
    ret, frame = cap.read()
    cap.release()

    if not ret:
        raise RuntimeError("Failed to capture image from webcam.")
    
    # Make sure folder exists
    os.makedirs(folder, exist_ok=True)

    # Generate filename
    filename = datetime.now().strftime("%Y%m%d_%H%M%S") + '.jpg'
    path = os.path.join(folder, filename)

    # Save the image
    cv2.imwrite(path, frame)

    return path