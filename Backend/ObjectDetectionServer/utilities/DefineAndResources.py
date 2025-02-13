from enum import Enum

## ------------------------ Server Configuration And Defines
## these three should be stored in a secret key file
BACK_END_IP = "0.0.0.0"   #accept anywhere
BACK_END_PORT = 8204
SECRET_KEY = "cstp2204SamFrackPeterAlexDiya"

STREAM_ERROR_LIMIT = 10
SAMPLING_FRAME_TEST_CONNECTION = 20

## define message type
MSG_TYPE_ERROR = "error"

## Request Token Key
ACC_ID_KEY = "accID"
EXPIRE_TIME_KEY = "expTime"

## Define the stream source from different location ID
dictLocationIDToStream = {
    "1" : "../res/video/1.mp4",
    "2" : "../res/video/2.mp4"
}

## ------------------------- Detection And Calculation Defines
class DETECT_OBJ(Enum):
    OCCUPIED     = 0
    EMPTY        = 1

# (B, G, R)
class DETECT_OBJ_COLOR(Enum):
    OCCUPIED = (128, 0, 255)
    EMPTY = (255, 0, 0)
    NONE = (0, 0, 0)

class YOLO_MODEL_KEY(Enum):
    V11_N = 0
    V11_l_18JAN = 1

YOLO_model_dict = {
    YOLO_MODEL_KEY.V11_N : "utilities\model\YOLO_weight\yolo11n.pt",
    YOLO_MODEL_KEY.V11_l_18JAN : "utilities\model\YOLO_weight\yolo11_l_18Jan.pt"
}