package com.laikaclub.events.lbs;

public class GeofenceTriggerDTO {
    public Long venueId;
    public Double currentLatitude;
    public Double currentLongitude;
    public String triggerType; // "ENTER", "EXIT", "DWELL"
}
