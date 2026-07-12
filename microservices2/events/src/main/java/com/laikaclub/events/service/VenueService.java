package com.laikaclub.events.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.laikaclub.events.domain.Venue;
import com.laikaclub.events.domain.VenueRoom;
import com.laikaclub.events.dto.VenueDTOs;
import com.laikaclub.events.repository.VenueRepository;
import com.laikaclub.events.repository.VenueRoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.*;

@Service
public class VenueService {

    private static final Logger logger = LoggerFactory.getLogger(VenueService.class);

    private final VenueRepository venueRepository;
    private final VenueRoomRepository venueRoomRepository;
    private final EventQueryService eventQueryService;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public VenueService(VenueRepository venueRepository,
                        VenueRoomRepository venueRoomRepository,
                        EventQueryService eventQueryService,
                        NamedParameterJdbcTemplate namedParameterJdbcTemplate,
                        JdbcTemplate jdbcTemplate,
                        ObjectMapper objectMapper) {
        this.venueRepository = venueRepository;
        this.venueRoomRepository = venueRoomRepository;
        this.eventQueryService = eventQueryService;
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public List<Map<String, Object>> getCountries() {
        try {
            return jdbcTemplate.queryForList("SELECT * FROM countries ORDER BY name ASC");
        } catch (Exception e) {
            logger.error("Error in getCountries: ", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al obtener países");
        }
    }

    public List<Map<String, Object>> getStates(Long countryId) {
        try {
            return jdbcTemplate.queryForList("SELECT * FROM states WHERE country_id = ? ORDER BY name ASC", countryId);
        } catch (Exception e) {
            logger.error("Error in getStates: ", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al obtener estados");
        }
    }

    public List<Map<String, Object>> getMunicipalities(Long stateId) {
        try {
            return jdbcTemplate.queryForList("SELECT * FROM municipalities WHERE state_id = ? ORDER BY name ASC", stateId);
        } catch (Exception e) {
            logger.error("Error in getMunicipalities: ", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al obtener municipios");
        }
    }

    public List<Map<String, Object>> getSeatTypes() {
        try {
            List<Map<String, Object>> list = jdbcTemplate.queryForList("SELECT * FROM seat_types ORDER BY id ASC");
            if (list.isEmpty()) {
                return getDefaultSeatTypes();
            }
            return list;
        } catch (Exception e) {
            logger.warn("Table seat_types not found or error. Returning default seat types: {}", e.getMessage());
            return getDefaultSeatTypes();
        }
    }

    private List<Map<String, Object>> getDefaultSeatTypes() {
        List<Map<String, Object>> defaults = new ArrayList<>();
        defaults.add(Map.of("id", 1L, "name", "General", "description", "Asiento general", "is_bookable", true, "color_hex", "#2196F3"));
        defaults.add(Map.of("id", 2L, "name", "VIP", "description", "Asiento VIP", "is_bookable", true, "color_hex", "#FFC107"));
        defaults.add(Map.of("id", 3L, "name", "Discapacitados", "description", "Acceso preferente", "is_bookable", true, "color_hex", "#4CAF50"));
        defaults.add(Map.of("id", 4L, "name", "Bloqueado", "description", "No disponible para venta", "is_bookable", false, "color_hex", "#F44336"));
        return defaults;
    }

    @Transactional
    public Map<String, Object> createVenue(VenueDTOs.VenueCreate dto) {
        Venue venue = new Venue();
        venue.setName(dto.name);
        venue.setCity(dto.city);
        venue.setAddress(dto.address);
        venue.setMunicipalityId(dto.municipality_id);
        venue.setMapUrl(dto.map_url);
        venue.setCapacity(dto.capacity);
        venue.setStatus(dto.status != null ? dto.status : "active");
        venue.setAssignedManagerId(dto.assigned_manager_id);

        Venue saved = venueRepository.save(venue);
        return Map.of("id", saved.getId(), "message", "Recinto creado exitosamente");
    }

    @Transactional
    public Map<String, Object> updateVenue(Long id, VenueDTOs.VenueUpdate dto) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recinto no encontrado"));

        if (dto.name != null) venue.setName(dto.name);
        if (dto.city != null) venue.setCity(dto.city);
        if (dto.address != null) venue.setAddress(dto.address);
        if (dto.municipality_id != null) venue.setMunicipalityId(dto.municipality_id);
        if (dto.map_url != null) venue.setMapUrl(dto.map_url);
        if (dto.capacity != null) venue.setCapacity(dto.capacity);
        if (dto.status != null) venue.setStatus(dto.status);
        if (dto.assigned_manager_id != null) venue.setAssignedManagerId(dto.assigned_manager_id);

        venueRepository.save(venue);
        return Map.of("success", true, "message", "Recinto actualizado");
    }

    @Transactional
    public Map<String, Object> deleteVenue(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recinto no encontrado"));

        venue.setStatus("deleted");
        venueRepository.save(venue);
        return Map.of("success", true, "message", "Recinto marcado como eliminado");
    }

    public List<Map<String, Object>> getVenueRooms(Long venueId) {
        try {
            List<VenueRoom> list = venueRoomRepository.findByVenueIdOrderByNameAsc(venueId);
            List<Map<String, Object>> rooms = new ArrayList<>();
            for (VenueRoom vr : list) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", vr.getId());
                map.put("venue_id", vr.getVenueId());
                map.put("name", vr.getName());
                map.put("capacity", vr.getCapacity());
                map.put("status", vr.getStatus());
                map.put("layout_mode", vr.getLayoutMode());
                
                String metaStr = vr.getLayoutMetadata();
                Map<String, Object> metaMap = new HashMap<>();
                if (metaStr != null && !metaStr.isEmpty()) {
                    try {
                        metaMap = objectMapper.readValue(metaStr, new TypeReference<Map<String, Object>>() {});
                    } catch (Exception e) {
                        logger.warn("Could not parse layout_metadata: {}", e.getMessage());
                    }
                }
                map.put("layout_metadata", metaMap);
                map.put("has_map", "map".equalsIgnoreCase(vr.getLayoutMode()) || "grid".equalsIgnoreCase(vr.getLayoutMode()));
                rooms.add(map);
            }
            return rooms;
        } catch (Exception e) {
            logger.error("Error in getVenueRooms: ", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al obtener salas del recinto");
        }
    }

    @Transactional
    public Map<String, Object> createVenueRoom(Long venueId, VenueDTOs.VenueRoomCreate dto) {
        VenueRoom vr = new VenueRoom();
        vr.setVenueId(venueId);
        vr.setName(dto.name);
        vr.setCapacity(dto.capacity);
        vr.setStatus(dto.status != null ? dto.status : "active");
        
        boolean hasMap = dto.has_map != null ? dto.has_map : true;
        vr.setLayoutMode(hasMap ? "map" : "general_admission");

        VenueRoom saved = venueRoomRepository.save(vr);
        return Map.of("id", saved.getId(), "message", "Sala creada exitosamente");
    }

    @Transactional
    public Map<String, Object> updateVenueRoom(Long venueId, Long roomId, VenueDTOs.VenueRoomUpdate dto) {
        VenueRoom vr = venueRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sala no encontrada"));

        if (!vr.getVenueId().equals(venueId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La sala no pertenece a este recinto");
        }

        if (dto.name != null) vr.setName(dto.name);
        if (dto.capacity != null) vr.setCapacity(dto.capacity);
        if (dto.status != null) vr.setStatus(dto.status);
        if (dto.has_map != null) {
            vr.setLayoutMode(dto.has_map ? "map" : "general_admission");
        }

        venueRoomRepository.save(vr);
        return Map.of("success", true, "message", "Sala actualizada exitosamente");
    }

    public Map<String, Object> getVenueRoomMap(Long roomId) {
        VenueRoom vr = venueRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sala no encontrada"));

        Map<String, Object> roomData = new HashMap<>();
        roomData.put("id", vr.getId());
        roomData.put("name", vr.getName());
        roomData.put("layout_mode", vr.getLayoutMode());

        String metaStr = vr.getLayoutMetadata();
        Map<String, Object> layoutMetadata = new HashMap<>();
        if (metaStr != null && !metaStr.isEmpty()) {
            try {
                layoutMetadata = objectMapper.readValue(metaStr, new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                logger.warn("Could not parse layout_metadata: {}", e.getMessage());
            }
        }
        roomData.put("layout_metadata", layoutMetadata);

        // Fetch Zones
        List<Map<String, Object>> zonesRaw = jdbcTemplate.queryForList("SELECT * FROM seating_zones WHERE room_id = ?", roomId);
        List<Map<String, Object>> zones = new ArrayList<>();
        for (Map<String, Object> z : zonesRaw) {
            Map<String, Object> zoneCopy = new HashMap<>();
            for (String key : z.keySet()) {
                zoneCopy.put(key.toLowerCase(), z.get(key));
            }
            
            String geomStr = (String) zoneCopy.get("geometry_json");
            Map<String, Object> geomMap = new HashMap<>();
            if (geomStr != null && !geomStr.isEmpty()) {
                try {
                    geomMap = objectMapper.readValue(geomStr, new TypeReference<Map<String, Object>>() {});
                } catch (Exception e) {
                    logger.warn("Could not parse geometry_json: {}", e.getMessage());
                }
            }
            zoneCopy.put("geometry_json", geomMap);
            zones.add(zoneCopy);
        }

        // Fetch Blocks
        List<Map<String, Object>> blocksRaw = jdbcTemplate.queryForList("SELECT * FROM seating_blocks WHERE room_id = ?", roomId);
        List<Map<String, Object>> blocks = new ArrayList<>();
        for (Map<String, Object> b : blocksRaw) {
            Map<String, Object> blockCopy = new HashMap<>();
            for (String key : b.keySet()) {
                blockCopy.put(key.toLowerCase(), b.get(key));
            }
            
            String confStr = (String) blockCopy.get("config");
            Map<String, Object> confMap = new HashMap<>();
            if (confStr != null && !confStr.isEmpty()) {
                try {
                    confMap = objectMapper.readValue(confStr, new TypeReference<Map<String, Object>>() {});
                } catch (Exception e) {
                    logger.warn("Could not parse block config: {}", e.getMessage());
                }
            }
            blockCopy.put("config", confMap);
            
            // Normalize x_position and y_position keys
            blockCopy.put("x_position", blockCopy.get("x_position") != null ? blockCopy.get("x_position") : blockCopy.get("x_position"));
            blockCopy.put("y_position", blockCopy.get("y_position") != null ? blockCopy.get("y_position") : blockCopy.get("y_position"));
            blocks.add(blockCopy);
        }

        // Fetch Seats
        List<Map<String, Object>> seatsRaw = jdbcTemplate.queryForList("SELECT * FROM room_seats WHERE room_id = ?", roomId);
        List<Map<String, Object>> seats = new ArrayList<>();
        for (Map<String, Object> s : seatsRaw) {
            Map<String, Object> seatCopy = new HashMap<>();
            for (String key : s.keySet()) {
                seatCopy.put(key.toLowerCase(), s.get(key));
            }
            // Normalize position keys
            seatCopy.put("x_position", seatCopy.get("x_position") != null ? seatCopy.get("x_position") : seatCopy.get("x_position"));
            seatCopy.put("y_position", seatCopy.get("y_position") != null ? seatCopy.get("y_position") : seatCopy.get("y_position"));
            seats.add(seatCopy);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("room", roomData);
        response.put("layout_json", layoutMetadata);
        response.put("zones", zones);
        response.put("blocks", blocks);
        response.put("seats", seats);
        return response;
    }

    @Transactional
    public Map<String, Object> saveVenueRoomMap(Long roomId, VenueDTOs.MapBuilderPayload payload) {
        VenueRoom vr = venueRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sala no encontrada"));

        int capacity = vr.getCapacity() != null ? vr.getCapacity() : 0;
        int payloadSeatsSize = payload.seats != null ? payload.seats.size() : 0;
        if (payloadSeatsSize > capacity) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Límite excedido. El mapa tiene " + payloadSeatsSize + " asientos pero la sala solo permite " + capacity + ".");
        }

        // 1. Update Room Metadata
        Map<String, Object> layoutMeta = payload.layout_json != null ? payload.layout_json : payload.layout_metadata;
        String layoutMetaJson = null;
        if (layoutMeta != null) {
            try {
                layoutMetaJson = objectMapper.writeValueAsString(layoutMeta);
            } catch (Exception e) {
                logger.error("Error serializing layout_metadata: ", e);
            }
        }

        jdbcTemplate.update("UPDATE venue_rooms SET layout_mode = ?, layout_metadata = ? WHERE id = ?",
                payload.layout_mode, layoutMetaJson, roomId);

        // Mappings for temp IDs to real IDs
        Map<Object, Long> zoneIdMap = new HashMap<>();
        Map<Object, Long> blockIdMap = new HashMap<>();

        List<Long> keepZoneIds = new ArrayList<>();
        List<Long> keepBlockIds = new ArrayList<>();
        List<Long> keepSeatIds = new ArrayList<>();

        // 2. Process Zones
        if (payload.zones != null) {
            for (VenueDTOs.SeatingZoneCreate zone : payload.zones) {
                String geometryJson = null;
                if (zone.geometry_json != null) {
                    try {
                        geometryJson = objectMapper.writeValueAsString(zone.geometry_json);
                    } catch (Exception e) {
                        logger.error("Error serializing geometry_json: ", e);
                    }
                }

                boolean isExisting = false;
                Long zoneId = null;
                if (zone.id instanceof Number) {
                    zoneId = ((Number) zone.id).longValue();
                    if (zoneId > 0) isExisting = true;
                }

                if (isExisting) {
                    jdbcTemplate.update("UPDATE seating_zones SET name = ?, color_hex = ?, geometry_json = ? WHERE id = ? AND room_id = ?",
                            zone.name, zone.color_hex, geometryJson, zoneId, roomId);
                    keepZoneIds.add(zoneId);
                    zoneIdMap.put(zone.id, zoneId);
                } else {
                    KeyHolder keyHolder = new GeneratedKeyHolder();
                    final String geom = geometryJson;
                    jdbcTemplate.update(connection -> {
                        PreparedStatement ps = connection.prepareStatement(
                                "INSERT INTO seating_zones (room_id, name, color_hex, geometry_json) VALUES (?, ?, ?, ?)",
                                Statement.RETURN_GENERATED_KEYS);
                        ps.setLong(1, roomId);
                        ps.setString(2, zone.name);
                        ps.setString(3, zone.color_hex);
                        ps.setString(4, geom);
                        return ps;
                    }, keyHolder);

                    Number key = keyHolder.getKey();
                    if (key != null) {
                        Long newId = key.longValue();
                        keepZoneIds.add(newId);
                        if (zone.id != null) {
                            zoneIdMap.put(zone.id, newId);
                        }
                    }
                }
            }
        }

        // 3. Process Blocks
        if (payload.blocks != null) {
            for (VenueDTOs.SeatingBlockCreate block : payload.blocks) {
                String configJson = null;
                if (block.config != null) {
                    try {
                        configJson = objectMapper.writeValueAsString(block.config);
                    } catch (Exception e) {
                        logger.error("Error serializing config_json: ", e);
                    }
                }

                boolean isExisting = false;
                Long blockId = null;
                if (block.id instanceof Number) {
                    blockId = ((Number) block.id).longValue();
                    if (blockId > 0) isExisting = true;
                }

                if (isExisting) {
                    jdbcTemplate.update("UPDATE seating_blocks SET name = ?, x_position = ?, y_position = ?, rotation = ?, config = ? WHERE id = ? AND room_id = ?",
                            block.name, block.x_position, block.y_position, block.rotation, configJson, blockId, roomId);
                    keepBlockIds.add(blockId);
                    blockIdMap.put(block.id, blockId);
                } else {
                    KeyHolder keyHolder = new GeneratedKeyHolder();
                    final String config = configJson;
                    jdbcTemplate.update(connection -> {
                        PreparedStatement ps = connection.prepareStatement(
                                "INSERT INTO seating_blocks (room_id, name, x_position, y_position, rotation, config) VALUES (?, ?, ?, ?, ?, ?)",
                                Statement.RETURN_GENERATED_KEYS);
                        ps.setLong(1, roomId);
                        ps.setString(2, block.name);
                        ps.setDouble(3, block.x_position);
                        ps.setDouble(4, block.y_position);
                        ps.setDouble(5, block.rotation != null ? block.rotation : 0.0);
                        ps.setString(6, config);
                        return ps;
                    }, keyHolder);

                    Number key = keyHolder.getKey();
                    if (key != null) {
                        Long newId = key.longValue();
                        keepBlockIds.add(newId);
                        if (block.id != null) {
                            blockIdMap.put(block.id, newId);
                        }
                    }
                }
            }
        }

        // 4. Process Seats
        if (payload.seats != null) {
            for (VenueDTOs.RoomSeatCreate seat : payload.seats) {
                // Resolve Block ID
                Long realBlockId = null;
                if (seat.block_id != null) {
                    if (blockIdMap.containsKey(seat.block_id)) {
                        realBlockId = blockIdMap.get(seat.block_id);
                    } else if (seat.block_id instanceof Number) {
                        realBlockId = ((Number) seat.block_id).longValue();
                    }
                }

                // Resolve Zone ID
                Long realZoneId = null;
                if (seat.zone_id != null) {
                    if (zoneIdMap.containsKey(seat.zone_id)) {
                        realZoneId = zoneIdMap.get(seat.zone_id);
                    } else if (seat.zone_id instanceof Number) {
                        realZoneId = ((Number) seat.zone_id).longValue();
                    }
                }

                boolean isExisting = false;
                Long seatId = null;
                if (seat.id instanceof Number) {
                    seatId = ((Number) seat.id).longValue();
                    if (seatId > 0) isExisting = true;
                }

                if (isExisting) {
                    jdbcTemplate.update("UPDATE room_seats SET block_id = ?, zone_id = ?, seat_type_id = ?, seat_label = ?, x_position = ?, y_position = ?, status = ? WHERE id = ? AND room_id = ?",
                            realBlockId, realZoneId, seat.seat_type_id, seat.seat_label, seat.x_position, seat.y_position, seat.status, seatId, roomId);
                    keepSeatIds.add(seatId);
                } else {
                    KeyHolder keyHolder = new GeneratedKeyHolder();
                    final Long finalBlock = realBlockId;
                    final Long finalZone = realZoneId;
                    jdbcTemplate.update(connection -> {
                        PreparedStatement ps = connection.prepareStatement(
                                "INSERT INTO room_seats (room_id, block_id, zone_id, seat_type_id, seat_label, x_position, y_position, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                                Statement.RETURN_GENERATED_KEYS);
                        ps.setLong(1, roomId);
                        if (finalBlock != null) ps.setLong(2, finalBlock); else ps.setNull(2, java.sql.Types.INTEGER);
                        if (finalZone != null) ps.setLong(3, finalZone); else ps.setNull(3, java.sql.Types.INTEGER);
                        ps.setLong(4, seat.seat_type_id);
                        ps.setString(5, seat.seat_label);
                        ps.setDouble(6, seat.x_position);
                        ps.setDouble(7, seat.y_position);
                        ps.setString(8, seat.status != null ? seat.status : "active");
                        return ps;
                    }, keyHolder);

                    Number key = keyHolder.getKey();
                    if (key != null) {
                        keepSeatIds.add(key.longValue());
                    }
                }
            }
        }

        // 5. Cleanup removed items
        // Seats
        if (!keepSeatIds.isEmpty()) {
            MapSqlParameterSource params = new MapSqlParameterSource()
                    .addValue("roomId", roomId)
                    .addValue("ids", keepSeatIds);
            namedParameterJdbcTemplate.update("DELETE FROM room_seats WHERE room_id = :roomId AND id NOT IN (:ids)", params);
        } else {
            jdbcTemplate.update("DELETE FROM room_seats WHERE room_id = ?", roomId);
        }

        // Blocks
        if (!keepBlockIds.isEmpty()) {
            MapSqlParameterSource params = new MapSqlParameterSource()
                    .addValue("roomId", roomId)
                    .addValue("ids", keepBlockIds);
            namedParameterJdbcTemplate.update("DELETE FROM seating_blocks WHERE room_id = :roomId AND id NOT IN (:ids)", params);
        } else {
            jdbcTemplate.update("DELETE FROM seating_blocks WHERE room_id = ?", roomId);
        }

        // Zones
        if (!keepZoneIds.isEmpty()) {
            MapSqlParameterSource params = new MapSqlParameterSource()
                    .addValue("roomId", roomId)
                    .addValue("ids", keepZoneIds);
            namedParameterJdbcTemplate.update("DELETE FROM seating_zones WHERE room_id = :roomId AND id NOT IN (:ids)", params);
        } else {
            jdbcTemplate.update("DELETE FROM seating_zones WHERE room_id = ?", roomId);
        }

        return Map.of("success", true, "message", "Mapa guardado exitosamente");
    }
}
