package com.infosys.springboard.ecobazaar.entity;

public enum EcoRating {
    ECO_FRIENDLY("Eco-Friendly", "Low carbon footprint (< 2 kg CO₂e)"),
    MODERATE("Moderate", "Moderate carbon footprint (2-10 kg CO₂e)"),
    HIGH_IMPACT("High Impact", "High carbon footprint (> 10 kg CO₂e)"),
    UNRATED("Unrated", "Not yet rated");

    private final String displayName;
    private final String description;

    EcoRating(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    // Determine eco-rating based on carbon impact
    public static EcoRating fromCarbonImpact(double carbonImpact) {
        if (carbonImpact < 2.0) {
            return ECO_FRIENDLY;
        } else if (carbonImpact <= 10.0) {
            return MODERATE;
        } else {
            return HIGH_IMPACT;
        }
    }
}
