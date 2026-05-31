import os, shutil, uuid
from pathlib import Path
from fastapi import FastAPI, Depends, Query, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from .database import get_db
from .security import get_current_user
from . import controller
from . import venues_controller
from . import venues_schemas
from . import presale as presale_service

app = FastAPI(title="Laika Event Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
EVENTS_UPLOAD_DIR = UPLOAD_DIR / "events"
EVENTS_UPLOAD_DIR.mkdir(exist_ok=True)

# Servir archivos estáticos
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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
    country_id: Optional[int] = Query(None),
    state_id: Optional[int] = Query(None),
    municipality_id: Optional[int] = Query(None),
    venue_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    return controller.get_all_events(
        db, limit=limit, country_id=country_id, 
        state_id=state_id, municipality_id=municipality_id, 
        venue_id=venue_id
    )

@app.get("/my-events")
@app.get("/manager/events")
def list_my_events(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return controller.get_user_events(db, user_id=current_user['id'], limit=limit)


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
    country_id: Optional[int] = Query(None),
    state_id: Optional[int] = Query(None),
    municipality_id: Optional[int] = Query(None),
    manager_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    return venues_controller.get_venues(
        db, status_filter, country_id, 
        state_id, municipality_id, manager_id
    )

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

@app.patch("/manager/events/{event_id}/publish")
@app.patch("/{event_id}/publish")
def publish_event(event_id: int, db: Session = Depends(get_db)):
    return controller.publish_event(db, event_id)

@app.patch("/manager/events/{event_id}/unpublish")
@app.patch("/{event_id}/unpublish")
def unpublish_event(event_id: int, db: Session = Depends(get_db)):
    return controller.unpublish_event(db, event_id)

@app.get("/manager/events/{event_id}/tickets")
def get_event_tickets(event_id: int, db: Session = Depends(get_db)):
    return controller.get_event_tickets_analytics(db, event_id)

@app.get("/manager/events/{event_id}/revenue")
def get_event_revenue(event_id: int, db: Session = Depends(get_db)):
    return controller.get_event_revenue_analytics(db, event_id)

# --- PRESALE ROUTES ---

@app.get("/presale/{event_id}/info")
def get_presale_info(event_id: int, db: Session = Depends(get_db)):
    """Devuelve el estado de preventa de un evento (sin exponer datos sensibles)."""
    event = controller.get_event_by_id(db, event_id)
    return presale_service.get_presale_info(event)


class BinValidationRequest(BaseModel):
    card_number: str  # Solo los primeros 6+ dígitos; no se almacena

@app.post("/presale/{event_id}/validate-bin")
def validate_presale_bin(event_id: int, body: BinValidationRequest, db: Session = Depends(get_db)):
    """Valida si el BIN de una tarjeta tiene acceso a la preventa del evento."""
    event = controller.get_event_by_id(db, event_id)

    if not presale_service.is_presale_active(event):
        # Si la preventa no está activa, permitir acceso libre
        return {"valid": True, "message": "Venta general activa"}

    is_valid = presale_service.validate_bin(body.card_number, event.get("presale_bins"))
    bank_name = event.get("presale_bank_name") or "el banco patrocinador"

    if is_valid:
        return {"valid": True, "message": f"Tarjeta {bank_name} válida para preventa"}

    return {
        "valid": False,
        "message": f"Esta tarjeta no corresponde a la preventa exclusiva de {bank_name}."
    }


@app.get("/{event_id}")
@app.get("/manager/events/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db)):
    return controller.get_event_by_id(db, event_id)

@app.post("/")
@app.post("/manager/events")
def create_event(
    event_data: schemas.EventCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return controller.create_event(db, event_data, user_id=current_user['id']) 

@app.put("/{event_id}")
def update_event(
    event_id: int,
    event_data: schemas.EventUpdate,
    db: Session = Depends(get_db)
):
    return controller.update_event(db, event_id, event_data)




@app.post("/manager/events/upload-image")
async def upload_event_image(file: UploadFile = File(...)):
    """Sube una imagen para eventos y retorna su URL"""
    try:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
            raise HTTPException(400, "Formato de imagen no permitido")
            
        contents = await file.read()
        
        if ext == ".gif":
            filename = f"{uuid.uuid4().hex}{ext}"
            filepath = EVENTS_UPLOAD_DIR / filename
            with open(filepath, "wb") as buffer:
                buffer.write(contents)
        else:
            from microservices.common.image_utils import save_image_as_webp
            filename = save_image_as_webp(
                file_contents=contents,
                destination_dir=EVENTS_UPLOAD_DIR
            )
            
        # IMPORTANTE: El gateway mapea /api/events -> /
        # Pero aquí queremos retornar la URL que el frontend pueda cargar
        # Como el gateway sirve /api/events/uploads, la URL debería ser esa
        return {"url": f"/api/events/uploads/events/{filename}", "message": "Imagen subida correctamente"}
    except Exception as e:
        raise HTTPException(500, f"Error al subir imagen: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
