// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
  },
  
  // User
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE: '/api/user/update',
  },
  
  // Products
  PRODUCTS: {
    BASE: '/products',
    APPROVED: '/products/approved',
    DETAIL: (id) => `/products/${id}`,
    SEARCH: '/products/search',
    CATEGORY: (category) => `/products/category/${category}`,
    ECO_RATING: '/products/filter/eco-rating',
    ECO_CERTIFIED: '/products/eco-certified',
    ECO_SORTED: '/products/eco-sorted',
    PRICE_FILTER: '/products/filter/price',
    CARBON_FILTER: '/products/filter/carbon',
    MY_PRODUCTS: '/products/my-products',
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
  },
  
  // Admin
  ADMIN: {
    ALL_PRODUCTS: '/products/admin/all',
    PENDING_PRODUCTS: '/products/admin/pending',
    APPROVE: (id) => `/products/admin/${id}/approve`,
    UNAPPROVE: (id) => `/products/admin/${id}/unapprove`,
    ECO_CERTIFY: (id) => `/products/admin/${id}/eco-certify`,
  },

  // Cart
  CART: {
    BASE: '/cart',
    ITEMS: '/cart/items',
    UPDATE_ITEM: (id) => `/cart/items/${id}`,
    REMOVE_ITEM: (id) => `/cart/items/${id}`,
    COUNT: '/cart/count',
  },

  // Orders
  ORDERS: {
    BASE: '/orders',
    MY_ORDERS: '/orders/my-orders',
    DETAIL: (id) => `/orders/${id}`,
    CANCEL: (id) => `/orders/${id}/cancel`,
    CARBON_IMPACT: '/orders/my-carbon-impact',
  },

  // Recommendations
  RECOMMENDATIONS: {
    ALTERNATIVES: (id) => `/products/${id}/alternatives`,
    SIMILAR: (id) => `/products/${id}/similar`,
    ECO_FRIENDLY: '/products/recommendations/eco-friendly',
    BEST_ECO_VALUE: '/products/recommendations/best-eco-value',
    CARBON_SAVINGS: '/products/carbon-savings',
  },
};

// Eco-Rating Thresholds
export const ECO_THRESHOLDS = {
  ECO_FRIENDLY: 2.0,      // < 2 kg CO₂e
  MODERATE: 10.0,         // 2-10 kg CO₂e
  HIGH_IMPACT: 10.0,      // > 10 kg CO₂e
};

// Eco-Rating Display Config
export const ECO_RATING_CONFIG = {
  ECO_FRIENDLY: {
    label: 'ECO',
    color: '#22c55e',      // green
    bgColor: '#dcfce7',
    iconName: 'Leaf',
  },
  MODERATE: {
    label: 'Medium',
    color: '#eab308',      // yellow
    bgColor: '#fef9c3',
    iconName: 'AlertTriangle',
  },
  HIGH_IMPACT: {
    label: 'High',
    color: '#ef4444',      // red
    bgColor: '#fee2e2',
    iconName: 'XCircle',
  },
  UNRATED: {
    label: 'N/A',
    color: '#6b7280',      // gray
    bgColor: '#f3f4f6',
    iconName: 'HelpCircle',
  },
};

// Product Categories
export const PRODUCT_CATEGORIES = [
  { value: 'ELECTRONICS', label: 'Electronics' },
  { value: 'CLOTHING', label: 'Clothing' },
  { value: 'FOOD', label: 'Food & Beverages' },
  { value: 'HOME_GARDEN', label: 'Home & Garden' },
  { value: 'BEAUTY', label: 'Beauty & Personal Care' },
  { value: 'SPORTS', label: 'Sports & Outdoors' },
  { value: 'TOYS', label: 'Toys & Games' },
  { value: 'BOOKS', label: 'Books & Stationery' },
  { value: 'AUTOMOTIVE', label: 'Automotive' },
  { value: 'HEALTH', label: 'Health & Wellness' },
  { value: 'FURNITURE', label: 'Furniture' },
  { value: 'OTHER', label: 'Other' },
];

// Pagination
export const ITEMS_PER_PAGE = 12;

// Shipping Configuration
export const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 499,
  SHIPPING_CHARGE: 79,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'ecobazaar_token',
  USER: 'ecobazaar_user',
};
