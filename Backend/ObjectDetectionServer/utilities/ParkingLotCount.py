import json
from utilities.DefineAndResources import YOLO_model_dict, \
                                        DETECT_OBJ

class ParkingLotCounter:
    
    #Make the count become 0 and count again whenever something change 
    def __init__(self):
        self.occupied_count = 0
        self.empty_count = 0

    def clear_counter(self):
        self.occupied_count = 0
        self.empty_count = 0

    def add_occupied_count(self):
        self.occupied_count += 1

    def add_empty_count(self):
        self.empty_count += 1

    def process_results(self, results):
        """
        Takes YOLO detection results and counts occupied and empty parking slots.
        Returns a JSON object with the counts.
        """
        self.clear_counter()
        
        for result in results:
            class_ids = result.boxes.cls
            
            for class_id in class_ids:
                match(int(class_id)):
                    case DETECT_OBJ.OCCUPIED.value:
                        self.add_occupied_count()
                    case DETECT_OBJ.EMPTY.value:
                        self.add_empty_count()


        return self.return_json_str()
    
    def return_json_str(self):
        return json.dumps({
            "occupied": self.occupied_count,
            "empty": self.empty_count
        })
    
    def return_data(self):
        return {
            "occupied" : self.occupied_count,
            "empty": self.empty_count
        }



