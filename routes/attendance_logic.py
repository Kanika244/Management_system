from fastapi import APIRouter, HTTPException
from datetime import datetime
from typing import Optional
import cv2
from database import attendance_collection
import numpy as np
import bson

router = APIRouter()



# OpenCV Face Detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
recognizer = cv2.face.LBPHFaceRecognizer_create()




def capture_face():
    """Captures an image from the webcam and detects a face."""
    cap = cv2.VideoCapture(0,cv2.CAP_DSHOW)
    ret, frame = cap.read()
    cap.release()

    if not ret:
        raise HTTPException(status_code=500, detail="Failed to capture image")

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    if len(faces) == 0:
        raise HTTPException(status_code=400, detail="No face detected")
    elif len(faces) > 1:
        raise HTTPException(status_code=400, detail="Multiple faces detected, please capture a single face")

    x, y, w, h = faces[0]
    face_img = gray[y:y + h, x:x + w]  # Crop the detected face

    _, img_encoded = cv2.imencode(".jpg", face_img)
    img_bytes = img_encoded.tobytes()

    return img_bytes


async def train_recognizer():
    """Trains the face recognizer with stored face images."""
    faces, labels = [], []
    label_map, label_id = {}, 0

    records = await attendance_collection.find({}).to_list(None)
    for record in records:
        if "face_img" in record:
            face_img = np.frombuffer(record["face_img"], np.uint8)
            img = cv2.imdecode(face_img, cv2.IMREAD_GRAYSCALE)
            faces.append(img)

            if str(record["_id"]) not in label_map:
                label_map[label_id] = str(record["_id"])
                label_id += 1

            labels.append(list(label_map.keys())[list(label_map.values()).index(str(record["_id"]))])

    if faces and labels:
        recognizer.train(faces, np.array(labels))

    return label_map


@router.post("/attendance")
async def mark_attendance():
    """Registers a new user or marks attendance based on face recognition."""
    face_img =  capture_face()

    label_map = await  train_recognizer()

    img_array = np.frombuffer(face_img, np.uint8)
    test_img = cv2.imdecode(img_array, cv2.IMREAD_GRAYSCALE)

    try:
        label, confidence = recognizer.predict(test_img)
    except cv2.error as e:
        raise HTTPException(status_code=500,detail="Face recognition model is not trained yet")

    if confidence < 100:
        user_id = label_map.get(label, None)

        if user_id:
                # Mark Attendance for existing user
            attendance_data = {
                "timestamp": datetime.utcnow(),
                "status": "Present"
            }
            await attendance_collection.update_one(
                {"_id": bson.ObjectId(user_id)},
                {"$push": {"attendance": attendance_data}}
            )
            return {"message": "Attendance marked", "user_id": user_id, "confidence": confidence}

    # If face is not recognized, register as a new user
    new_record = {
        "face_img": face_img,
        "timestamp": datetime.utcnow(),
        "status": "Registered"
    }
    inserted = await attendance_collection.insert_one(new_record)
    return {"message": "New user registered", "user_id": str(inserted.inserted_id)}
