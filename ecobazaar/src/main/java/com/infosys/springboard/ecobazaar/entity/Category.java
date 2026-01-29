package com.infosys.springboard.ecobazaar.entity;

public enum Category {
    ELECTRONICS("Electronics"),
    CLOTHING("Clothing"),
    FOOD("Food & Beverages"),
    HOME_GARDEN("Home & Garden"),
    BEAUTY("Beauty & Personal Care"),
    SPORTS("Sports & Outdoors"),
    TOYS("Toys & Games"),
    BOOKS("Books & Stationery"),
    AUTOMOTIVE("Automotive"),
    HEALTH("Health & Wellness"),
    FURNITURE("Furniture"),
    OTHER("Other");

    private final String displayName;

    Category(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
