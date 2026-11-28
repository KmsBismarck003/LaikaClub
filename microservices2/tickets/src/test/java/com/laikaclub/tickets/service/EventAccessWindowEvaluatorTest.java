package com.laikaclub.tickets.service;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class EventAccessWindowEvaluatorTest {

    private Map<String, Object> sampleEvent(String date, String time, Integer durationMinutes) {
        Map<String, Object> map = new HashMap<>();
        map.put("event_date", date);
        map.put("event_time", time);
        if (durationMinutes != null) {
            map.put("duration_minutes", durationMinutes);
        }
        return map;
    }

    @Test
    void blocksPreviousDayAsFutureDay() {
        Map<String, Object> ev = sampleEvent("2026-11-28", "17:30", 200);
        LocalDateTime now = LocalDateTime.of(2026, 11, 27, 17, 30);

        EventAccessWindowEvaluator.WindowEvaluation eval = EventAccessWindowEvaluator.evaluate(ev, now);
        assertEquals(EventAccessWindowEvaluator.WindowState.FUTURE_DAY, eval.getState());
        assertTrue(eval.getSecondsUntilDoorsOpen() > 0);
    }

    @Test
    void allowsSameDayEarlyArrivalBeforeDoorsOpen() {
        Map<String, Object> ev = sampleEvent("2026-11-27", "17:30", 200);
        LocalDateTime now = LocalDateTime.of(2026, 11, 27, 13, 0);

        EventAccessWindowEvaluator.WindowEvaluation eval = EventAccessWindowEvaluator.evaluate(ev, now);
        assertEquals(EventAccessWindowEvaluator.WindowState.EARLY_ACCESS, eval.getState());
        assertTrue(eval.getSecondsUntilStart() > 0);
    }

    @Test
    void opensTwoHoursBeforeStartAndStaysOpenDuringEventAndGrace() {
        Map<String, Object> ev = sampleEvent("2026-11-27", "17:30", 200); // ends 20:50 + 30m grace = 21:20

        assertEquals(EventAccessWindowEvaluator.WindowState.OPEN,
                EventAccessWindowEvaluator.evaluate(ev, LocalDateTime.of(2026, 11, 27, 15, 30)).getState());
        assertEquals(EventAccessWindowEvaluator.WindowState.OPEN,
                EventAccessWindowEvaluator.evaluate(ev, LocalDateTime.of(2026, 11, 27, 17, 29)).getState());
        assertEquals(EventAccessWindowEvaluator.WindowState.OPEN,
                EventAccessWindowEvaluator.evaluate(ev, LocalDateTime.of(2026, 11, 27, 19, 45)).getState());
        assertEquals(EventAccessWindowEvaluator.WindowState.OPEN,
                EventAccessWindowEvaluator.evaluate(ev, LocalDateTime.of(2026, 11, 27, 21, 15)).getState());
        assertEquals(EventAccessWindowEvaluator.WindowState.CONCLUDED,
                EventAccessWindowEvaluator.evaluate(ev, LocalDateTime.of(2026, 11, 27, 21, 21)).getState());
    }

    @Test
    void handlesEventsCrossingMidnightWithoutEarlyCutoff() {
        Map<String, Object> ev = sampleEvent("2026-11-27", "22:00", 240); // ends 02:00 + 30m = 02:30 next day

        assertEquals(EventAccessWindowEvaluator.WindowState.OPEN,
                EventAccessWindowEvaluator.evaluate(ev, LocalDateTime.of(2026, 11, 28, 1, 30)).getState());
        assertEquals(EventAccessWindowEvaluator.WindowState.CONCLUDED,
                EventAccessWindowEvaluator.evaluate(ev, LocalDateTime.of(2026, 11, 28, 2, 31)).getState());
    }
}

