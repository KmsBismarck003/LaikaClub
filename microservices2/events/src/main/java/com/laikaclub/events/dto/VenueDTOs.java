package com.laikaclub.events.dto;

import java.util.List;
import java.util.Map;

public class VenueDTOs {

    public static class SeatTypeResponse {
        public Long id;
        public String name;
        public String description;
        public Boolean is_bookable;
        public String color_hex;
    }

    public static class SeatingZoneCreate {
        public Object id; // Can be Integer or String (temp ID)
        public String name;
        public String color_hex;
        public Map<String, Object> geometry_json;
    }

    public static class SeatingBlockCreate {
        public Object id; // Can be Integer or String (temp ID)
        public String name;
        public Double x_position;
        public Double y_position;
        public Double rotation;
        public Map<String, Object> config;
    }

    public static class RoomSeatCreate {
        public Object id;
        public Object block_id; // Can be temp String or Integer ID
        public Object zone_id;  // Can be temp String or Integer ID
        public Long seat_type_id;
        public String seat_label;
        public Double x_position;
        public Double y_position;
        public String status;
    }

    public static class MapBuilderPayload {
        public String layout_mode = "map";
        public Map<String, Object> layout_metadata;
        public Map<String, Object> layout_json;
        public List<SeatingZoneCreate> zones;
        public List<SeatingBlockCreate> blocks;
        public List<RoomSeatCreate> seats;
    }

    public static class VenueRoomCreate {
        public String name;
        public Integer capacity = 0;
        public Boolean has_map = true;
        public String status = "active";
    }

    public static class VenueRoomUpdate {
        public String name;
        public Integer capacity;
        public Boolean has_map;
        public String status;
    }

    public static class VenueCreate {
        public String name;
        public String city;
        public String address;
        public Long municipality_id;
        public String map_url;
        public Integer capacity;
        public String status = "active";
        public Long assigned_manager_id;
        public Double latitude;
        public Double longitude;
        public Integer geofence_radius;
        public String timezone;
    }

    public static class VenueUpdate {
        public String name;
        public String city;
        public String address;
        public Long municipality_id;
        public String map_url;
        public Integer capacity;
        public String status;
        public Long assigned_manager_id;
        public Double latitude;
        public Double longitude;
        public Integer geofence_radius;
        public String timezone;
    }
}
