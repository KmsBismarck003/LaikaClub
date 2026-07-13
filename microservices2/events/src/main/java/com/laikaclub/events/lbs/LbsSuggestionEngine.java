package com.laikaclub.events.lbs;

import com.laikaclub.events.domain.UserLbsHistory;
import com.laikaclub.events.domain.Venue;
import com.laikaclub.events.repository.UserLbsHistoryRepository;
import com.laikaclub.events.repository.VenueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Optional;
import com.laikaclub.events.repository.EventRepository;

@Service
public class LbsSuggestionEngine {

    private static final Logger logger = LoggerFactory.getLogger(LbsSuggestionEngine.class);
    private static final int COOLDOWN_HOURS = 72;

    private final VenueRepository venueRepository;
    private final UserLbsHistoryRepository historyRepository;
    private final EventRepository eventRepository;

    @Autowired
    public LbsSuggestionEngine(VenueRepository venueRepository, UserLbsHistoryRepository historyRepository, EventRepository eventRepository) {
        this.venueRepository = venueRepository;
        this.historyRepository = historyRepository;
        this.eventRepository = eventRepository;
    }

    @Transactional
    public void processGeofenceTrigger(Long userId, GeofenceTriggerDTO trigger) {
        if (!"ENTER".equalsIgnoreCase(trigger.triggerType)) {
            return; // For now, we only trigger suggestions when entering the geofence
        }

        Optional<Venue> venueOpt = venueRepository.findById(trigger.venueId);
        if (venueOpt.isEmpty()) {
            return;
        }
        Venue venue = venueOpt.get();

        // 1. Check Quiet Hours (e.g. don't send between 22:00 and 08:00 local time)
        String tz = venue.getTimezone() != null ? venue.getTimezone() : "UTC";
        ZonedDateTime localTime = ZonedDateTime.now(ZoneId.of(tz));
        int hour = localTime.getHour();
        if (hour >= 22 || hour < 8) {
            logger.info("Quiet hours active for venue {}. No LBS notification sent.", venue.getId());
            return;
        }

        // 2. Check Cooldown
        Optional<UserLbsHistory> historyOpt = historyRepository.findByUserIdAndVenueId(userId, venue.getId());
        if (historyOpt.isPresent()) {
            UserLbsHistory history = historyOpt.get();
            if (history.getLastNotifiedAt().isAfter(LocalDateTime.now().minusHours(COOLDOWN_HOURS))) {
                logger.info("User {} is in cooldown for venue {}.", userId, venue.getId());
                return;
            }
        }

        // 3. Check if there are active events with available tickets in this venue
        long activeEventsCount = eventRepository.countByVenueIdAndStatus(venue.getId(), "published");
        if (activeEventsCount == 0) {
            logger.info("No active events for venue {}. Skipping LBS suggestion.", venue.getId());
            return;
        }

        String suggestionMessage = "¡Estás cerca de " + venue.getName() + "! Descubre los próximos eventos. ¡Hay " + activeEventsCount + " eventos programados!";

        // 4. Dispatch Push Notification (Assuming PushNotificationService exists, mocked here)
        logger.info("DISPATCHING LBS PUSH NOTIFICATION to User {}: {}", userId, suggestionMessage);
        
        // 5. Update History
        UserLbsHistory history = historyOpt.orElseGet(() -> {
            UserLbsHistory h = new UserLbsHistory();
            h.setUserId(userId);
            h.setVenueId(venue.getId());
            return h;
        });
        history.setLastNotifiedAt(LocalDateTime.now());
        historyRepository.save(history);
    }
}
