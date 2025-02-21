from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import asyncio
import json
import jwt
import time
import cv2
from fastapi.testclient import TestClient
from fastapi.responses import JSONResponse
from fastapi.websockets import WebSocketState

from utilities.ParkingObjDetection import ParkingObjectDetection

from utilities.DefineAndResources import dictLocationIDToStream, \
                                MSG_TYPE_ERROR, SECRET_KEY, ACC_ID_KEY, \
                                STREAM_ERROR_LIMIT, \
                                SAMPLING_FRAME_TEST_CONNECTION,\
                                YOLO_MODEL_KEY

#temp setting for using local host to run for both server and client
from fastapi.middleware.cors import CORSMiddleware


# One uvicorn thread instance to run the fastapi app under the same ip and port
# can listen to and create multiple independent websocket from different frontend
class ParkingObjDetection:

    def __init__(self):

        self.app = FastAPI()
        self.detect = ParkingObjectDetection(yolo_model=YOLO_MODEL_KEY.V11_l_18JAN)

        #temp setting for using local host to run for both server and client
        # Allow all origins (useful for development)
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],  # Allows all domains to access the API
            allow_credentials=True,
            allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
            allow_headers=["*"],  # Allows all headers
        )

        # Store Multiple WebSocket connections
        self.active_connections = {}

        # Register Routes
        self.app.get("/")(self.root)
        self.app.post("/request-token")(self.request_token)
        self.app.websocket("/ws/{accID}/{locationID}/")(self.websocket_endpoint)

    def is_client_connected(self):
        client = TestClient(self.app)
        return client.get("/").status_code == 200
    
    def generate_token(self, accID: str, expiration: int): ## in seconds
        """Generate a JWT token with a time limit"""
        payload = {
            "accID": accID,
            "exp": time.time() + expiration  # the "exp" key is specific for the jwt to add Token expires in seconds
        }
        
        ## use HMAC (Hash-based message authentication Code) + SHA256 algorithm
        return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    
    async def root(self):
        return {"message": "Server Running. . ."}

    async def post_frontend_message(self, websocket: WebSocket, msgType: str, message: str):
        await websocket.send_text(json.dumps({
            "type" : msgType,
            "message" : message
        }))

    async def request_token(self, data: dict):

        """Receive accID from frontend and generate a token + WebSocket subpath."""
        accID = data.get("accID")
        expTimeInSec = data.get("expTime")
        
        if not accID:
            return JSONResponse(status_code=400, content={"error": "Invalid Account"})

        token = self.generate_token(accID, expTimeInSec)
        return {"token": token}

    async def websocket_endpoint(self, websocket: WebSocket, accID: str, locationID: str):

        """Validate token, then stream video frames over WebSocket."""
        print(f"{accID} - 1")

        ## Ack back to Frontend to accept the socket
        ## Need to accept the websocket before allowing to access the query
        await websocket.accept()

        print(f"{accID} - 2")

        token = websocket.query_params.get("token")

        print(f"{accID} - {token}")
        
        if not token:
            ## Log for Invalid Auth Attempt
            print(f"{accID} - 3")
            await self.post_frontend_message(websocket, MSG_TYPE_ERROR, "Invalid Authentication");
            await websocket.close(reason="Invalid Authentication")
            return
            
        try:

            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            accIDDecoded = payload[ACC_ID_KEY] # "accID"
            
            if accIDDecoded != accID:
                ## Log for Invalid Auth Attempt
                print(f"{payload},  {accIDDecoded}")
                self.post_frontend_message(websocket, MSG_TYPE_ERROR, "Invalid token");
                await websocket.close(reason="Invalid token")
                return
            
            if locationID not in dictLocationIDToStream:
                print(f"Invalid Location ID : {accIDDecoded}")
                self.post_frontend_message(websocket, MSG_TYPE_ERROR, "Invalid Location");
                await websocket.close(reason="Invalid Location")
                return
        
            ## here should Log to Database
            self.active_connections[(accID, locationID)] = websocket
            print(f"Connection accepted for accID: {accID} on {time.time()}")
            

            # Start video capture
            video = dictLocationIDToStream[locationID]
            print(f"{accID} - {video}")

            cap = cv2.VideoCapture(video)
            
            streaming_error = 0

            #test_client_count = 0

            while True:
                try:
                    # Check if WebSocket is still connected
                    # if test_client_count >= SAMPLING_FRAME_TEST_CONNECTION:
                    #     if (not is_client_connected()):
                    #         print(f"{accID} - WebSocket disconnected")
                    #         break  # Exit the loop
                    #     else:
                    #         test_client_count = 0
                    # else:
                    #     test_client_count += 1

                    #print(f"{accID} - client state - {websocket.client_state}")

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
                        
                    if streaming_error >= STREAM_ERROR_LIMIT:
                        self.post_frontend_message(websocket, MSG_TYPE_ERROR, "Streaming Error");
                        await websocket.close(reason="Streaming Error")
                        break

                    
                    #Apply Model Detection
                    frame = self.detect.process(frame)

                    _, buffer = cv2.imencode('.jpg', frame)
                  
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
            if (accID, locationID) in self.active_connections:
                del self.active_connections[(accID, locationID)]
                self.active_connections.pop((accID, locationID), None)

