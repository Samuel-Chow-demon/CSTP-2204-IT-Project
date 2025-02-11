

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