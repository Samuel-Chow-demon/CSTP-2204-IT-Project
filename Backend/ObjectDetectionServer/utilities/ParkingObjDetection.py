import cv2
import cvzone
from ultralytics import YOLO

from utilities.DefineAndResources import YOLO_model_dict, \
                                        YOLO_MODEL_KEY, DETECT_OBJ, DETECT_OBJ_COLOR

class ParkingObjectDetection:

    def __init__(self, yolo_model = YOLO_MODEL_KEY.V11_l_18JAN):

        yolo_model_path = YOLO_model_dict[yolo_model]
        print(yolo_model_path)

        self.model = YOLO(YOLO_model_dict[yolo_model])


    # resize is (width, height)
    def process(self, frame, resize = (0, 0)):

        if resize[0] != 0 and resize[1] != 0:
            frame = cv2.resize(frame, resize)

        results = self.model(frame, stream = True)

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
                match(int(class_id)):
                    case DETECT_OBJ.OCCUPIED.value:
                        color = DETECT_OBJ_COLOR.OCCUPIED.value
                    case DETECT_OBJ.EMPTY.value:
                        color = DETECT_OBJ_COLOR.EMPTY.value
                    case _:
                        color = DETECT_OBJ_COLOR.NONE.value

                #print(f"{int(class_id)} -  {self.model.names[int(class_id)]} - Color{color}")
                
                cvzone.cornerRect(frame, (x1, y1, width, height), 10, 2, 4, colorR=color)                

                #cvzone.putTextRect(img, f'{model.names[int(class_id)]} - {confidence}', (max(0, x1), max(35, y1)), scale = 1, thickness = 1)

        return frame