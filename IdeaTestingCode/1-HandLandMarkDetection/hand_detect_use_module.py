import cv2
import time
import HandDetectModule as HandDetect

CONST_CAMERA_IDX = 0

cap = cv2.VideoCapture(CONST_CAMERA_IDX)

prevTime, curTime = [0, 0]

def getFPS_Str():
    global prevTime, curTime
    prevTime = curTime
    curTime = time.time()
    diff = curTime - prevTime
    fps = 1 / diff if diff != 0 else 0
    return str(int(fps))

handDetectObj = HandDetect.HandDetection()

while True:

    ok, img = cap.read()

    nodeCXY_left, nodeCXY_right = handDetectObj.GetAndDrawNode(img)

    if nodeCXY_left is not None:
        for id, nodeCXY in nodeCXY_left.items():
            print(f'Left {id} : x {nodeCXY[0]} y {nodeCXY[1]}')

    if nodeCXY_right is not None:
        for id, nodeCXY in nodeCXY_right.items():
            print(f'Right {id} : x {nodeCXY[0]} y {nodeCXY[1]}')

    cv2.putText(img, getFPS_Str(), (10, 50), cv2.FONT_HERSHEY_PLAIN, 2, (255, 0, 0), 3)

    cv2.imshow("Hand Detect", img)

    keycapture = cv2.waitKey(1) & 0xFF

    if keycapture == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()


