from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class SeatTypeResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_bookable: bool
    color_hex: Optional[str] = None

class SeatingZoneBase(BaseModel):
    name: str
    color_hex: Optional[str] = '#cccccc'
    geometry_json: Optional[Dict[str, Any]] = None

class SeatingZoneCreate(SeatingZoneBase):
    id: Optional[Any] = None # Puede ser nulo o string temporal para nuevas

class SeatingZoneResponse(SeatingZoneBase):
    id: int
    room_id: int

class SeatingBlockBase(BaseModel):
    name: Optional[str] = None
    x_position: float
    y_position: float
    rotation: Optional[float] = 0.0
    config: Optional[Dict[str, Any]] = None

class SeatingBlockCreate(SeatingBlockBase):
    id: Optional[Any] = None

class SeatingBlockResponse(SeatingBlockBase):
    id: int
    room_id: int

class RoomSeatBase(BaseModel):
    block_id: Optional[Any] = None
    zone_id: Optional[Any] = None
    seat_type_id: int
    seat_label: str
    x_position: float
    y_position: float
    status: Optional[str] = 'active'

class RoomSeatCreate(RoomSeatBase):
    id: Optional[Any] = None

class RoomSeatResponse(RoomSeatBase):
    id: int
    room_id: int

class MapBuilderPayload(BaseModel):
    layout_mode: Optional[str] = 'map'
    layout_metadata: Optional[Dict[str, Any]] = None
    layout_json: Optional[Dict[str, Any]] = None
    zones: List[SeatingZoneCreate] = []
    blocks: List[SeatingBlockCreate] = []
    seats: List[RoomSeatCreate] = []

class VenueRoomCreate(BaseModel):
    name: str
    capacity: Optional[int] = 0
    has_map: Optional[bool] = True
    status: Optional[str] = 'active'

class VenueRoomUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    has_map: Optional[bool] = None
    status: Optional[str] = None

class VenueRoomResponse(BaseModel):
    id: int
    venue_id: int
    name: str
    capacity: int
    status: Optional[str] = 'active'
    layout_mode: Optional[str] = None
    layout_metadata: Optional[Dict[str, Any]] = None
    has_map: Optional[bool] = False

class VenueResponse(BaseModel):
    id: int
    name: str
    municipality_id: Optional[int] = None
    city: Optional[str] = None
    address: Optional[str] = None
    map_url: Optional[str] = None
    capacity: Optional[int] = None
    status: Optional[str] = None
    municipality_name: Optional[str] = None
    state_id: Optional[int] = None
    state_name: Optional[str] = None
    country_id: Optional[int] = None
    country_name: Optional[str] = None
    assigned_manager_id: Optional[int] = None

class VenueCreate(BaseModel):
    name: str
    city: Optional[str] = None
    address: str
    municipality_id: Optional[int] = None
    map_url: Optional[str] = None
    capacity: Optional[int] = None
    status: Optional[str] = 'active'
    assigned_manager_id: Optional[int] = None

class VenueUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    municipality_id: Optional[int] = None
    map_url: Optional[str] = None
    capacity: Optional[int] = None
    status: Optional[str] = None
    assigned_manager_id: Optional[int] = None
