import cv2
import mediapipe as mp

BGR_COLOR_RED = (0, 0, 255)
BGR_COLOR_GREEN = (0, 255, 0)
BGR_COLOR_BLUE = (255, 0, 0)
BGR_COLOR_MAGNETA = (252, 3, 236)
BGR_COLOR_ORANGE = (3, 161, 252)

drawNodeDict_default = {
    "draw" : True,
    "draw_boundary" : True,
    "boundary_color" : BGR_COLOR_GREEN,
    "boundary_thickness" : 2,
    "connection_mode" : mp.solutions.hands_connections.HAND_CONNECTIONS,     # All Node connected together
    "connect_color" : BGR_COLOR_GREEN,                                        # Default connect line is green
    "node_thickness" : 2,
    "connect_thickness" : 2,
    "left_hand_color" : BGR_COLOR_BLUE,
    "right_hand_color" : BGR_COLOR_MAGNETA
}

# notation as private
def _getCoordFromImgRatio(img, x, y):
    h, w, c = img.shape
    return int(x*w), int(y*h)

class HandDetection:

    def __init__(self):
        self.mpHands = mp.solutions.hands
        self.handsDetector = self.mpHands.Hands()       #default static image = false, detect on first frames and use tracking to estimate for the continue frame
        self.handsDraw = mp.solutions.drawing_utils
        # self.nodeCXY_init = {
        #     self.mpHands.HandLandmark.WRIST : (0, 0),
        #     self.mpHands.HandLandmark.THUMB_CMC : (0, 0),
        #     self.mpHands.HandLandmark.THUMB_MCP : (0, 0),
        #     self.mpHands.HandLandmark.THUMB_IP : (0, 0),
        #     self.mpHands.HandLandmark.THUMB_TIP : (0, 0),
        #     self.mpHands.HandLandmark.INDEX_FINGER_MCP : (0, 0),
        #     self.mpHands.HandLandmark.INDEX_FINGER_PIP : (0, 0),
        #     self.mpHands.HandLandmark.INDEX_FINGER_DIP : (0, 0),
        #     self.mpHands.HandLandmark.INDEX_FINGER_TIP : (0, 0),
        #     self.mpHands.HandLandmark.MIDDLE_FINGER_MCP : (0, 0),
        #     self.mpHands.HandLandmark.MIDDLE_FINGER_PIP : (0, 0),
        #     self.mpHands.HandLandmark.MIDDLE_FINGER_DIP : (0, 0),
        #     self.mpHands.HandLandmark.MIDDLE_FINGER_TIP : (0, 0),
        #     self.mpHands.HandLandmark.RING_FINGER_MCP : (0, 0),
        #     self.mpHands.HandLandmark.RING_FINGER_PIP : (0, 0),
        #     self.mpHands.HandLandmark.RING_FINGER_DIP : (0, 0),
        #     self.mpHands.HandLandmark.RING_FINGER_TIP : (0, 0),
        #     self.mpHands.HandLandmark.PINKY_MCP : (0, 0),
        #     self.mpHands.HandLandmark.PINKY_PIP : (0, 0),
        #     self.mpHands.HandLandmark.PINKY_DIP : (0, 0),
        #     self.mpHands.HandLandmark.PINKY_TIP : (0, 0)
        # }

    # img current video capture frame
    def GetAndDrawNode(self, img, drawNodeDict = drawNodeDict_default):
        # Since the cv2 cap img is the form of BGR order
        imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Detect if hands exists
        imgDetected = self.handsDetector.process(imgRGB)
        allHandsLandMarks = imgDetected.multi_hand_landmarks

        # Init as None
        nodeCXY_left = None
        nodeCXY_right = None
        if allHandsLandMarks:
            for i, handsLandMarks in enumerate(allHandsLandMarks):

                #Since the Camera is mirrored, label 'left' is right hand
                is_right_hand = True if imgDetected.multi_handedness[i].classification[0].label == 'Left' else False

                if drawNodeDict["draw"]:

                    #Since the Camera is mirrored, label 'left' is right hand
                    node_color = drawNodeDict["right_hand_color"] if is_right_hand else drawNodeDict["left_hand_color"]

                    self.handsDraw.draw_landmarks(img, handsLandMarks, drawNodeDict["connection_mode"],
                                            self.handsDraw.DrawingSpec(color=node_color, thickness=drawNodeDict["node_thickness"]),
                                            self.handsDraw.DrawingSpec(color=drawNodeDict["connect_color"], thickness=drawNodeDict["connect_thickness"])
                                            )
                    
                x_min, y_min, x_max, y_max = None, None, None, None

                for id, lm in enumerate(handsLandMarks.landmark): 
                    cx, cy = _getCoordFromImgRatio(img, lm.x, lm.y)

                    x_min = cx if x_min is None else min(x_min, cx)
                    y_min = cy if y_min is None else min(y_min, cy)
                    x_max = cx if x_max is None else max(x_max, cx)
                    y_max = cy if y_max is None else max(y_max, cy)

                    if is_right_hand:
                        if nodeCXY_right is None:
                            nodeCXY_right = {}
                        nodeCXY_right[id] = (cx, cy)
                    else:
                        if nodeCXY_left is None:
                            nodeCXY_left = {}
                        nodeCXY_left[id] = (cx, cy)

                if drawNodeDict["draw_boundary"] and \
                (x_min is not None and \
                y_min is not None and \
                x_max is not None and \
                y_max is not None):
                    cv2.rectangle(img, (int(x_min * 0.9), int(y_min * 0.9)), (int(x_max * 1.05), int(y_max * 1.05)),
                                    drawNodeDict["boundary_color"], drawNodeDict["boundary_thickness"])

                    
        return nodeCXY_left, nodeCXY_right
