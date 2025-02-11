import json


class ParkingLotCounter:
    
    #Make the count become 0 and count again whenever something change 
    def __init__(self):
        self.occupied_count = 0
        self.empty_count = 0

    def process_results(self, results):
        """
        Takes YOLO detection results and counts occupied and empty parking slots.
        Returns a JSON object with the counts.
        """
        self.occupied_count = 0
        self.empty_count = 0
        OCCUPIED_ID = 0
        EMPTY_ID = 1
        
        for result in results:
            class_ids = result.boxes.cls
            
            for class_id in class_ids:
                if int(class_id) == OCCUPIED_ID:
                    self.occupied_count += 1
                elif int(class_id) == EMPTY_ID:
                    self.empty_count += 1

        return json.dumps({
            "occupied": self.occupied_count,
            "empty": self.empty_count
        })



