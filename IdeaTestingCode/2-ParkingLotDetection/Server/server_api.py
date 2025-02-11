from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/location/{loc_id}")
async def get_location(loc_id):
    return {"loc_id": loc_id}