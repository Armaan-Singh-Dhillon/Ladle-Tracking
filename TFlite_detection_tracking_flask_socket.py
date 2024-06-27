import pygame
from flask_socketio import SocketIO, emit
from flask import Flask
import importlib.util
import sys
import numpy as np
import cv2
import time
import argparse
import os
import eventlet
eventlet.monkey_patch()


# Initialize Pygame mixer
pygame.mixer.init()

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")


@app.route('/')
def index():
    return "Object Detection Server Running"


background_task_started = False

# Define and parse input arguments
parser = argparse.ArgumentParser()
parser.add_argument(
    '--modeldir', help='Folder the .tflite file is located in', required=True)
parser.add_argument(
    '--graph', help='Name of the .tflite file, if different than detect.tflite', default='detect.tflite')
parser.add_argument(
    '--labels', help='Name of the labelmap file, if different than labelmap.txt', default='labelmap.txt')
parser.add_argument(
    '--threshold', help='Minimum confidence threshold for displaying detected objects', default=0.8)
parser.add_argument(
    '--video', help='Name of the video file', default='test.mp4')
parser.add_argument(
    '--edgetpu', help='Use Coral Edge TPU Accelerator to speed up detection', action='store_true')

args = parser.parse_args()

MODEL_NAME = args.modeldir
GRAPH_NAME = args.graph
LABELMAP_NAME = args.labels
VIDEO_NAME = args.video
min_conf_threshold = float(args.threshold)
use_TPU = args.edgetpu

# Import TensorFlow libraries
pkg = importlib.util.find_spec('tflite_runtime')
if pkg:
    from tflite_runtime.interpreter import Interpreter
    if use_TPU:
        from tflite_runtime.interpreter import load_delegate
else:
    from tensorflow.lite.python.interpreter import Interpreter
    if use_TPU:
        from tensorflow.lite.python.interpreter import load_delegate

if use_TPU:
    if (GRAPH_NAME == 'detect.tflite'):
        GRAPH_NAME = 'edgetpu.tflite'

CWD_PATH = os.getcwd()
VIDEO_PATH = os.path.join(CWD_PATH, VIDEO_NAME)
PATH_TO_CKPT = os.path.join(CWD_PATH, MODEL_NAME, GRAPH_NAME)
PATH_TO_LABELS = os.path.join(CWD_PATH, MODEL_NAME, LABELMAP_NAME)

with open(PATH_TO_LABELS, 'r') as f:
    labels = [line.strip() for line in f.readlines()]

if labels[0] == '???':
    del (labels[0])

if use_TPU:
    interpreter = Interpreter(model_path=PATH_TO_CKPT, experimental_delegates=[
                              load_delegate('libedgetpu.so.1.0')])
else:
    interpreter = Interpreter(model_path=PATH_TO_CKPT)

interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()
height = input_details[0]['shape'][1]
width = input_details[0]['shape'][2]

floating_model = (input_details[0]['dtype'] == np.float32)

input_mean = 127.5
input_std = 127.5

outname = output_details[0]['name']
if ('StatefulPartitionedCall' in outname):  # This is a TF2 model
    boxes_idx, classes_idx, scores_idx = 1, 3, 0
else:  # This is a TF1 model
    boxes_idx, classes_idx, scores_idx = 0, 1, 2

video = cv2.VideoCapture(VIDEO_PATH)
if not video.isOpened():
    print(f"Error: Could not open video {VIDEO_PATH}")
else:
    print(f"Successfully opened video {VIDEO_PATH}")
imW = video.get(cv2.CAP_PROP_FRAME_WIDTH)
imH = video.get(cv2.CAP_PROP_FRAME_HEIGHT)

movement_threshold = 2  # Adjust this value based on your needs


def is_moving(box1, box2, threshold):
    x1, y1, x2, y2 = box1
    x3, y3, x4, y4 = box2
    center1 = ((x1 + x2) / 2, (y1 + y2) / 2)
    center2 = ((x3 + x4) / 2, (y3 + y4) / 2)
    distance = np.sqrt((center2[0] - center1[0]) **
                       2 + (center2[1] - center1[1]) ** 2)
    return distance > threshold


def calculate_velocity_and_direction(prev_center, curr_center, time_diff):
    # Calculate velocity (pixels per second)
    velocity = np.sqrt((curr_center[0] - prev_center[0]) **
                       2 + (curr_center[1] - prev_center[1]) ** 2) / time_diff

    # Calculate direction (angle in degrees)
    angle = np.degrees(np.arctan2(
        curr_center[1] - prev_center[1], curr_center[0] - prev_center[0]))

    # Determine direction as "left", "right", "up", or "down"
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
frame_interval = 20  # Assuming 30 FPS, this will be 2 seconds
previous_time = time.time()


def generate_object_data():
    global previous_frame_objects, status, count, frame_count, previous_time
    while True:
        ret, frame = video.read()
        if not ret:
            print('Reached the end of the video, looping back to start.')
            video.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frame_resized = cv2.resize(frame_rgb, (width, height))
        input_data = np.expand_dims(frame_resized, axis=0)

        if floating_model:
            input_data = (np.float32(input_data) - input_mean) / input_std

        interpreter.set_tensor(input_details[0]['index'], input_data)
        interpreter.invoke()

        boxes = interpreter.get_tensor(output_details[boxes_idx]['index'])[0]
        classes = interpreter.get_tensor(
            output_details[classes_idx]['index'])[0]
        scores = interpreter.get_tensor(output_details[scores_idx]['index'])[0]

        current_frame_objects = []
        current_time = time.time()
        time_diff = current_time - previous_time
        previous_time = current_time

        for i in range(len(scores)):
            if ((scores[i] > min_conf_threshold) and (scores[i] <= 1.0)):
                ymin = int(max(1, (boxes[i][0] * imH)))
                xmin = int(max(1, (boxes[i][1] * imW)))
                ymax = int(min(imH, (boxes[i][2] * imH)))
                xmax = int(min(imW, (boxes[i][3] * imW)))
                bbox = [xmin, ymin, xmax, ymax]
                current_frame_objects.append((bbox, classes[i]))

                object_name = labels[int(classes[i])]
                curr_center = ((xmin + xmax) // 2, (ymin + ymax) // 2)

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
                        'confidence': float(scores[i]),
                        'timestamp': int(time.time() * 1000)
                    }
                    print("Sending data: ", data)
                    socketio.emit('object_data', data)
                    eventlet.sleep(0)

                # Drawing detection results on the frame
                label = f'{object_name}: {int(scores[i]*100)}% ({status})'
                labelSize, baseLine = cv2.getTextSize(
                    label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
                label_ymin = max(ymin, labelSize[1] + 10)
                cv2.rectangle(frame, (xmin, label_ymin-labelSize[1]-10), (
                    xmin+labelSize[0], label_ymin+baseLine-10), (255, 255, 255), cv2.FILLED)
                cv2.putText(frame, label, (xmin, label_ymin-7),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)

        previous_frame_objects = current_frame_objects
        cv2.imshow('Object detector', frame)

        frame_count += 1

        if cv2.waitKey(1) == ord('q'):
            break

    video.release()
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
