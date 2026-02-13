package com.infosys.springboard.ecobazaar.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class CarbonCalculationService {

    // Eco-rating thresholds (in kg CO₂e)
    private static final double ECO_FRIENDLY_THRESHOLD = 2.0;
    private static final double MODERATE_THRESHOLD = 10.0;
    
    // Eco-rating string constants
    private static final String ECO_FRIENDLY = "ECO_FRIENDLY";
    private static final String MODERATE = "MODERATE";
    private static final String HIGH_IMPACT = "HIGH_IMPACT";
    private static final String UNRATED = "UNRATED";

    /**
     * Calculate eco-rating based on carbon impact
     * @param carbonImpact Carbon footprint in kg CO₂e
     * @return Eco-rating string value
     */

    /*Determining rating based on threshold ( == 2.0) */
    public String calculateEcoRating(BigDecimal carbonImpact) {
        if (carbonImpact == null) {
            return UNRATED;
        }

        double impact = carbonImpact.doubleValue();
        
        if (impact < ECO_FRIENDLY_THRESHOLD) {
            return ECO_FRIENDLY;
        } else if (impact <= MODERATE_THRESHOLD) {
            return MODERATE;
        } else {
            return HIGH_IMPACT;
        }
    }

    /**
     * Get eco-rating display name
     */
    public String getEcoRatingDisplayName(String ecoRating) {
        if (ecoRating == null) return "Unrated";
        
        switch (ecoRating) {
            case ECO_FRIENDLY:
                return "Eco-Friendly";
            case MODERATE:
                return "Moderate";
            case HIGH_IMPACT:
                return "High Impact";
            default:
                return "Unrated";
        }
    }

    /**
     * Get eco-rating description
     */
    public String getEcoRatingDescription(String ecoRating) {
        if (ecoRating == null) return "Not yet rated";
        
        switch (ecoRating) {
            case ECO_FRIENDLY:
                return "Low carbon footprint (< 2 kg CO₂e)";
            case MODERATE:
                return "Moderate carbon footprint (2-10 kg CO₂e)";
            case HIGH_IMPACT:
                return "High carbon footprint (> 10 kg CO₂e)";
            default:
                return "Not yet rated";
        }
    }

    /**
     * Check if product qualifies for eco-certification based on carbon impact
     * @param carbonImpact Carbon footprint in kg CO₂e
     * @return true if product qualifies for eco-certification
     */
    public boolean qualifiesForEcoCertification(BigDecimal carbonImpact) {
        if (carbonImpact == null) {
            return false;
        }
        return carbonImpact.doubleValue() < ECO_FRIENDLY_THRESHOLD;
    }

    /**
     * Calculate potential carbon savings compared to average
     * @param carbonImpact Product's carbon impact
     * @param categoryAverage Average carbon impact in category
     * @return Carbon savings in kg CO₂e
     */
    public BigDecimal calculateCarbonSavings(BigDecimal carbonImpact, BigDecimal categoryAverage) {
        if (carbonImpact == null || categoryAverage == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal savings = categoryAverage.subtract(carbonImpact);
        return savings.max(BigDecimal.ZERO);
    }

    /**
     * Calculate percentage reduction compared to average
     * @param carbonImpact Product's carbon impact
     * @param categoryAverage Average carbon impact in category
     * @return Percentage reduction (0-100)
     */
    public double calculatePercentageReduction(BigDecimal carbonImpact, BigDecimal categoryAverage) {
        if (carbonImpact == null || categoryAverage == null || categoryAverage.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        
        BigDecimal reduction = categoryAverage.subtract(carbonImpact);
        BigDecimal percentage = reduction.divide(categoryAverage, 4, RoundingMode.HALF_UP)
                                        .multiply(new BigDecimal("100"));
        
        return Math.max(0.0, percentage.doubleValue());
    }

    /**
     * Get eco-score points based on eco-rating (for gamification)
     */
    public int getEcoScorePoints(String ecoRating) {
        if (ecoRating == null) {
            return 0;
        }
        
        switch (ecoRating) {
            case ECO_FRIENDLY:
                return 10;
            case MODERATE:
                return 5;
            case HIGH_IMPACT:
                return 0;
            default:
                return 0;
        }
    }
}
