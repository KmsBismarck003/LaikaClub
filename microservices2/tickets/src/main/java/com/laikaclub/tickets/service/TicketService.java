package com.laikaclub.tickets.service;

import com.laikaclub.tickets.domain.Payment;
import com.laikaclub.tickets.domain.Ticket;
import com.laikaclub.tickets.dto.TicketItem;
import com.laikaclub.tickets.repository.PaymentRepository;
import com.laikaclub.tickets.repository.TicketRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.FileWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class TicketService {

    private static final Logger logger = LoggerFactory.getLogger(TicketService.class);

    private final TicketRepository ticketRepository;
    private final PaymentRepository paymentRepository;
    private final MongoSyncService mongoSyncService;
    private final RestTemplate restTemplate;

    @Value("${services.events.url}")
    private String eventServiceUrl;

    @Autowired
    public TicketService(TicketRepository ticketRepository,
                         PaymentRepository paymentRepository,
                         MongoSyncService mongoSyncService) {
        this.ticketRepository = ticketRepository;
        this.paymentRepository = paymentRepository;
        this.mongoSyncService = mongoSyncService;
        this.restTemplate = new RestTemplate();
    }

    public List<Map<String, Object>> getUserTickets(Long userId) {
        try {
            List<Ticket> tickets = ticketRepository.findByUserIdOrderByPurchaseDateDesc(userId);
            List<Map<String, Object>> result = new ArrayList<>();

            for (Ticket tkt : tickets) {
                Map<String, Object> tktMap = serializeTicket(tkt);
                populateEventDetails(tktMap, tkt.getEventId(), tkt.getEventFunctionId());
                result.add(tktMap);
            }

            return result;
        } catch (Exception e) {
            logger.error("Error en getUserTickets: ", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error en Ticket Service");
        }
    }

    public List<String> getBusySeats(Long eventId, Long functionId) {
        List<String> statuses = List.of("active", "used");
        if (functionId != null) {
            return ticketRepository.findSeatIdsByEventIdAndEventFunctionIdAndStatusIn(eventId, functionId, statuses);
        } else {
            return ticketRepository.findSeatIdsByEventIdAndStatusIn(eventId, statuses);
        }
    }

    @Transactional
    public List<Map<String, Object>> purchaseTickets(Long userId, List<TicketItem> items, String paymentMethod) {
        try {
            List<Map<String, Object>> purchased = new ArrayList<>();
            LocalDateTime now = LocalDateTime.now();
            Map<Long, Map<?, ?>> eventCache = new HashMap<>();

            for (TicketItem item : items) {
                Long eid = item.getEventId();
                Long fid = item.getFunctionId();
                
                // Validación de expiración
                if (!eventCache.containsKey(eid)) {
                    try {
                        Map<?, ?> ev = restTemplate.getForObject(eventServiceUrl + "/" + eid, Map.class);
                        if (ev == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado");
                        eventCache.put(eid, ev);
                    } catch (Exception e) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se pudo validar el evento. Puede que haya concluido o ya no esté disponible.");
                    }
                }
                
                Map<?, ?> ev = eventCache.get(eid);
                List<Map<String, Object>> functions = (List<Map<String, Object>>) ev.get("functions");
                
                if (functions != null && !functions.isEmpty()) {
                    if (fid == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe especificar una función para el evento");
                    }
                    boolean isValidFunction = functions.stream().anyMatch(f -> {
                        Number fIdNum = (Number) f.get("id");
                        return fIdNum != null && fIdNum.longValue() == fid.longValue();
                    });
                    if (!isValidFunction) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La función seleccionada ya ha concluido o no está disponible para compra");
                    }
                }

                String seat = item.getSeatId();
                String section = item.getSectionName();
                Double price = item.getPrice() != null ? item.getPrice() : 0.0;

                String uniqueCode = "TKT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();

                Ticket ticket = new Ticket();
                ticket.setUserId(userId);
                ticket.setEventId(eid);
                ticket.setTicketCode(uniqueCode);
                ticket.setQrData(uniqueCode);
                ticket.setStatus("active");
                ticket.setPurchaseDate(now);
                ticket.setSeatId(seat);
                ticket.setSectionName(section);
                ticket.setPrice(price);
                ticket.setPaymentMethod(paymentMethod);
                ticket.setEventFunctionId(fid);

                ticketRepository.save(ticket);

                // Sincronización a MongoDB (fire-and-forget)
                Map<String, Object> syncData = new HashMap<>();
                syncData.put("user_id", userId);
                syncData.put("event_id", eid);
                syncData.put("ticket_code", uniqueCode);
                syncData.put("price", price);
                syncData.put("seat_id", seat);
                syncData.put("section", section);
                syncData.put("payment_method", paymentMethod);
                syncData.put("purchase_date", now.format(DateTimeFormatter.ISO_DATE_TIME));
                syncData.put("type", "ticket_purchase");

                mongoSyncService.syncPurchaseToMongo(syncData);

                Map<String, Object> respItem = new HashMap<>();
                respItem.put("code", uniqueCode);
                respItem.put("seat", seat);
                purchased.add(respItem);
            }

            return purchased;
        } catch (Exception e) {
            logger.error("Error en compra de boletos: ", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error en procesamiento de compra");
        }
    }

    @Transactional
    public Map<String, Object> createPaymentIntent(Long userId, Double amount, Long eventId, String method) {
        try {
            // Check if the event is valid (if it has functions, we would ideally need the functionId here, 
            // but createPaymentIntent is often called at checkout. Let's at least check the event exists and is valid)
            if (eventId != null) {
                try {
                    Map<?, ?> ev = restTemplate.getForObject(eventServiceUrl + "/" + eventId, Map.class);
                    if (ev == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado");
                } catch (Exception e) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El evento seleccionado ya ha concluido o no está disponible.");
                }
            }

            String ref = "PAY-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();

            Payment payment = new Payment();
            payment.setUserId(userId);
            payment.setEventId(eventId);
            payment.setAmount(amount);
            payment.setPaymentMethod(method != null ? method : "card");
            payment.setStatus("pending");
            payment.setReference(ref);
            payment.setCreatedAt(LocalDateTime.now());

            paymentRepository.save(payment);

            Map<String, Object> response = new HashMap<>();
            response.put("payment_id", ref);
            response.put("status", "pending");
            response.put("amount", amount);
            return response;
        } catch (Exception e) {
            logger.error("Error al crear intent de pago: ", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error creando pago: " + e.getMessage());
        }
    }

    @Transactional
    public Map<String, Object> confirmPayment(String reference) {
        try {
            Payment payment = paymentRepository.findByReference(reference)
                    .orElse(null);

            if (payment != null) {
                payment.setStatus("completed");
                paymentRepository.save(payment);

                // Sincronización a MongoDB (fire-and-forget)
                Map<String, Object> syncData = new HashMap<>();
                syncData.put("user_id", payment.getUserId());
                syncData.put("event_id", payment.getEventId());
                syncData.put("amount", payment.getAmount());
                syncData.put("payment_method", payment.getPaymentMethod());
                syncData.put("reference", reference);
                syncData.put("status", "completed");
                syncData.put("confirmed_at", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
                syncData.put("type", "payment_confirmation");

                mongoSyncService.syncPurchaseToMongo(syncData);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Pago confirmado");
            return response;
        } catch (Exception e) {
            logger.error("Error al confirmar pago: ", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al confirmar pago");
        }
    }

    @Transactional
    public Map<String, Object> processRefund(Long userId, Long ticketId) {
        Ticket ticket = ticketRepository.findByIdAndUserId(ticketId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boleto no encontrado"));

        if ("refunded".equals(ticket.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El boleto ya fue reembolsado");
        }

        try {
            ticket.setStatus("refunded");
            ticketRepository.save(ticket);

            Payment refundPayment = new Payment();
            refundPayment.setUserId(userId);
            refundPayment.setAmount(-ticket.getPrice());
            refundPayment.setStatus("refunded");
            refundPayment.setReference("REF-" + ticket.getTicketCode());
            refundPayment.setCreatedAt(LocalDateTime.now());

            paymentRepository.save(refundPayment);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Reembolso procesado y asiento liberado");
            return response;
        } catch (Exception e) {
            logger.error("Error en proceso de reembolso: ", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error en reembolso: " + e.getMessage());
        }
    }

    public List<Map<String, Object>> getUserRefunds(Long userId) {
        try {
            List<Ticket> tickets = ticketRepository.findByUserIdAndStatusOrderByPurchaseDateDesc(userId, "refunded");
            List<Map<String, Object>> refunds = new ArrayList<>();

            for (Ticket tkt : tickets) {
                Map<String, Object> tktMap = serializeTicket(tkt);
                
                // Get event info from event service
                String eventName = "Evento desconocido";
                String eventDate = null;
                String imageUrl = null;
                try {
                    Map<String, Object> evData = restTemplate.getForObject(eventServiceUrl + "/" + tkt.getEventId(), Map.class);
                    if (evData != null) {
                        eventName = (String) evData.getOrDefault("name", "Evento desconocido");
                        eventDate = (String) evData.get("event_date");
                        imageUrl = (String) evData.get("image_url");
                    }
                } catch (Exception e) {
                    eventName = "Error de conexión";
                }

                Map<String, Object> refund = new HashMap<>();
                refund.put("id", tkt.getId());
                refund.put("status", "approved");
                refund.put("amount", tkt.getPrice());
                refund.put("reason", "Reembolso procesado");
                refund.put("detail", "Asiento: " + (tkt.getSeatId() != null ? tkt.getSeatId() : "N/A") + 
                                      ", Sección: " + (tkt.getSectionName() != null ? tkt.getSectionName() : "N/A"));
                refund.put("created_at", tkt.getPurchaseDate() != null ? tkt.getPurchaseDate().format(DateTimeFormatter.ISO_DATE_TIME) : null);

                Map<String, Object> tktInfo = new HashMap<>();
                tktInfo.put("id", tkt.getId());
                tktInfo.put("ticket_code", tkt.getTicketCode());
                tktInfo.put("price", tkt.getPrice());
                tktInfo.put("seat_id", tkt.getSeatId());
                tktInfo.put("section_name", tkt.getSectionName());
                tktInfo.put("event_id", tkt.getEventId());
                tktInfo.put("eventName", eventName);
                tktInfo.put("imageUrl", imageUrl);

                refund.put("ticket", tktInfo);
                refunds.add(refund);
            }

            return refunds;
        } catch (Exception e) {
            logger.error("Error en getUserRefunds: ", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error en recuperar reembolsos");
        }
    }

    public Ticket verifyTicket(String code) {
        return ticketRepository.findByTicketCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boleto no encontrado"));
    }

    @Transactional
    public Map<String, Object> redeemTicket(String code) {
        Ticket ticket = verifyTicket(code);
        if (!"active".equals(ticket.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Boleto no válido (" + ticket.getStatus() + ")");
        }

        try {
            ticket.setStatus("used");
            ticket.setRedeemedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            ticketRepository.save(ticket);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Boleto canjeado");
            return response;
        } catch (Exception e) {
            logger.error("Error al canjear boleto: ", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @Transactional
    public Map<String, Object> assignLuckySeat(Long userId, Long eventId) {
        String logPath = "c:\\Users\\Pc\\Music\\proyectolaika2.9.9.10\\lucky_debug.txt";
        writeLuckyDebugLog(logPath, "[" + LocalDateTime.now() + "] assign_lucky_seat STARTED\n");

        try {
            writeLuckyDebugLog(logPath, "[" + LocalDateTime.now() + "] Fetching event " + eventId + "\n");
            Map<String, Object> eventData;
            try {
                eventData = restTemplate.getForObject(eventServiceUrl + "/" + eventId, Map.class);
            } catch (Exception e) {
                writeLuckyDebugLog(logPath, "[" + LocalDateTime.now() + "] Event not found 404\n");
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado");
            }

            if (eventData == null) {
                writeLuckyDebugLog(logPath, "[" + LocalDateTime.now() + "] Event not found 404\n");
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado");
            }

            List<Map<String, Object>> sections = (List<Map<String, Object>>) eventData.get("sections");
            writeLuckyDebugLog(logPath, "[" + LocalDateTime.now() + "] Sections found: " + (sections != null ? sections.size() : 0) + "\n");

            if (sections == null || sections.isEmpty()) {
                writeLuckyDebugLog(logPath, "[" + LocalDateTime.now() + "] Error: Sin secciones\n");
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sin secciones");
            }

            List<Map<String, Object>> vipSections = new ArrayList<>();
            List<Map<String, Object>> goldSections = new ArrayList<>();
            List<Map<String, Object>> generalSections = new ArrayList<>();

            for (Map<String, Object> s : sections) {
                Number priceNum = (Number) s.getOrDefault("price", 0);
                double p = priceNum.doubleValue();
                String n = ((String) s.getOrDefault("name", "")).toUpperCase();
                if (p >= 1500 || n.contains("VIP")) {
                    vipSections.add(s);
                } else if (p >= 800 || n.contains("ORO")) {
                    goldSections.add(s);
                } else {
                    generalSections.add(s);
                }
            }

            String choice = "GENERAL";
            Map<String, Object> winnerSection = null;

            Random random = new Random();
            double randVal = random.nextDouble(); // 0.0 to 1.0

            if (randVal < 0.05 && !vipSections.isEmpty()) {
                choice = "VIP";
                winnerSection = vipSections.get(random.nextInt(vipSections.size()));
            } else if (randVal < 0.20 && !goldSections.isEmpty()) {
                choice = "GOLD";
                winnerSection = goldSections.get(random.nextInt(goldSections.size()));
            } else if (!generalSections.isEmpty()) {
                choice = "GENERAL";
                winnerSection = generalSections.get(random.nextInt(generalSections.size()));
            } else {
                // Fallback a cualquier sección disponible
                List<String> avail = new ArrayList<>();
                if (!vipSections.isEmpty()) avail.add("VIP");
                if (!goldSections.isEmpty()) avail.add("GOLD");
                if (!generalSections.isEmpty()) avail.add("GENERAL");

                if (avail.isEmpty()) {
                    winnerSection = sections.get(random.nextInt(sections.size()));
                } else {
                    choice = avail.get(avail.size() - 1);
                    if ("VIP".equals(choice)) winnerSection = vipSections.get(random.nextInt(vipSections.size()));
                    else if ("GOLD".equals(choice)) winnerSection = goldSections.get(random.nextInt(goldSections.size()));
                    else winnerSection = generalSections.get(random.nextInt(generalSections.size()));
                }
            }

            writeLuckyDebugLog(logPath, "[" + LocalDateTime.now() + "] Winner section: " + winnerSection.get("name") + "\n");

            String rows = "ABCDE";
            char fila = rows.charAt(random.nextInt(rows.length()));
            int lugar = random.nextInt(8); // 0 to 7
            String seatId = winnerSection.getOrDefault("id", "sec") + "-" + fila + "-" + lugar;

            writeLuckyDebugLog(logPath, "[" + LocalDateTime.now() + "] Assigned seat_id: " + seatId + "\n");

            TicketItem tktItem = new TicketItem();
            tktItem.setEventId(eventId);
            tktItem.setSeatId(seatId);
            tktItem.setSectionName((String) winnerSection.get("name"));
            tktItem.setPrice(400.0);

            purchaseTickets(userId, List.of(tktItem), "lucky_roulette");

            writeLuckyDebugLog(logPath, "[" + LocalDateTime.now() + "] Purchase Tickets DONE\n");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("seatId", seatId);
            response.put("section_name", winnerSection.get("name"));
            response.put("category", choice);
            return response;

        } catch (Exception e) {
            writeLuckyDebugLog(logPath, "[" + LocalDateTime.now() + "] EXCEPTION CAUGHT: " + e.getMessage() + "\n");
            logger.error("Error en assignLuckySeat: ", e);
            if (e instanceof ResponseStatusException) {
                throw (ResponseStatusException) e;
            }
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private void writeLuckyDebugLog(String path, String content) {
        try {
            File file = new File(path);
            File parentDir = file.getParentFile();
            if (parentDir != null && !parentDir.exists()) {
                parentDir.mkdirs();
            }
            try (FileWriter fw = new FileWriter(file, true)) {
                fw.write(content);
            }
        } catch (Exception e) {
            logger.debug("Error de escritura en lucky_debug.txt (ignorado): {}", e.getMessage());
        }
    }

    private Map<String, Object> serializeTicket(Ticket tkt) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", tkt.getId());
        map.put("user_id", tkt.getUserId());
        map.put("event_id", tkt.getEventId());
        map.put("ticket_code", tkt.getTicketCode());
        map.put("qr_data", tkt.getQrData());
        map.put("section_name", tkt.getSectionName());
        map.put("seat_id", tkt.getSeatId());
        map.put("price", tkt.getPrice());
        map.put("status", tkt.getStatus());
        map.put("payment_method", tkt.getPaymentMethod());
        map.put("redeemed_at", tkt.getRedeemedAt());
        map.put("purchase_date", tkt.getPurchaseDate() != null ? tkt.getPurchaseDate().format(DateTimeFormatter.ISO_DATE_TIME) : null);
        map.put("created_at", tkt.getCreatedAt() != null ? tkt.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null);
        map.put("event_function_id", tkt.getEventFunctionId());
        return map;
    }

    private void populateEventDetails(Map<String, Object> tkt, Long eventId, Long functionId) {
        try {
            Map<String, Object> evData = restTemplate.getForObject(eventServiceUrl + "/" + eventId, Map.class);
            if (evData != null) {
                String funcDate = null;
                String funcTime = null;
                
                List<Map<String, Object>> functions = (List<Map<String, Object>>) evData.get("functions");
                if (functionId != null && functions != null) {
                    for (Map<String, Object> func : functions) {
                        Number fid = (Number) func.get("id");
                        if (fid != null && fid.longValue() == functionId) {
                            funcDate = (String) func.getOrDefault("event_date", func.get("date"));
                            funcTime = (String) func.getOrDefault("event_time", func.get("time"));
                            break;
                        }
                    }
                }

                String finalDate = funcDate != null ? funcDate : (String) evData.getOrDefault("event_date", evData.get("date"));
                String finalTime = funcTime != null ? funcTime : (String) evData.getOrDefault("event_time", evData.getOrDefault("time", "N/A"));
                String venueName = (String) evData.getOrDefault("venue_name", evData.get("venue"));

                Map<String, Object> eventMap = new LinkedHashMap<>();
                eventMap.put("id", evData.get("id"));
                eventMap.put("name", evData.get("name"));
                eventMap.put("date", finalDate);
                eventMap.put("time", finalTime);
                eventMap.put("venue_name", venueName);
                eventMap.put("image_url", evData.get("image_url"));
                eventMap.put("room", evData.get("room"));
                eventMap.put("seating_map", evData.get("seating_map"));
                eventMap.put("zones", evData.get("zones"));

                tkt.put("event", eventMap);
                tkt.put("eventName", evData.get("name"));
                tkt.put("date", finalDate);
                tkt.put("time", finalTime);
                tkt.put("venue", venueName);
                tkt.put("imageUrl", evData.get("image_url"));
                tkt.put("event_name", evData.get("name"));
                tkt.put("event_date", finalDate);
                tkt.put("event_time", finalTime);
                tkt.put("venue_name", venueName);
            } else {
                setEmptyEventDetails(tkt, "Info no disponible");
            }
        } catch (Exception e) {
            setEmptyEventDetails(tkt, "Error de conexión");
        }
    }

    private void setEmptyEventDetails(Map<String, Object> tkt, String status) {
        tkt.put("event_name", status);
        tkt.put("event_date", null);
        tkt.put("event_time", "N/A");
        tkt.put("venue_name", "Lugar no especificado");
        tkt.put("eventName", status);
        tkt.put("date", null);
        tkt.put("time", "N/A");
        tkt.put("venue", "Lugar no especificado");
    }

    public List<Map<String, Object>> getInternalPurchases() {
        List<Object[]> raw = ticketRepository.getInternalPurchasesRaw();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("user_id", ((Number) row[0]).longValue());
            item.put("total_tickets", ((Number) row[1]).longValue());
            item.put("last_purchase", row[2]);
            result.add(item);
        }
        return result;
    }

    public Map<String, Object> getInternalPurchasesByUserId(Long userId) {
        Object[] row = ticketRepository.getInternalPurchasesByUserIdRaw(userId);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("user_id", userId);
        if (row != null && row.length > 0) {
            result.put("total_tickets", row[0] != null ? ((Number) row[0]).longValue() : 0L);
            result.put("last_purchase", row[1]);
        } else {
            result.put("total_tickets", 0L);
            result.put("last_purchase", null);
        }
        return result;
    }

    @Transactional
    public List<Map<String, Object>> claimFreeTicket(Long userId, Long eventId, String sectionName, String sectionId, Long functionId, String seatId) {
        if (eventId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "event_id requerido");
        }

        try {
            Map<?, ?> ev = restTemplate.getForObject(eventServiceUrl + "/" + eventId, Map.class);
            if (ev != null) {
                Number priceNum = (Number) ev.get("price");
                double price = priceNum != null ? priceNum.doubleValue() : 0.0;
                Boolean isFreeObj = (Boolean) ev.get("is_free");
                boolean isFree = (isFreeObj != null && isFreeObj) || price == 0.0;
                if (!isFree) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Este evento no es gratuito. Usa el flujo de pago normal.");
                }
            } else {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo verificar el evento");
            }
        } catch (Exception e) {
            if (e instanceof ResponseStatusException) {
                throw (ResponseStatusException) e;
            }
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo verificar el evento");
        }

        TicketItem item = new TicketItem();
        item.setEventId(eventId);
        item.setSeatId(seatId);
        item.setSectionName(sectionName != null ? sectionName : "General");
        item.setSectionId(sectionId);
        item.setPrice(0.0);
        item.setFunctionId(functionId);

        return purchaseTickets(userId, List.of(item), "free");
    }
}
