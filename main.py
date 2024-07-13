import pygame
from flask_socketio import SocketIO, emit
from flask import Flask
import cv2
import time
import eventlet
import numpy as np
from ultralytics import YOLO

eventlet.monkey_patch()

# Initialize Pygame mixer
pygame.mixer.init()

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")


@app.route('/')
def index():
    return "Object Detection Server Running"


background_task_started = False

# Load the YOLO model
model = YOLO("best (6).pt")

# Define class names
classNames = ["Object"]

# Open video file
cap = cv2.VideoCapture("video.mp4")
cap.set(3, 1280)  # Set width
cap.set(4, 720)  # Set height

if not cap.isOpened():
    print("Error: Could not open video")
else:
    print("Successfully opened video")

confidence_threshold = 0.95
movement_threshold = 4  # Adjust this value based on your needs


def is_moving(box1, box2, threshold):
    x1, y1, x2, y2 = box1
    x3, y3, x4, y4 = box2
    center1 = ((x1 + x2) / 2, (y1 + y2) / 2)
    center2 = ((x3 + x4) / 2, (y3 + y4) / 2)
    distance = ((center2[0] - center1[0]) ** 2 +
                (center2[1] - center1[1]) ** 2) ** 0.5
    return distance > threshold


def calculate_velocity_and_direction(prev_center, curr_center, time_diff):
    # Calculate velocity (pixels per second)
    velocity = ((curr_center[0] - prev_center[0]) ** 2 +
                (curr_center[1] - prev_center[1]) ** 2) ** 0.5 / time_diff
    # Calculate direction (angle in degrees)
    angle = np.degrees(np.arctan2(
        curr_center[1] - prev_center[1], curr_center[0] - prev_center[0]))

    if -45 <= angle <= 45:
        direction = "right"
    elif 45 < angle <= 135:
        direction = "up"
    elif -135 <= angle < -45:
        direction = "down"
    else:
        direction = "left"

    return velocity, direction


previous_frame_objects = []
status = ""
count = 0
frame_count = 0
frame_interval = 10  # Assuming 30 FPS, this will be 2 seconds
previous_time = time.time()


def generate_object_data():
    global previous_frame_objects, status, count, frame_count, previous_time
    while True:
        new_frame_time = time.time()
        ret, frame = cap.read()
        if not ret:
            print('Reached the end of the video, looping back to start.')
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        results = model(frame, stream=True)
        current_frame_objects = []
        current_time = time.time()
        time_diff = current_time - previous_time
        previous_time = current_time

        for r in results:
            boxes = r.boxes
            for i, box in enumerate(boxes):
                conf = box.conf[0]
                if conf > confidence_threshold:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    bbox = [x1, y1, x2, y2]
                    current_frame_objects.append((bbox, int(box.cls[0])))

                    object_name = classNames[int(box.cls[0])]
                    curr_center = ((x1 + x2) // 2, (y1 + y2) // 2)

                    if i < len(previous_frame_objects):
                        prev_bbox = previous_frame_objects[i][0]
                        prev_center = (
                            (prev_bbox[0] + prev_bbox[2]) // 2, (prev_bbox[1] + prev_bbox[3]) // 2)

                        if is_moving(prev_bbox, bbox, movement_threshold):
                            status = "Moving"
                            count = 0
                            pygame.mixer.music.stop()
                        else:
                            status = "Stopped"
                            count += 1
                            if count >= 8:
                                pygame.mixer.music.load("alarm.mp3")
                                pygame.mixer.music.play()

                        velocity, direction = calculate_velocity_and_direction(
                            prev_center, curr_center, time_diff)
                    else:
                        velocity, direction = 0.0, "N/A"

                    if frame_count % frame_interval == 0:
                        data = {
                            'id': int(i),
                            'type': object_name,
                            'position': {'x': curr_center[0], 'y': curr_center[1]},
                            'velocity': velocity,
                            'direction': direction,
                            'isMoving': status,
                            'confidence': float(conf),
                            'timestamp': int(time.time() * 1000)
                        }
                        print("Sending data: ", data)
                        socketio.emit('object_data', data)
                        eventlet.sleep(0)

                    label = f'{object_name}: {int(conf*100)}% ({status})'
                    label_size, base_line = cv2.getTextSize(
                        label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
                    label_ymin = max(y1, label_size[1] + 10)
                    cv2.rectangle(frame, (x1, label_ymin - label_size[1] - 10),
                                  (x1 + label_size[0], label_ymin + base_line - 10), (255, 255, 255), cv2.FILLED)
                    cv2.putText(frame, label, (x1, label_ymin - 7),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)

        previous_frame_objects = current_frame_objects
        cv2.imshow('Object detector', frame)
        frame_count += 1

        if cv2.waitKey(1) == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


@socketio.on('connect')
def handle_connect():
    global background_task_started
    print('Client connected')
    if not background_task_started:
        socketio.start_background_task(generate_object_data)
        background_task_started = True


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


if __name__ == '__main__':
    print("Starting server...")
    socketio.run(app, host='0.0.0.0', port=5001)
