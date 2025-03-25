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

## Firebase collection
STREAM_RES_COLLECTION_NAME = "STREAM_RES"

## Define the stream source from different location ID
dictLocationIDToStream = {
    "1" : "../res/video/1.mp4",
    "2" : "../res/video/2.mp4",
    "5" : "../res/video/5.mp4",
    "6" : "../res/video/6.mp4",
    "7" : "../res/video/7.mp4",
    "8" : "../res/video/8.mp4"
}

## ------------------------- Detection And Calculation Defines
class DETECT_OBJ(Enum):
    OCCUPIED     = 0
    EMPTY        = 1

# (B, G, R)
class DETECT_OBJ_COLOR(Enum):
    OCCUPIED = (105, 78, 237)
    EMPTY = (135, 245, 127)
    NONE = (0, 0, 0)

class YOLO_MODEL_KEY(Enum):
    V11_N = 0
    V11_l_18JAN = 1
    V11_s_2FEB = 2

YOLO_model_dict = {
    YOLO_MODEL_KEY.V11_N : r"utilities\model\YOLO_weight\yolo11n.pt",
    YOLO_MODEL_KEY.V11_l_18JAN : r"utilities\model\YOLO_weight\yolo11_l_18Jan.pt",
    YOLO_MODEL_KEY.V11_s_2FEB : r"utilities\model\YOLO_weight\yolo11_s_11Feb.pt",
}