from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
app = FastAPI()

#temp
# Parking lot model
class ParkingLot(BaseModel):
    id: str
    name: str
    location: str
    empty : int
    occupied: int

# In-memory database
parking_lots = [
    ParkingLot(id="1", name="Downtown Lot", location="Downtown", empty=100, occupied=25),
    ParkingLot(id="2", name="Airport Parking", location="Near Airport", empty=200, occupied=50),
    ParkingLot(id="3", name="Mall Parking", location="Shopping Mall", empty=150, occupied=30),
    ParkingLot(id="4", name="Stadium Lot", location="Sports Arena", empty=300, occupied=0),
]

@app.get("/")
async def root():
    return {"hello":"world"}

@app.get("/lots", response_model=List[ParkingLot])
async def get_all_location():
    return parking_lots

#order matters, if int goes first it cant search by string
@app.get("/lots/search")
async def search_location(name: Optional[str] = Query(None, description="Filter by parking lot name")):
    results = [lot for lot in parking_lots if name.lower() in lot.name.lower()] if name else parking_lots
    if not results:
        raise HTTPException(status_code=404, detail="No parking lots found")
    return results

@app.get("/lots/{loc_id}")
async def get_location(loc_id:int):
    lot = next((l for l in parking_lots if l.id == loc_id), None)
    if not lot:
        raise HTTPException(status_code=404, detail="Parking lot not found")
    return lot

