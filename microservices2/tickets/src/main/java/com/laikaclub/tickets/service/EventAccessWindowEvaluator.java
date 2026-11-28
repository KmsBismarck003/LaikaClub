package com.laikaclub.tickets.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Evaluador puro de ventanas temporales de acceso a eventos en zona horaria America/Mexico_City.
 * Centraliza la regla de apertura, llegada anticipada del mismo día y cierre real por duración
 * para ContextualValidationService y TicketService (Single Source of Truth).
 */
public final class EventAccessWindowEvaluator {

    public static final ZoneId MEXICO_CITY_ZONE = ZoneId.of("America/Mexico_City");
    public static final int DEFAULT_DOORS_OPEN_MINUTES_BEFORE = 120;
    public static final int DEFAULT_DURATION_MINUTES = 240;
    public static final int POST_EVENT_GRACE_MINUTES = 30;

    private static final Pattern TIME_PATTERN = Pattern.compile("(\\d{1,2}):(\\d{2})(?::(\\d{2}))?\\s*([aApP]\\.?\\s*[mM]\\.?)?");

    public enum WindowState {
        FUTURE_DAY,
        EARLY_ACCESS,
        OPEN,
        CONCLUDED,
        UNKNOWN
    }

    public static final class WindowEvaluation {
        private final WindowState state;
        private final LocalDateTime eventStart;
        private final LocalDateTime doorsOpen;
        private final LocalDateTime eventEnd;
        private final long secondsUntilDoorsOpen;
        private final long secondsUntilStart;

        public WindowEvaluation(WindowState state,
                                LocalDateTime eventStart,
                                LocalDateTime doorsOpen,
                                LocalDateTime eventEnd,
                                long secondsUntilDoorsOpen,
                                long secondsUntilStart) {
            this.state = state;
            this.eventStart = eventStart;
            this.doorsOpen = doorsOpen;
            this.eventEnd = eventEnd;
            this.secondsUntilDoorsOpen = secondsUntilDoorsOpen;
            this.secondsUntilStart = secondsUntilStart;
        }

        public WindowState getState() {
            return state;
        }

        public LocalDateTime getEventStart() {
            return eventStart;
        }

        public LocalDateTime getDoorsOpen() {
            return doorsOpen;
        }

        public LocalDateTime getEventEnd() {
            return eventEnd;
        }

        public long getSecondsUntilDoorsOpen() {
            return secondsUntilDoorsOpen;
        }

        public long getSecondsUntilStart() {
            return secondsUntilStart;
        }
    }

    private EventAccessWindowEvaluator() {}

    public static LocalDateTime nowMexico() {
        return LocalDateTime.now(MEXICO_CITY_ZONE);
    }

    public static WindowEvaluation evaluate(Map<String, Object> eventData, LocalDateTime now) {
        LocalDateTime eventStart = parseEventStart(eventData);
        if (eventStart == null) {
            return new WindowEvaluation(WindowState.UNKNOWN, null, null, null, 0L, 0L);
        }

        int doorsOpenMinutesBefore = resolvePositiveInt(eventData, "doors_open_minutes_before", "doorsOpenMinutesBefore", DEFAULT_DOORS_OPEN_MINUTES_BEFORE);
        int durationMinutes = resolvePositiveInt(eventData, "duration_minutes", "durationMinutes", DEFAULT_DURATION_MINUTES);

        LocalDateTime doorsOpen = eventStart.minusMinutes(doorsOpenMinutesBefore);
        LocalDateTime eventEnd = eventStart.plusMinutes((long) durationMinutes + POST_EVENT_GRACE_MINUTES);

        if (now.isAfter(eventEnd)) {
            return new WindowEvaluation(WindowState.CONCLUDED, eventStart, doorsOpen, eventEnd, 0L, 0L);
        }

        long secUntilStart = Math.max(0L, Duration.between(now, eventStart).getSeconds());
        long secUntilDoors = Math.max(0L, Duration.between(now, doorsOpen).getSeconds());

        if (!now.isBefore(doorsOpen)) {
            return new WindowEvaluation(WindowState.OPEN, eventStart, doorsOpen, eventEnd, 0L, secUntilStart);
        }

        if (now.toLocalDate().equals(eventStart.toLocalDate())) {
            return new WindowEvaluation(WindowState.EARLY_ACCESS, eventStart, doorsOpen, eventEnd, secUntilDoors, secUntilStart);
        }

        return new WindowEvaluation(WindowState.FUTURE_DAY, eventStart, doorsOpen, eventEnd, secUntilDoors, secUntilStart);
    }

    public static boolean isConcluded(Map<String, Object> eventData) {
        return evaluate(eventData, nowMexico()).getState() == WindowState.CONCLUDED;
    }

    public static LocalDateTime parseEventStart(Map<String, Object> eventData) {
        if (eventData == null) return null;
        String dateStr = asString(eventData.getOrDefault("event_date", eventData.get("date")));
        String timeStr = asString(eventData.getOrDefault("event_time", eventData.get("time")));
        return parseEventStart(dateStr, timeStr);
    }

    public static LocalDateTime parseEventStart(String dateStr, String timeStr) {
        if (dateStr == null || dateStr.trim().isEmpty() || "N/A".equalsIgnoreCase(dateStr.trim())) {
            return null;
        }
        try {
            String trimmedDate = dateStr.trim();
            LocalDate date = LocalDate.parse(trimmedDate.substring(0, 10));
            LocalTime time = parseEventTime(timeStr);
            return LocalDateTime.of(date, time);
        } catch (Exception e) {
            return null;
        }
    }

    private static LocalTime parseEventTime(String timeStr) {
        if (timeStr == null || timeStr.trim().isEmpty() || timeStr.toUpperCase(Locale.ROOT).contains("N/A")) {
            return LocalTime.of(20, 0);
        }
        Matcher matcher = TIME_PATTERN.matcher(timeStr.trim());
        if (!matcher.find()) {
            return LocalTime.of(20, 0);
        }
        try {
            int hour = Integer.parseInt(matcher.group(1));
            int minute = Integer.parseInt(matcher.group(2));
            int second = matcher.group(3) != null ? Integer.parseInt(matcher.group(3)) : 0;
            String meridiem = matcher.group(4);

            if (meridiem != null) {
                String cleanMeridiem = meridiem.replaceAll("[^a-zA-Z]", "").toUpperCase(Locale.ROOT);
                if ("PM".equals(cleanMeridiem) && hour < 12) {
                    hour += 12;
                } else if ("AM".equals(cleanMeridiem) && hour == 12) {
                    hour = 0;
                }
            }
            return LocalTime.of(hour, minute, second);
        } catch (Exception e) {
            return LocalTime.of(20, 0);
        }
    }

    private static int resolvePositiveInt(Map<String, Object> data, String primaryKey, String fallbackKey, int defaultValue) {
        if (data == null) return defaultValue;
        Object raw = data.get(primaryKey);
        if (raw == null) raw = data.get(fallbackKey);
        if (raw instanceof Number) {
            int val = ((Number) raw).intValue();
            return val > 0 ? val : defaultValue;
        }
        if (raw != null) {
            try {
                int val = Integer.parseInt(raw.toString().trim());
                return val > 0 ? val : defaultValue;
            } catch (NumberFormatException ignored) {}
        }
        return defaultValue;
    }

    private static String asString(Object value) {
        return value != null ? value.toString() : null;
    }
}

