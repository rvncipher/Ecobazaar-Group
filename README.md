# EcoBazaar - Sustainable E-Commerce Platform

EcoBazaar is a full-stack e-commerce platform dedicated to promoting sustainable living by providing a marketplace for eco-friendly and sustainable products. The platform connects conscious consumers with sellers offering environmentally responsible products, making it easier to make sustainable purchasing decisions.

## 🌱 Project Vision

EcoBazaar aims to create a digital marketplace where sustainability meets convenience. By focusing exclusively on eco-friendly products, we're building a community of environmentally conscious buyers and sellers committed to reducing their environmental impact.

## 🏗️ Architecture

EcoBazaar follows a modern microservices architecture with a clear separation between frontend and backend:

```
EcoBazaar/
├── ecobazaar/              # Spring Boot Backend API
└── ecobazaar-frontend/     # React Frontend Application
```

### Backend (Spring Boot)
- **Technology**: Java Spring Boot
- **Database**: MySQL
- **Authentication**: JWT-based security
- **Port**: 8080
- **API Style**: RESTful

### Frontend (React + Vite)
- **Technology**: React 18 with Vite
- **Routing**: React Router
- **Port**: 5173 (development)
- **Build Tool**: Vite

## ✨ Key Features

### Authentication & User Management
- ✅ User registration and authentication with JWT
- ✅ Role-based access control (User, Seller, Admin)
- ✅ Secure password encryption with BCrypt
- ✅ User profile management
- ✅ User dashboard

### Product Management
- ✅ Product catalog with eco-friendly items
- ✅ Product creation and management (Sellers)
- ✅ Product approval workflow (Admin)
- ✅ Advanced search and filtering
  - Search by keyword
  - Filter by category
  - Filter by price range
  - Filter by eco-rating
  - Filter by carbon footprint
- ✅ Product details with sustainability metrics
- ✅ Eco-certification badges

### Shopping Experience
- ✅ Shopping cart functionality
- ✅ Add/remove items from cart
- ✅ Update cart item quantities
- ✅ Real-time cart count
- ✅ Secure checkout process
- ✅ Order creation and management

### Order Management
- ✅ Order tracking and history
- ✅ Order status updates
- ✅ Order cancellation
- ✅ Carbon footprint tracking per order
- ✅ Total environmental impact tracking

### Seller Features
- ✅ Seller dashboard
- ✅ Product inventory management
- ✅ Product status tracking (Pending/Approved)
- ✅ Product analytics
- ✅ CRUD operations for products

### Admin Features
- ✅ Admin dashboard
- ✅ User management system
- ✅ Product approval/rejection
- ✅ Eco-certification management
- ✅ User statistics and analytics
- ✅ Seller management
- ✅ Order oversight

### Sustainability Features
- ✅ Carbon footprint calculation for products
- ✅ Eco-rating system
- ✅ Sustainability badges and certifications
- ✅ Environmental impact tracking
- ✅ Carbon-based product filtering

### Recommendations
- ✅ Personalized product recommendations
- ✅ Eco-friendly alternative suggestions

## 🛠️ Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Java 17+ | Programming language |
| Spring Boot 3.x | Application framework |
| Spring Security | Authentication & authorization |
| Spring Data JPA | Database ORM |
| MySQL | Relational database |
| JWT | Token-based authentication |
| Maven | Build & dependency management |
| BCrypt | Password encryption |
| Hibernate | ORM implementation |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| Vite | Build tool & dev server |
| React Router | Client-side routing |
| Axios | HTTP client |
| CSS3 | Styling |
| Lucide React | Icon library |
| React Toastify | Notifications |
| ESLint | Code quality |

## 🚀 Getting Started

### Prerequisites

**Backend:**
- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

**Frontend:**
- Node.js 16.x or higher
- npm or yarn

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd Springboot
```

#### 2. Database Setup
```sql
CREATE DATABASE ecobazaar;
```

#### 3. Backend Setup

```bash
cd ecobazaar

# Update application.properties with your MySQL credentials
# src/main/resources/application.properties

# Build and run
./mvnw clean install
./mvnw spring-boot:run
```

Backend will be available at `http://localhost:8080`

#### 4. Frontend Setup

```bash
cd ecobazaar-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 📁 Project Structure

### Backend Structure
```
ecobazaar/
├── src/main/java/com/infosys/springboard/ecobazaar/
│   ├── config/              # Security & app configuration
│   │   ├── PasswordConfig.java
│   │   └── SecurityConfig.java
│   ├── controller/          # REST API controllers
│   │   ├── AuthController.java
│   │   ├── ProductController.java
│   │   ├── CartController.java
│   │   ├── OrderController.java
│   │   ├── AdminController.java
│   │   └── UserController.java
│   ├── entity/             # JPA entities
│   │   ├── User.java
│   │   ├── Product.java
│   │   ├── Cart.java
│   │   ├── CartItem.java
│   │   ├── Order.java
│   │   └── OrderItem.java
│   ├── repository/         # Database repositories
│   ├── security/           # JWT utilities
│   │   └── JwtUtil.java
│   └── service/            # Business logic
│       ├── ProductService.java
│       ├── CartService.java
│       ├── OrderService.java
│       ├── AdminService.java
│       ├── CarbonCalculationService.java
│       └── RecommendationService.java
├── src/main/resources/
│   └── application.properties
└── pom.xml
```

### Frontend Structure
```
ecobazaar-frontend/
├── src/
│   ├── assets/             # Images, icons
│   ├── components/         # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Loader.jsx
│   │   ├── EcoRatingBadge.jsx
│   │   └── CarbonBadge.jsx
│   ├── features/           # Feature-based modules
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── adminAPI.js
│   │   ├── seller/
│   │   │   ├── SellerDashboard.jsx
│   │   │   └── ProductForm.jsx
│   │   ├── products/
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── productAPI.js
│   │   ├── cart/
│   │   │   └── cartAPI.js
│   │   ├── orders/
│   │   │   └── orderAPI.js
│   │   └── recommendations/
│   │       └── recommendationAPI.js
│   ├── pages/              # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── SignUp.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Profile.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   └── Checkout.jsx
│   ├── services/           # API configuration
│   │   └── axiosInstance.js
│   ├── utils/              # Utilities and constants
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── App.jsx
│   └── main.jsx
├── public/
│   └── img_assets/
└── package.json
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login (returns JWT) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products/approved` | Get all approved products |
| GET | `/products/{id}` | Get product by ID |
| GET | `/products/search?keyword={keyword}` | Search products |
| GET | `/products/category/{category}` | Get products by category |
| GET | `/products/filter/price?min={min}&max={max}` | Filter by price range |
| GET | `/products/filter/carbon?max={max}` | Filter by carbon footprint |
| POST | `/products` | Create product (Seller) |
| PUT | `/products/{id}` | Update product (Seller) |
| DELETE | `/products/{id}` | Delete product (Seller) |
| GET | `/products/my-products` | Get seller's products |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cart` | Get user's cart |
| POST | `/cart/items` | Add item to cart |
| PUT | `/cart/items/{id}` | Update cart item quantity |
| DELETE | `/cart/items/{id}` | Remove item from cart |
| DELETE | `/cart` | Clear cart |
| GET | `/cart/count` | Get cart item count |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create order from cart |
| GET | `/orders/my-orders` | Get user's orders |
| GET | `/orders/{id}` | Get order by ID |
| PUT | `/orders/{id}/cancel` | Cancel order |
| GET | `/orders/my-carbon-impact` | Get total carbon impact |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products/admin/all` | Get all products |
| GET | `/products/admin/pending` | Get pending products |
| PUT | `/products/admin/{id}/approve` | Approve product |
| PUT | `/products/admin/{id}/unapprove` | Unapprove product |
| PUT | `/products/admin/{id}/eco-certify` | Eco-certify product |
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/sellers` | Get all sellers |
| GET | `/api/admin/regular-users` | Get regular users |
| GET | `/api/admin/statistics` | Get user statistics |
| PUT | `/api/admin/users/{id}/ban` | Ban user |
| PUT | `/api/admin/users/{id}/unban` | Unban user |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recommendations` | Get personalized recommendations |


## 📝 Development Status

### Completed Features
- ✅ **Authentication System**: Complete user authentication with JWT
- ✅ **User Management**: Profile management and role-based access control
- ✅ **Product Catalog**: Full CRUD operations with approval workflow
- ✅ **Search & Filter**: Advanced product filtering and search capabilities
- ✅ **Shopping Cart**: Complete cart functionality
- ✅ **Order System**: Order creation, tracking, and management
- ✅ **Seller Dashboard**: Product management for sellers
- ✅ **Admin Dashboard**: Complete admin panel with user and product management
- ✅ **Sustainability Features**: Carbon footprint tracking and eco-ratings
- ✅ **Recommendations**: Personalized product recommendations

### Upcoming Features
- 🔄 Payment gateway integration
- 🔄 Product reviews and ratings system
- 🔄 Wishlist functionality
- 🔄 Email notifications
- 🔄 Advanced analytics dashboard
- 🔄 Multi-image product gallery
- 🔄 Inventory management system
- 🔄 Shipping integration

## 🧪 Testing

The project includes comprehensive testing documentation:
- Unit tests for backend services
- Integration tests for API endpoints
- Frontend component testing
- End-to-end testing scenarios

Refer to the `/Testing` directory for detailed test cases and results.
[Currently in development, will be available later]


## 📞 Support

For issue or question raise a req!

---

**EcoBazaar** - Making Sustainable Shopping Simple 🌍
