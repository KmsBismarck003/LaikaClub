from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
from .database import get_db
from .security import get_current_user
from . import controller
from . import venues_controller
from . import venues_schemas
app = FastAPI(title="Laika Event Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "alive", "service": "event-service"}

@app.get("/public")
def list_events(
    category: Optional[str] = None, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    return controller.get_public_events(db, category, limit)

@app.get("/all")
def list_all_events(
    limit: int = 100,
    db: Session = Depends(get_db)
):
    # En un microservicio real, esto requeriría rol admin
    return controller.get_all_events(db, limit=limit)

@app.get("/my-events")
@app.get("/manager/events")
def list_my_events(
    limit: int = 100,
    db: Session = Depends(get_db),
    # current_user: dict = Depends(get_current_user)
):
    # Por ahora usamos user_id=1 para simplificar, en producción usar current_user['id']
    return controller.get_user_events(db, user_id=1, limit=limit)

# --- VENUES & MAP BUILDER ROUTES ---

@app.get("/venues/seat-types", response_model=list[venues_schemas.SeatTypeResponse])
def get_seat_types(db: Session = Depends(get_db)):
    return venues_controller.get_seat_types(db)

@app.get("/venues/locations/countries")
def get_countries(db: Session = Depends(get_db)):
    return venues_controller.get_countries(db)

@app.get("/venues/locations/states/{country_id}")
def get_states(country_id: int, db: Session = Depends(get_db)):
    return venues_controller.get_states(db, country_id)

@app.get("/venues/locations/municipalities/{state_id}")
def get_municipalities(state_id: int, db: Session = Depends(get_db)):
    return venues_controller.get_municipalities(db, state_id)

@app.get("/venues")
def get_venues(
    status_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return venues_controller.get_venues(db, status_filter)

@app.post("/venues")
def create_venue(
    venue_data: venues_schemas.VenueCreate,
    db: Session = Depends(get_db)
):
    return venues_controller.create_venue(db, venue_data)

@app.put("/venues/{venue_id}")
def update_venue(
    venue_id: int,
    venue_data: venues_schemas.VenueUpdate,
    db: Session = Depends(get_db)
):
    return venues_controller.update_venue(db, venue_id, venue_data)

@app.delete("/venues/{venue_id}")
def delete_venue(
    venue_id: int,
    db: Session = Depends(get_db)
):
    return venues_controller.delete_venue(db, venue_id)


@app.get("/venues/{venue_id}/rooms")
def get_venue_rooms(venue_id: int, db: Session = Depends(get_db)):
    return venues_controller.get_venue_rooms(db, venue_id)

@app.post("/venues/{venue_id}/rooms")
def create_venue_room(
    venue_id: int,
    room_data: venues_schemas.VenueRoomCreate,
    db: Session = Depends(get_db)
):
    return venues_controller.create_venue_room(db, venue_id, room_data)

@app.put("/venues/{venue_id}/rooms/{room_id}")
def update_venue_room(
    venue_id: int,
    room_id: int,
    room_data: venues_schemas.VenueRoomUpdate,
    db: Session = Depends(get_db)
):
    return venues_controller.update_venue_room(db, venue_id, room_id, room_data)

@app.get("/venues/rooms/{room_id}/map")
def get_venue_room_map(room_id: int, db: Session = Depends(get_db)):
    return venues_controller.get_venue_room_map(db, room_id)

@app.post("/venues/rooms/{room_id}/map")
def save_venue_room_map(
    room_id: int, 
    payload: venues_schemas.MapBuilderPayload, 
    db: Session = Depends(get_db)
):
    return venues_controller.save_venue_room_map(db, room_id, payload)

from . import schemas

@app.get("/{event_id}")
@app.get("/manager/events/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db)):
    return controller.get_event_by_id(db, event_id)

@app.post("/")
def create_event(
    event_data: schemas.EventCreate, 
    db: Session = Depends(get_db),
    # user_id: int = Depends(get_current_user) # Comentado para simplificar la creación por ahora
):
    return controller.create_event(db, event_data, user_id=1) 

@app.put("/{event_id}")
def update_event(
    event_id: int,
    event_data: schemas.EventUpdate,
    db: Session = Depends(get_db)
):
    return controller.update_event(db, event_id, event_data)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
