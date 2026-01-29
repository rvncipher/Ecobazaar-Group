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

### Current Features
- ✅ User registration and authentication
- ✅ Secure JWT-based authorization
- ✅ User profile

### Planned Features
- 🔄 Product catalog with sustainable items
- 🔄 Advanced search and filtering
- 🔄 Shopping cart functionality
- 🔄 Secure checkout process
- 🔄 Order management and tracking
- 🔄 Product reviews and ratings
- 🔄 Seller dashboard
- 🔄 Admin panel
- 🔄 Payment gateway integration
- 🔄 Sustainability scoring for products

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

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| Vite | Build tool & dev server |
| React Router | Client-side routing |
| CSS3 | Styling |
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
│   ├── controller/          # REST API controllers
│   ├── entity/             # JPA entities
│   ├── repository/         # Database repositories
│   ├── security/           # JWT utilities
│   └── service/            # Business logic
├── src/main/resources/
│   └── application.properties
└── pom.xml
```

### Frontend Structure
```
ecobazaar-frontend/
├── src/
│   ├── assets/           # Images, icons
│   ├── pages/            # React page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── SignUp.jsx
│   │   ├── Dashboard.jsx
│   │   └── Profile.jsx
│   ├── App.jsx
│   └── main.jsx
├── public/
└── package.json
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login (returns JWT) |

*More endpoints will be added as features are developed*


## 📝 Development Roadmap

### Phase 1: Foundation (Current)
- [x] Project setup
- [x] User authentication system
- [x] Basic frontend pages
- [x] Database integration

### Phase 2: Core E-Commerce Features
- [ ] Product catalog management
- [ ] Shopping cart
- [ ] Checkout process
- [ ] Order management

### Phase 3: Enhanced Features
- [ ] Payment integration
- [ ] Review and rating system
- [ ] Advanced search and filters
- [ ] Wishlist functionality

### Phase 4: Sustainability Features
- [ ] Product sustainability scoring
- [ ] Carbon footprint calculator
- [ ] Eco-certifications display
- [ ] Sustainable shipping options

### Phase 5: Admin & Analytics
- [ ] Admin dashboard
- [ ] Seller management
- [ ] Analytics and reporting
- [ ] Inventory management

## 🐛 Known Issues

- Authentication flow needs to be fully integrated between frontend and backend
- API error handling needs enhancement
- Form validation needs to be strengthened


## 📞 Support

For issue or question raise a req!

---

**EcoBazaar** - Making Sustainable Shopping Simple 🌍
