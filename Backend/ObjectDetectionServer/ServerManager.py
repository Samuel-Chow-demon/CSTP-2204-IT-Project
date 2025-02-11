
import threading
import uvicorn
import time

from ParkingObjectDetectionServer import ParkingObjDetection

from DefineAndResources import BACK_END_PORT, BACK_END_IP

class ServerManager:
    def __init__(self, host: str, port: int):
        self.host = host
        self.port = port
        self.server_thread = None
        self.should_stop = threading.Event()

    def run_server(self):

        """Runs the FastAPI app in a thread."""
        app_instance = ParkingObjDetection().app
        config = uvicorn.Config(app_instance, host=self.host, port=self.port, log_level="info")
        server = uvicorn.Server(config)

        try:
            server.run()
        except Exception as e:
            print(f"Server Error : {e}")

    def start(self):

        """Start the server in a new thread."""
        if self.server_thread and \
            self.server_thread.is_alive():
            print("Server is already running!")
            return

        print("Starting WebSocket Server...")
        self.server_thread = threading.Thread(target=self.run_server, daemon=True)
        self.server_thread.start()
        time.sleep(2)  # Allow time for the thread to initialize

    def stop(self):
        """Stop the WebSocket server."""
        if self.server_thread and self.server_thread.is_alive():
            print("Stopping WebSocket server...")
            #Trigger to stop
            self.should_stop.set()

            #Wait uvicorn close to close the thread
            #self.server_thread.join() # force terminate without wait

            print("WebSocket server stopped.")


if __name__ == "__main__":
    server = ServerManager(host = BACK_END_IP, port = BACK_END_PORT)
    server.start()

    try:
        while True:
            time.sleep(1)  # Keep the main thread alive
    except KeyboardInterrupt:
        server.stop()
