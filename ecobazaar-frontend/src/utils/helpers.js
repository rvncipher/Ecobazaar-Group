import { ECO_RATING_CONFIG } from '../utils/constants';

/**
 * Format price with currency symbol
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Format carbon impact display
 */
export const formatCarbonImpact = (carbonImpact) => {
  return `${carbonImpact.toFixed(2)} kg CO₂e`;
};

/**
 * Get eco-rating configuration
 */
export const getEcoRatingConfig = (ecoRating) => {
  return ECO_RATING_CONFIG[ecoRating] || ECO_RATING_CONFIG.UNRATED;
};

/**
 * Calculate eco-rating from carbon impact
 */
export const calculateEcoRating = (carbonImpact) => {
  if (carbonImpact < 2.0) return 'ECO_FRIENDLY';
  if (carbonImpact <= 10.0) return 'MODERATE';
  return 'HIGH_IMPACT';
};

/**
 * Format date
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Truncate text to specific length
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Get default product image if none provided
 * Maps to available images in public/img_assets/
 */
export const getProductImageUrl = (imageUrl, category = null) => {
  // If imageUrl is provided and valid, use it
  if (imageUrl && imageUrl.trim()) {
    return imageUrl;
  }
  
  // Available images in public/img_assets/
  const categoryImageMap = {
    'BEAUTY': '/img_assets/bambbrush.jpg',
    'CLOTHING': '/img_assets/Tshirt.jpg',
    'HOME_GARDEN': '/img_assets/cuttinboard.jpg',
    'FOOD': '/img_assets/bottle.jpg',
    'HEALTH': '/img_assets/bottle.jpg',
    'SPORTS': '/img_assets/bottle.jpg',
    'ELECTRONICS': '/img_assets/Tshirt.jpg', // Use t-shirt as fallback
  };
  
  // Return category-specific image if available
  if (category && categoryImageMap[category]) {
    return categoryImageMap[category];
  }
  
  // Default fallback - use bottle image as it's most generic
  return '/img_assets/bottle.jpg';
};
