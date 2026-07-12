package com.laikaclub.achievements.service;

import com.laikaclub.achievements.domain.UserAchievement;
import com.laikaclub.achievements.domain.UserCoupon;
import com.laikaclub.achievements.repository.UserAchievementRepository;
import com.laikaclub.achievements.repository.UserCouponRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AchievementsService {

    private static final Logger logger = LoggerFactory.getLogger(AchievementsService.class);

    public static class Tier {
        private final int tier;
        private final String name;
        private final String phase;
        private final int requirement;
        private final String reward;
        private final String rewardType;
        private final Double rewardValue;
        private final Integer uses;
        private final Boolean permanent;
        private final String benefitId;

        public Tier(int tier, String name, String phase, int requirement, String reward, String rewardType, Double rewardValue, Integer uses, Boolean permanent, String benefitId) {
            this.tier = tier;
            this.name = name;
            this.phase = phase;
            this.requirement = requirement;
            this.reward = reward;
            this.rewardType = rewardType;
            this.rewardValue = rewardValue;
            this.uses = uses;
            this.permanent = permanent;
            this.benefitId = benefitId;
        }

        public int getTier() { return tier; }
        public String getName() { return name; }
        public String getPhase() { return phase; }
        public int getRequirement() { return requirement; }
        public String getReward() { return reward; }
        public String getRewardType() { return rewardType; }
        public Double getRewardValue() { return rewardValue; }
        public Integer getUses() { return uses; }
        public Boolean getPermanent() { return permanent; }
        public String getBenefitId() { return benefitId; }
    }

    private static final List<Tier> TIERS = new ArrayList<>();
    static {
        TIERS.add(new Tier(1, "Pasaporte Cósmico", "Gancho", 0, "100% discount on Service Fee in first purchase", "service_fee", 100.0, 1, false, null));
        TIERS.add(new Tier(2, "Ignición: T-Minus 0", "Gancho", 1, "Preventa Exclusiva 'Laika Priority'", "benefit", null, null, false, "laika_priority"));
        TIERS.add(new Tier(3, "Órbita Baja", "Gancho", 3, "5% discount direct on next purchase", "percentage", 5.0, 1, false, null));
        TIERS.add(new Tier(4, "Alunizaje VIP", "Retención", 5, "Skin dorada premium permanente en boletos", "benefit", null, null, true, "golden_skin"));
        TIERS.add(new Tier(5, "Piloto Sputnik", "Retención", 10, "Cupones 2x1 en cargos por servicio (2 usos)", "service_fee", 100.0, 2, false, null));
        TIERS.add(new Tier(6, "Viajero de Marte", "Retención", 20, "Fila Rápida permanente ('Laika Pass')", "benefit", null, null, true, "laika_pass"));
        TIERS.add(new Tier(7, "Comandante Interestelar", "Fidelización", 50, "Kit físico de Merch exclusivo del LAIKA Club", "benefit", null, null, false, "merch_kit"));
        TIERS.add(new Tier(8, "Salto al Hiperespacio", "Fidelización", 75, "Un boleto de regalo cada año por su cumpleaños", "benefit", null, null, false, "birthday_ticket"));
        TIERS.add(new Tier(9, "Supernova", "Fidelización", 90, "20% de descuento permanente en todos los fees", "service_fee", 20.0, null, true, null));
        TIERS.add(new Tier(10, "El Legado Laika", "Leyenda", 100, "40% de descuento anual en fees + Backstage Hero", "service_fee", 40.0, null, true, null));
    }

    private final UserAchievementRepository achievementRepository;
    private final UserCouponRepository couponRepository;
    private final RestTemplate restTemplate;

    @Value("${services.tickets-url}")
    private String ticketsServiceUrl;

    private final SecureRandom random = new SecureRandom();
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    @Autowired
    public AchievementsService(UserAchievementRepository achievementRepository,
                               UserCouponRepository couponRepository,
                               RestTemplate restTemplate) {
        this.achievementRepository = achievementRepository;
        this.couponRepository = couponRepository;
        this.restTemplate = restTemplate;
    }

    public int getUserTicketCount(Long userId, String authorizationHeader) {
        HttpHeaders headers = new HttpHeaders();
        if (authorizationHeader != null) {
            headers.set("Authorization", authorizationHeader);
        }
        
        // Pass X-User-Id just in case
        headers.set("X-User-Id", String.valueOf(userId));

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        String url = ticketsServiceUrl + "/my-tickets";

        try {
            ResponseEntity<List<Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<Object>>() {}
            );
            List<Object> body = response.getBody();
            if (response.getStatusCode().is2xxSuccessful() && body != null) {
                return body.size();
            }
        } catch (Exception e) {
            logger.error("Error fetching tickets for user {}: {}", userId, e.getMessage());
        }
        return 0;
    }

    @Transactional
    public void checkAchievementsLogic(Long userId, int ticketCount) {
        List<Tier> unlockedTiers = getAchievementsForCount(ticketCount);
        List<UserAchievement> alreadyUnlockedEntities = achievementRepository.findByUserId(userId);
        Set<Integer> alreadyUnlockedTiers = alreadyUnlockedEntities.stream()
                .map(UserAchievement::getTier)
                .collect(Collectors.toSet());

        for (Tier t : unlockedTiers) {
            if (!alreadyUnlockedTiers.contains(t.getTier())) {
                // Create Achievement
                UserAchievement newAch = new UserAchievement(
                        userId,
                        t.getTier(),
                        t.getTier(),
                        t.getName(),
                        t.getPhase()
                );
                achievementRepository.save(newAch);

                // Create Coupon reward if applicable
                String rt = t.getRewardType();
                if ("percentage".equals(rt) || "fixed".equals(rt) || "service_fee".equals(rt)) {
                    int uses = t.getUses() != null ? t.getUses() : 1;
                    int permanentVal = Boolean.TRUE.equals(t.getPermanent()) ? 1 : 0;
                    
                    UserCoupon newCoupon = new UserCoupon(
                            userId,
                            generateCouponCode(t.getTier()),
                            rt,
                            t.getRewardValue(),
                            t.getReward(),
                            uses,
                            null, // does not expire immediately
                            permanentVal
                    );
                    couponRepository.save(newCoupon);
                }
            }
        }
    }

    public List<Tier> getAchievementsForCount(int ticketCount) {
        List<Tier> unlocked = new ArrayList<>();
        for (Tier t : TIERS) {
            if (ticketCount >= t.getRequirement()) {
                unlocked.add(t);
            }
        }
        return unlocked;
    }

    public String generateCouponCode(int tierNum) {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return String.format("LAIKA-%02d-%s", tierNum, sb.toString());
    }

    public List<UserAchievement> getUnlockedAchievements(Long userId) {
        return achievementRepository.findByUserId(userId);
    }
}
