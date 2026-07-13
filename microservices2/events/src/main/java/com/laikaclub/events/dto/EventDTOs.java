package com.laikaclub.events.dto;

import java.util.List;

public class EventDTOs {

    public static class FunctionCreate {
        public String date;
        public String time;
        public Long venue_id;
        public Long room_id;
    }

    public static class EventTicketSectionCreate {
        public String name;
        public Double price;
        public Integer capacity;
        public Integer available;
        public String badge_text;
        public String color_hex;
    }

    public static class EventTicketSectionUpdate {
        public Long id;
        public String name;
        public Double price;
        public Integer capacity;
        public Integer available;
        public String badge_text;
        public String color_hex;
    }

    public static class EventRuleCreate {
        public String title;
        public String icon;
        public String description;
    }

    public static class EventRuleUpdate {
        public Long id;
        public String title;
        public String icon;
        public String description;
    }

    public static class EventCreate {
        public String name;
        public String description;
        public String event_date;
        public String event_time;
        public String location;
        public String venue;
        public Long venue_id;
        public Long room_id;
        public Boolean use_seating_map = false;
        public String category;
        public Double price;
        public Integer total_tickets;
        public Integer available_tickets;
        public String image_url;
        public String status = "draft";
        public Integer grid_position_x;
        public Integer grid_position_y;
        public Integer grid_span_x = 1;
        public Integer grid_span_y = 1;
        public Integer grid_page;
        public List<FunctionCreate> functions;
        public List<EventTicketSectionCreate> sections;
        public List<EventRuleCreate> rules;
        
        public Boolean ads_enabled = false;
        public Integer max_ads = 5;
        public Boolean merch_enabled = false;
        public Boolean metrics_enabled = false;
        public Long assigned_manager_id;
        public Long contract_id;
        public Long municipality_id;

        public Boolean presale_enabled = false;
        public String presale_bank_name;
        public String presale_bins;
        public String presale_start;
        public String presale_end;
    }

    public static class EventUpdate {
        public String name;
        public String description;
        public String event_date;
        public String event_time;
        public String location;
        public String venue;
        public String category;
        public Double price;
        public Integer total_tickets;
        public Integer available_tickets;
        public String image_url;
        public String status;
        public Integer grid_position_x;
        public Integer grid_position_y;
        public Integer grid_span_x;
        public Integer grid_span_y;
        public Integer grid_page;
        public Long venue_id;
        public Long room_id;
        public Boolean use_seating_map;
        public List<FunctionCreate> functions;
        public List<EventTicketSectionUpdate> sections;
        public List<EventRuleUpdate> rules;
        
        public Boolean ads_enabled;
        public Integer max_ads;
        public Boolean merch_enabled;
        public Boolean metrics_enabled;
        public Long assigned_manager_id;
        public Long contract_id;
        public Long municipality_id;

        public Boolean presale_enabled;
        public String presale_bank_name;
        public String presale_bins;
        public String presale_start;
        public String presale_end;
    }
}
