package com.laikaclub.achievements.service;

import com.laikaclub.achievements.domain.UserCoupon;
import com.laikaclub.achievements.dto.IncentiveDetail;
import com.laikaclub.achievements.dto.IncentivesResponse;
import com.laikaclub.achievements.repository.UserCouponRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class IncentivesService {

    private static final Logger logger = LoggerFactory.getLogger(IncentivesService.class);

    private final UserCouponRepository couponRepository;
    private final RestTemplate restTemplate;

    @Value("${services.auth-url}")
    private String authServiceUrl;

    @Value("${services.tickets-url}")
    private String ticketsServiceUrl;

    private final SecureRandom random = new SecureRandom();
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    @Autowired
    public IncentivesService(UserCouponRepository couponRepository, RestTemplate restTemplate) {
        this.couponRepository = couponRepository;
        this.restTemplate = restTemplate;
    }

    private LocalDateTime parseDate(Object dateVal) {
        if (dateVal == null) {
            return null;
        }
        String str = dateVal.toString().trim();
        if (str.isEmpty() || "null".equalsIgnoreCase(str)) {
            return null;
        }
        try {
            String clean = str.replace("T", " ");
            if (clean.contains(".")) {
                clean = clean.split("\\.")[0];
            }
            if (clean.contains("Z")) {
                clean = clean.replace("Z", "");
            }
            if (clean.length() == 10) {
                clean += " 00:00:00";
            }
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            return LocalDateTime.parse(clean, formatter);
        } catch (Exception e) {
            logger.debug("Could not parse date '{}': {}", str, e.getMessage());
        }
        return null;
    }

    private boolean isInactive(LocalDateTime now, LocalDateTime referenceDate, double thresholdDays, boolean testMode) {
        if (referenceDate == null) {
            return false;
        }
        java.time.Duration duration = java.time.Duration.between(referenceDate, now);
        long days = duration.toDays();
        long totalSeconds = duration.getSeconds();
        return days >= thresholdDays || (testMode && totalSeconds >= 60);
    }

    private String generateRandomCode(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }

    @SuppressWarnings("unchecked")
    @Transactional
    public IncentivesResponse runIncentives(boolean testMode) {
        // 1. Fetch all users from auth service
        List<Map<String, Object>> usersList = null;
        try {
            String url = authServiceUrl + "/internal/users";
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            List<Map<String, Object>> body = response.getBody();
            if (response.getStatusCode().is2xxSuccessful() && body != null) {
                usersList = body;
            }
        } catch (Exception e) {
            logger.error("Error fetching internal users from Auth Service: {}", e.getMessage());
            throw new RuntimeException("No se pudo conectar con Auth Service: " + e.getMessage());
        }

        if (usersList == null) {
            usersList = Collections.emptyList();
        }

        // Apply test mode slicing
        if (testMode) {
            Map<String, Object> testUser = null;
            List<Map<String, Object>> otherUsers = new ArrayList<>();
            for (Map<String, Object> u : usersList) {
                if ("testuser_1348@laikaclub.com".equals(u.get("email"))) {
                    testUser = u;
                } else {
                    otherUsers.add(u);
                }
            }
            usersList = new ArrayList<>();
            if (testUser != null) {
                usersList.add(testUser);
                int limit = Math.min(otherUsers.size(), 99);
                usersList.addAll(otherUsers.subList(0, limit));
            } else {
                int limit = Math.min(otherUsers.size(), 100);
                usersList.addAll(otherUsers.subList(0, limit));
            }
        }

        // 2. Fetch purchase history from tickets service
        Map<Long, Map<String, Object>> purchasesMap = new HashMap<>();
        try {
            String url = ticketsServiceUrl + "/internal/purchases";
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            List<Map<String, Object>> purchasesList = response.getBody();
            if (response.getStatusCode().is2xxSuccessful() && purchasesList != null) {
                for (Map<String, Object> p : purchasesList) {
                    Number userIdNum = (Number) p.get("user_id");
                    if (userIdNum != null) {
                        purchasesMap.put(userIdNum.longValue(), p);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error fetching internal purchases from Ticket Service: {}", e.getMessage());
            throw new RuntimeException("No se pudo conectar con Ticket Service: " + e.getMessage());
        }

        // 2.5 Cache existing active coupons in memory to optimize database lookups
        Set<Long> existingVolver = new HashSet<>();
        Set<Long> existingPrimerPaso = new HashSet<>();
        Set<Long> existingDespierta = new HashSet<>();
        try {
            List<UserCoupon> activeCoupons = couponRepository.findByUsesLeftGreaterThan(0);
            for (UserCoupon c : activeCoupons) {
                if (c.getCode() != null) {
                    if (c.getCode().startsWith("LAIKA-VOLVER90-")) {
                        existingVolver.add(c.getUserId());
                    } else if (c.getCode().startsWith("LAIKA-PRIMERPASO-")) {
                        existingPrimerPaso.add(c.getUserId());
                    } else if (c.getCode().startsWith("LAIKA-DESPIERTA-")) {
                        existingDespierta.add(c.getUserId());
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error caching active coupons: {}", e.getMessage());
            throw new RuntimeException("Error al leer cupones activos: " + e.getMessage());
        }

        LocalDateTime now = LocalDateTime.now();
        double buyerInactivityDays = testMode ? 0.0007 : 90.0;
        double newUserInactivityDays = testMode ? 0.0007 : 30.0;
        double loginInactivityDays = testMode ? 0.0007 : 60.0;

        List<IncentiveDetail> incentivesCreated = new ArrayList<>();
        Set<Long> newlyRewardedUids = new HashSet<>();

        for (Map<String, Object> u : usersList) {
            Number idNum = (Number) u.get("id");
            if (idNum == null) continue;
            Long uid = idNum.longValue();
            String email = (String) u.get("email");
            LocalDateTime regDate = parseDate(u.get("created_at"));
            LocalDateTime lastLog = parseDate(u.get("last_login"));

            Map<String, Object> userP = purchasesMap.getOrDefault(uid, Map.of("total_tickets", 0, "last_purchase", ""));
            LocalDateTime lastPurch = parseDate(userP.get("last_purchase"));
            Number totTicketsNum = (Number) userP.getOrDefault("total_tickets", 0);
            int totTickets = totTicketsNum != null ? totTicketsNum.intValue() : 0;

            // Check Campaign 1: Inactive buyer (purchased in past, but not recently)
            if (totTickets > 0 && lastPurch != null) {
                if (isInactive(now, lastPurch, buyerInactivityDays, testMode)) {
                    String prefix = "VOLVER90-";
                    if (!existingVolver.contains(uid)) {
                        String code = "LAIKA-" + prefix + generateRandomCode(6);
                        UserCoupon newCoupon = new UserCoupon(
                                uid,
                                code,
                                "percentage",
                                15.0,
                                "Cupón de Incentivo: Regreso Triunfal (15% de descuento en boletos)",
                                1,
                                now.plusDays(30),
                                0
                        );
                        newCoupon.setCouponType("incentive");
                        couponRepository.save(newCoupon);
                        existingVolver.add(uid);
                        incentivesCreated.add(new IncentiveDetail(
                                uid,
                                email,
                                "Regreso Triunfal (90d inactivo)",
                                code,
                                "15% Descuento"
                        ));
                    }
                }
            }

            // Check Campaign 2: Registered but never purchased
            if (totTickets == 0 && regDate != null) {
                if (isInactive(now, regDate, newUserInactivityDays, testMode)) {
                    String prefix = "PRIMERPASO-";
                    if (!existingPrimerPaso.contains(uid)) {
                        String code = "LAIKA-" + prefix + generateRandomCode(6);
                        UserCoupon newCoupon = new UserCoupon(
                                uid,
                                code,
                                "service_fee",
                                100.0,
                                "Cupón de Incentivo: Tu Primer Evento (100% descuento en cargo por servicio)",
                                1,
                                now.plusDays(30),
                                0
                        );
                        newCoupon.setCouponType("incentive");
                        couponRepository.save(newCoupon);
                        existingPrimerPaso.add(uid);
                        incentivesCreated.add(new IncentiveDetail(
                                uid,
                                email,
                                "Primer Evento (Sin compras)",
                                code,
                                "100% Fee gratis"
                        ));
                    }
                }
            }

            // Check Campaign 3: Account unused (last login was long ago)
            LocalDateTime loginRef = lastLog != null ? lastLog : regDate;
            if (loginRef != null) {
                if (isInactive(now, loginRef, loginInactivityDays, testMode)) {
                    String prefix = "DESPIERTA-";
                    if (!existingDespierta.contains(uid) && !newlyRewardedUids.contains(uid)) {
                        String code = "LAIKA-" + prefix + generateRandomCode(6);
                        UserCoupon newCoupon = new UserCoupon(
                                uid,
                                code,
                                "fixed",
                                200.0,
                                "Cupón de Incentivo: Despierta tu Cuenta ($200 de descuento directo)",
                                1,
                                now.plusDays(30),
                                0
                        );
                        newCoupon.setCouponType("incentive");
                        couponRepository.save(newCoupon);
                        existingDespierta.add(uid);
                        newlyRewardedUids.add(uid);
                        incentivesCreated.add(new IncentiveDetail(
                                uid,
                                email,
                                "Despierta tu Cuenta (Inactividad de login)",
                                code,
                                "$200 de descuento"
                        ));
                    }
                }
            }
        }

        return new IncentivesResponse(
                "success",
                usersList.size(),
                incentivesCreated.size(),
                incentivesCreated
        );
    }

    @SuppressWarnings("unchecked")
    @Transactional
    public void checkAndGrantUserIncentivesRealtime(Long userId) {
        try {
            // Get user details
            String userUrl = authServiceUrl + "/internal/users/" + userId;
            ResponseEntity<Map<String, Object>> userResponse = restTemplate.exchange(
                    userUrl,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> u = userResponse.getBody();
            if (!userResponse.getStatusCode().is2xxSuccessful() || u == null) {
                return;
            }

            String purchaseUrl = ticketsServiceUrl + "/internal/purchases/" + userId;
            ResponseEntity<Map<String, Object>> purchaseResponse = restTemplate.exchange(
                    purchaseUrl,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> userP = purchaseResponse.getBody();
            if (!purchaseResponse.getStatusCode().is2xxSuccessful() || userP == null) {
                return;
            }

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime regDate = parseDate(u.get("created_at"));
            LocalDateTime lastLog = parseDate(u.get("last_login"));
            LocalDateTime lastPurch = parseDate(userP.get("last_purchase"));
            Number totTicketsNum = (Number) userP.getOrDefault("total_tickets", 0);
            int totTickets = totTicketsNum != null ? totTicketsNum.intValue() : 0;

            // 1. Check Campaign 1: Inactive buyer (90 days)
            if (totTickets > 0 && lastPurch != null) {
                if (isInactive(now, lastPurch, 90.0, false)) {
                    String prefix = "VOLVER90-";
                    // Check if they already have an active one (with uses left > 0)
                    boolean hasActive = couponRepository.findActiveCouponsByUserId(userId).stream()
                            .anyMatch(c -> c.getCode() != null && c.getCode().startsWith("LAIKA-" + prefix));
                    if (!hasActive) {
                        String code = "LAIKA-" + prefix + generateRandomCode(6);
                        UserCoupon newCoupon = new UserCoupon(
                                userId,
                                code,
                                "percentage",
                                15.0,
                                "Cupón de Incentivo: Regreso Triunfal (15% de descuento en boletos)",
                                1,
                                now.plusDays(30),
                                0
                        );
                        couponRepository.save(newCoupon);
                    }
                }
            }
            // 2. Check Campaign 2: Registered but never purchased (30 days)
            else if (totTickets == 0 && regDate != null) {
                if (isInactive(now, regDate, 30.0, false)) {
                    String prefix = "PRIMERPASO-";
                    boolean hasActive = couponRepository.findActiveCouponsByUserId(userId).stream()
                            .anyMatch(c -> c.getCode() != null && c.getCode().startsWith("LAIKA-" + prefix));
                    if (!hasActive) {
                        String code = "LAIKA-" + prefix + generateRandomCode(6);
                        UserCoupon newCoupon = new UserCoupon(
                                userId,
                                code,
                                "service_fee",
                                100.0,
                                "Cupón de Incentivo: Tu Primer Evento (100% descuento en cargo por servicio)",
                                1,
                                now.plusDays(30),
                                0
                        );
                        couponRepository.save(newCoupon);
                    }
                }
            }

            // 3. Check Campaign 3: Account unused / login inactivity (60 days)
            LocalDateTime loginRef = lastLog != null ? lastLog : regDate;
            if (loginRef != null) {
                if (isInactive(now, loginRef, 60.0, false)) {
                    String prefix = "DESPIERTA-";
                    boolean hasActive = couponRepository.findActiveCouponsByUserId(userId).stream()
                            .anyMatch(c -> c.getCode() != null && c.getCode().startsWith("LAIKA-" + prefix));
                    if (!hasActive) {
                        String code = "LAIKA-" + prefix + generateRandomCode(6);
                        UserCoupon newCoupon = new UserCoupon(
                                userId,
                                code,
                                "fixed",
                                200.0,
                                "Cupón de Incentivo: Despierta tu Cuenta ($200 de descuento directo)",
                                1,
                                now.plusDays(30),
                                0
                        );
                        couponRepository.save(newCoupon);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error checking real-time incentives for user {}: {}", userId, e.getMessage());
        }
    }
}
