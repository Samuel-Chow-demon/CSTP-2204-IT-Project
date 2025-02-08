from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import asyncio
import json
import jwt
import time
import cv2
from fastapi.testclient import TestClient
from fastapi.responses import JSONResponse
from fastapi.websockets import WebSocketState
from urllib.parse import parse_qs

#temp setting for using local host to run for both server and client
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

#temp setting for using local host to run for both server and client
# Allow all origins (useful for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all domains to access the API
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

## both two should be stored in a secret key file
BACK_END_PORT = 8204
SECRET_KEY = "your_secret_key_here"

active_connections = {}  # Store WebSocket connections

## define message type
MSG_TYPE_ERROR = "error"



@app.get("/")
async def root():
    return {"message": "Hello World"}


def generate_token(accID: str, expiration: int): ## in seconds
    """Generate a JWT token with a time limit"""
    payload = {
        "accID": accID,
        "exp": time.time() + expiration  # Token expires in `expiration` seconds
    }
    
    ## use HMAC (Hash-based message authentication Code) + SHA256 algorithm
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

@app.post("/request-token")
async def request_token(data: dict):
    """Receive accID from frontend and generate a token + WebSocket subpath."""
    accID = data.get("accID")
    expTimeInSec = data.get("expTime")
    
    if not accID:
        return JSONResponse(status_code=400, content={"error": "Invalid Account"})

    token = generate_token(accID, expTimeInSec)
    return {"token": token}


async def postFrontEndMessage(websocket: WebSocket, msgType: str, message: str):
    await websocket.send_text(json.dumps({
        "type" : msgType,
        "message" : message
    }))

def isClientConnected():
    client = TestClient(app)
    return client.get("/").status_code == 200

# @app.websocket("/ws/{accID}/?token={token}")
# async def websocket_endpoint(websocket: WebSocket, accID: str, token: str):
@app.websocket("/ws/{accID}/")
async def websocket_endpoint(websocket: WebSocket, accID: str):

    """Validate token, then stream video frames over WebSocket."""
    print("1")

    ## Ack back to Frontend to accept the socket
    ## Need to accept the websocket before allowing to access the query
    await websocket.accept()

    print("2")

    token = websocket.query_params.get("token")
    # query_params = parse_qs(websocket.scope["query_string"].decode())
    # token = query_params.get("token", [None])[0]  # Extract token safely

    print(token)
    
    if not token:
        ## Log for Invalid Auth Attempt
        print("3")
        await postFrontEndMessage(websocket, MSG_TYPE_ERROR, "Invalid Authentication");
        await websocket.close(reason="Invalid Authentication")
        return
        
    try:

        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        accIDDecoded = payload["accID"]
        
        if accIDDecoded != accID:
            ## Log for Invalid Auth Attempt
            print(payload + ", " + accIDDecoded)
            postFrontEndMessage(websocket, MSG_TYPE_ERROR, "Invalid token");
            await websocket.close(reason="Invalid token")
            return
     
        ## Log to Database
        print(f"Connection accepted for accID: {accID} on {time.time()}")
        
        ## Optional
        active_connections[accID] = websocket

        # Start video capture
        video = "3.mp4"
        cap = cv2.VideoCapture(video)
        
        streaming_error_limit = 10
        streaming_error = 0

        #sampling_test_client = 20
        #test_client_count = 0

        #frame_num = 0

        while True:
            try:
                 # Check if WebSocket is still connected
                # if test_client_count >= sampling_test_client:
                #     if (not isClientConnected()):
                #         print("WebSocket disconnected")
                #         break  # Exit the loop
                #     else:
                #         test_client_count = 0
                # else:
                #     test_client_count += 1


                #print(f"client state - {websocket.client_state}")
                # Check if Frontend request to close the socket
                try:
                    request_msg = await asyncio.wait_for(websocket.receive_text(), timeout=0.01) # timeout unit in sec, 0.01 = 10 ms

                    match (request_msg):
                        case "CLOSE":
                            print("WebSocket Close Request by Frontend")
                            break
                        case _:
                            pass

                except asyncio.TimeoutError:
                    pass #Normal, no request came in
                except WebSocketDisconnect:
                    print("WebSocket Disconnected by Frontend")
                    break


                if websocket.client_state != WebSocketState.CONNECTED:
                    print(f"WebSocket connection closed for accID: {accID}")
                    break 

                # read the frame
                ok, frame = cap.read()
                
                if not ok:
                    streaming_error += 1
                    
                if streaming_error >= streaming_error_limit:
                    postFrontEndMessage(websocket, MSG_TYPE_ERROR, "Streaming Error");
                    await websocket.close(reason="Streaming Error")
                    break

                _, buffer = cv2.imencode('.jpg', frame)

                # print(f"{frame_num}    {streaming_error}")
                # frame_num += 1
                
                # Check token expiration
                #jwt.decode(token, SECRET_KEY, algorithms=["HS256"])  # would trig exception if expired
                
                await websocket.send_bytes(buffer.tobytes())

                #await asyncio.sleep(1/30)  # Approx. 30 FPS

            except WebSocketDisconnect:
                print("WebSocket disconnected during streaming")
                break  # Exit the loop when the WebSocket is disconnected
        
    except jwt.ExpiredSignatureError:
        print("Token expired, closing WebSocket.")
        await websocket.close(reason="Token expired")
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    finally:
        if cap.isOpened():
            cap.release()
        if accID in active_connections:
            del active_connections[accID]
            

if __name__ == "__main__":
    import uvicorn
    print("start running")
    #uvicorn.run("ParkingObjectDetectionSocket:app", host="0.0.0.0", port=8204, reload=True, log_level="debug") # can perform debug at the console
    uvicorn.run("ParkingObjectDetectionSocket:app", host="0.0.0.0", port=8204, reload=True)