package com.infosys.springboard.ecobazaar.service;

import com.infosys.springboard.ecobazaar.entity.EcoRating;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class CarbonCalculationService {

    // Eco-rating thresholds (in kg CO₂e)
    private static final double ECO_FRIENDLY_THRESHOLD = 2.0;
    private static final double MODERATE_THRESHOLD = 10.0;

    /**
     * Calculate eco-rating based on carbon impact
     * @param carbonImpact Carbon footprint in kg CO₂e
     * @return EcoRating enum value
     */

    /*Determining rating based on threshold ( == 2.0) */
    public String calculateEcoRating(BigDecimal carbonImpact) {
        if (carbonImpact == null) {
            return EcoRating.UNRATED.name();
        }

        double impact = carbonImpact.doubleValue();
        
        if (impact < ECO_FRIENDLY_THRESHOLD) {
            return EcoRating.ECO_FRIENDLY.name();
        } else if (impact <= MODERATE_THRESHOLD) {
            return EcoRating.MODERATE.name();
        } else {
            return EcoRating.HIGH_IMPACT.name();
        }
    }

    /**
     * Get eco-rating display name
     */
    public String getEcoRatingDisplayName(String ecoRating) {
        try {
            return EcoRating.valueOf(ecoRating).getDisplayName();
        } catch (IllegalArgumentException e) {
            return EcoRating.UNRATED.getDisplayName();
        }
    }

    /**
     * Get eco-rating description
     */
    public String getEcoRatingDescription(String ecoRating) {
        try {
            return EcoRating.valueOf(ecoRating).getDescription();
        } catch (IllegalArgumentException e) {
            return EcoRating.UNRATED.getDescription();
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
        try {
            EcoRating rating = EcoRating.valueOf(ecoRating);
            switch (rating) {
                case ECO_FRIENDLY:
                    return 10;
                case MODERATE:
                    return 5;
                case HIGH_IMPACT:
                    return 0;
                default:
                    return 0;
            }
        } catch (IllegalArgumentException e) {
            return 0;
        }
    }
}
