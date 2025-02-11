import cv2
import cvzone
from ultralytics import YOLO
from parking_lot_count import ParkingLotCounter
# import torch
# import torch_directml
import math

WIDTH = 1600     
HEIGHT = 900

OCCUPIED_ID = 0
EMPTY_ID = 1

# Please modify your storage path when testing

IMAGE_PATH = "1-Object_detect_YOLO/image/"
VIDEO_PATH = "1-Object_detect_YOLO/video/"

# ---- Fail to use Xe Iris
# set the device to DirectML to use GPU of Xe Iris
# device = torch_directml.device()
# device = torch.device("cpu")
# if torch_directml.is_available():
#     print("Yes")
# else:
#     print("No")

# file = "2.webp"
#file = "5.jpg"

# Image or Video testing source can be found at
# Shared One Drive - https://vccca-my.sharepoint.com/my?csf=1&web=1&e=hYo7J9&CID=affcd743%2D27ce%2D49fb%2D95ab%2D942657958535&id=%2Fpersonal%2F000469285%5Fstudent%5Fvcc%5Fca%2FDocuments%2FCSTP%202204%20IT%20Project&FolderCTID=0x01200016AB16DA1E9D3143A1B50B05B53ACDE5

video = "2.mp4"
image = "4.jpg"

cap = cv2.VideoCapture(VIDEO_PATH + video)


# YOLO weighting files can be found at
# Shared One Drive - https://vccca-my.sharepoint.com/my?csf=1&web=1&e=hYo7J9&CID=affcd743%2D27ce%2D49fb%2D95ab%2D942657958535&id=%2Fpersonal%2F000469285%5Fstudent%5Fvcc%5Fca%2FDocuments%2FCSTP%202204%20IT%20Project&FolderCTID=0x01200016AB16DA1E9D3143A1B50B05B53ACDE5

#  Use nano version - n, the smallest model for real-time capture, speed focus
#  medium version - m, general purpose
#  Use large version - l, need better GPU for real-time application
YOLO_11_s = "yolo11n.pt"
YOLO_11_l_lrn_parking = "yolo11l_learnParkingLot_18Jan.pt"

YOLO_MODEL = YOLO_11_l_lrn_parking

model = YOLO("1-Object_detect_YOLO/YOLO_weight/" + YOLO_MODEL)


# YOLO default provided classification Dict
# {
# 0: 'person', 1: 'bicycle', 2: 'car', 3: 'motorcycle', 4: 'airplane', 5: 'bus', 6: 'train', 7: 'truck', 8: 'boat', 9: 'traffic light', 10: 'fire hydrant',
# 11: 'stop sign', 12: 'parking meter', 13: 'bench', 14: 'bird', 15: 'cat', 16: 'dog', 17: 'horse', 18: 'sheep', 19: 'cow', 20: 'elephant',
# 21: 'bear', 22: 'zebra', 23: 'giraffe', 24: 'backpack', 25: 'umbrella', 26: 'handbag', 27: 'tie', 28: 'suitcase', 29: 'frisbee', 30: 'skis',
# 31: 'snowboard', 32: 'sports ball', 33: 'kite', 34: 'baseball bat', 35: 'baseball glove', 36: 'skateboard', 37: 'surfboard', 38: 'tennis racket', 39: 'bottle', 40: 'wine glass',
# 41: 'cup', 42: 'fork', 43: 'knife', 44: 'spoon', 45: 'bowl', 46: 'banana', 47: 'apple', 48: 'sandwich', 49: 'orange', 50: 'broccoli',
# 51: 'carrot', 52: 'hot dog', 53: 'pizza', 54: 'donut', 55: 'cake', 56: 'chair', 57: 'couch', 58: 'potted plant', 59: 'bed', 60: 'dining table',
# 61: 'toilet', 62: 'tv', 63: 'laptop', 64: 'mouse', 65: 'remote', 66: 'keyboard', 67: 'cell phone', 68: 'microwave', 69: 'oven', 70: 'toaster',
# 71: 'sink', 72: 'refrigerator', 73: 'book', 74: 'clock', 75: 'vase', 76: 'scissors', 77: 'teddy bear', 78: 'hair drier', 79: 'toothbrush'}
# print(model.names)


# For Static File Load and Detect
# results = model(IMAGE_PATH + file, show = False)

# for result in results:

#     img = result.plot()

#     resized_img = cv2.resize(img, (WIDTH, HEIGHT))

#     cv2.imshow("image", resized_img)

# cv2.waitKey(0)
# cv2.destroyAllWindows()

def RunAndDetect(is_Stream = True):
    #Create the object here to call function later  
    counter = ParkingLotCounter()
    while True:

        img = any

        if is_Stream:
            ok, img = cap.read()
        else:
            img = cv2.imread(IMAGE_PATH + image)

        resized_img = cv2.resize(img, (WIDTH, HEIGHT))

        img = resized_img

        results = model(img, stream=is_Stream) #, device=device)
        
        json_output = counter.process_results(results)
        print(json_output)

        for result in results:

            boxes = result.boxes.xyxy
            confidences = result.boxes.conf
            class_ids = result.boxes.cls

            for box, confidence, class_id in zip(boxes, confidences, class_ids):

                x1, y1, x2, y2 = box[:4]
                #print(x1, y1, x2, y2)
                #print(box.device)

                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

                width, height = x2 - x1, y2 - y1

                #print(f"{int(class_id)} -  {model.names[int(class_id)]}")
                
                # (B, G, R)
                color = (128, 0, 255) if int(class_id) == OCCUPIED_ID else (255, 0, 0)
                cvzone.cornerRect(img, (x1, y1, width, height), 5, 2, colorR=color)                

                #cvzone.putTextRect(img, f'{model.names[int(class_id)]} - {confidence}', (max(0, x1), max(35, y1)), scale = 1, thickness = 1)

        cv2.imshow("video", img)

        key = cv2.waitKey(1) & 0xFF

        if key == ord('q'):
            break

#RunAndDetect(False)
RunAndDetect()

cap.release()
cv2.destroyAllWindows()


