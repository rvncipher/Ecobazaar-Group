# EcoBazaar Frontend

The frontend application for EcoBazaar - a modern e-commerce platform dedicated to sustainable and eco-friendly products. Built with React and Vite, this application provides an intuitive shopping experience for conscious consumers.

## Features

### User Experience
- **User Authentication**: Secure login and registration system with JWT
- **Responsive Design**: Mobile-first, fully responsive UI
- **User Dashboard**: Personalized user dashboard with order history
- **Profile Management**: View and update user profiles
- **Modern UI/UX**: Clean and intuitive interface with smooth transitions

### Shopping Features
- **Product Browsing**: Browse eco-friendly products with detailed information
- **Advanced Search**: Search products by keyword
- **Smart Filtering**: Filter by category, price, eco-rating, and carbon footprint
- **Product Details**: Comprehensive product information with sustainability metrics
- **Shopping Cart**: Full-featured cart with add/remove/update capabilities
- **Checkout**: Secure checkout process with order summary
- **Order Tracking**: View order history and track order status

### Seller Features
- **Seller Dashboard**: Comprehensive dashboard for managing products
- **Product Management**: Create, edit, and delete products
- **Product Form**: User-friendly form for product creation and editing
- **Status Tracking**: Track product approval status
- **Analytics**: View product statistics and performance

### Admin Features
- **Admin Dashboard**: Complete admin panel for platform management
- **User Management**: View, ban, and unban users
- **Product Approval**: Approve or reject pending products
- **Eco Certification**: Grant eco-certifications to products
- **Statistics**: View user and platform statistics
- **Seller Management**: Manage all sellers on the platform

### Sustainability Features
- **Eco Rating Badges**: Visual eco-rating indicators
- **Carbon Footprint Display**: Show environmental impact of products
- **Carbon Impact Tracking**: Track total carbon impact of purchases
- **Eco Certifications**: Display certified eco-friendly products
- **Personalized Recommendations**: Get eco-friendly product suggestions

### UI Components
- **Reusable Components**: Modular component architecture
  - Navbar with cart count
  - Loading spinner
  - Eco rating badge
  - Carbon footprint badge
- **Toast Notifications**: Real-time feedback for user actions
- **Icons**: Modern iconography with Lucide React
- **Fast Performance**: Powered by Vite for lightning-fast development and builds

## Technology Stack

- **React 18** - Modern UI library
- **Vite** - Next-generation frontend tooling
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Icon library
- **React Toastify** - Toast notifications
- **CSS3** - Styling and animations
- **ESLint** - Code quality and consistency

## Project Structure

```
src/
├── assets/             # Static assets (images, icons)
├── components/         # Reusable components
│   ├── Navbar.jsx
│   ├── Loader.jsx
│   ├── EcoRatingBadge.jsx
│   └── CarbonBadge.jsx
├── features/           # Feature-based modules
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   └── adminAPI.js
│   ├── seller/
│   │   ├── SellerDashboard.jsx
│   │   └── ProductForm.jsx
│   ├── products/
│   │   ├── ProductList.jsx
│   │   ├── ProductCard.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── SearchBar.jsx
│   │   └── productAPI.js
│   ├── cart/
│   │   └── cartAPI.js
│   ├── orders/
│   │   └── orderAPI.js
│   └── recommendations/
│       └── recommendationAPI.js
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── SignUp.jsx
│   ├── Dashboard.jsx
│   ├── Profile.jsx
│   ├── Products.jsx
│   ├── ProductDetail.jsx
│   ├── Cart.jsx
│   └── Checkout.jsx
├── services/           # API configuration
│   └── axiosInstance.js
├── utils/              # Utilities and constants
│   ├── constants.js
│   └── helpers.js
├── App.jsx             # Main app component
├── App.css             # App-level styles
├── main.jsx            # Application entry point
└── index.css           # Global styles
```

## Prerequisites

- Node.js 16.x or higher
- npm or yarn

## Setup and Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure API Endpoint**
   
   Update the API base URL in your configuration to point to the backend:
   ```javascript
   const API_URL = 'http://localhost:8080';
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   
   Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## Application Routes

| Route | Component | Description | Access |
|-------|-----------|-------------|--------|
| `/` | Home | Landing page | Public |
| `/login` | Login | User login | Public |
| `/signup` | SignUp | User registration | Public |
| `/dashboard` | Dashboard | User dashboard | Authenticated |
| `/profile` | Profile | User profile | Authenticated |
| `/products` | Products | Product catalog | Public |
| `/products/:id` | ProductDetail | Product details | Public |
| `/cart` | Cart | Shopping cart | Authenticated |
| `/checkout` | Checkout | Order checkout | Authenticated |
| `/seller/dashboard` | SellerDashboard | Seller dashboard | Seller |
| `/seller/products/new` | ProductForm | Create product | Seller |
| `/seller/products/:id/edit` | ProductForm | Edit product | Seller |
| `/admin/dashboard` | AdminDashboard | Admin panel | Admin |

## Development

This project uses:
- **Vite** for fast HMR and optimized builds
- **@vitejs/plugin-react** for Fast Refresh
- **ESLint** for code quality
- **Feature-based architecture** for better code organization
- **Axios interceptors** for automatic JWT token handling

## API Integration

The frontend integrates with the EcoBazaar Spring Boot backend through:
- **Axios Instance**: Configured with automatic JWT token injection
- **API Endpoints**: Centralized endpoint management in `constants.js`
- **Feature-based APIs**: Separate API files for each feature domain

## Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory, optimized for production deployment.

## Backend Integration

This frontend connects to the EcoBazaar Spring Boot backend API. Ensure the backend is running at `http://localhost:8080` before starting the frontend application.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)


