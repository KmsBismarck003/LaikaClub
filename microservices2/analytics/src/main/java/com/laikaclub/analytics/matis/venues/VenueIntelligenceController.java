package com.laikaclub.analytics.matis.venues;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics/matis/venues")
public class VenueIntelligenceController {

    private final VenueIntelligenceService venueService;

    @Autowired
    public VenueIntelligenceController(VenueIntelligenceService venueService) {
        this.venueService = venueService;
    }

    @GetMapping("/prospects")
    public Map<String, Object> getProspects() {
        return venueService.getVenueProspectingLeads();
    }
}
