# EcoBazaar Backend

The backend API for EcoBazaar - an e-commerce platform dedicated to sustainable and eco-friendly products. Built with Java Spring Boot, this RESTful API provides secure authentication, user management, and serves as the foundation for sustainable shopping.

## Project Structure

The project follows the standard Maven directory structure:

```
HELP.md
mvnw
mvnw.cmd
pom.xml
src/
  main/
    java/
      com/
        infosys/
          springboard/
            ecobazaar/
              EcoBazaarApplication.java
              config/
                PasswordConfig.java
                SecurityConfig.java
              controller/
                AuthController.java
              entity/
                User.java
              repository/
                UserRepository.java
              security/
                JwtUtil.java
              service/
  resources/
    application.properties
    static/
    templates/
  test/
    java/
      com/
        infosys/
          springboard/
            ecobazaar/
              EcoBazaarApplicationTests.java
```

## Key Files

### `pom.xml`
The Maven configuration file includes dependencies for:
- Spring Boot Starter Data JPA
- Spring Boot Starter Security
- Spring Boot Starter Validation
- Spring Boot Starter WebMVC

### `EcoBazaarApplication.java`
The main entry point for the Spring Boot application:
```java
@SpringBootApplication
public class EcoBazaarApplication {
    public static void main(String[] args) {
        SpringApplication.run(EcoBazaarApplication.class, args);
    }
}
```

### `application.properties`
Configuration for the application:
```properties
spring.application.name=EcoBazaar
spring.datasource.url=jdbc:mysql://localhost:3306/ecobazaar
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
server.port=8080
```

## Features

### Authentication & Security
- **User Authentication & Authorization**: Secure JWT-based authentication system
  - User registration and login endpoints
  - Password encryption using BCrypt
  - Role-based access control (User, Seller, Admin)
  - Protected API endpoints with JWT validation

### Product Management
- **Product Catalog**: Complete product lifecycle management
  - Product CRUD operations
  - Product approval workflow
  - Category-based organization
  - Search and filtering capabilities
  - Carbon footprint calculation
  - Eco-rating system
  - Price range filtering
  
### E-Commerce Core
- **Shopping Cart**: Full cart functionality
  - Add/remove products
  - Update quantities
  - Real-time cart count
  - Cart persistence
  
- **Order Management**: Complete order processing system
  - Order creation from cart
  - Order tracking and history
  - Order status updates
  - Order cancellation
  - Carbon impact tracking
  
### Admin Features
- **Admin Dashboard**: Comprehensive admin panel
  - User management (ban/unban users)
  - Product approval/rejection
  - Eco-certification management
  - User statistics and analytics
  - Seller management
  
### Seller Features
- **Seller Dashboard**: Product management for sellers
  - Manage product inventory
  - Track product approval status
  - View product analytics
  
### Sustainability
- **Carbon Calculation Service**: Environmental impact tracking
  - Product carbon footprint calculation
  - Order carbon impact aggregation
  - Eco-rating computation
  
- **Recommendation Service**: Personalized suggestions
  - Eco-friendly product recommendations
  - Personalized user recommendations

### Database & Integration
- **Database Integration**: MySQL database with JPA/Hibernate ORM
  - Automatic schema generation
  - Entity relationship management
  - Transaction management
  - CORS configuration for frontend integration

## Technology Stack

- **Java 17+**
- **Spring Boot 3.x**
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database operations
- **MySQL** - Relational database
- **JWT** - Token-based authentication
- **Maven** - Dependency management
- **BCrypt** - Password encryption

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

## Setup and Installation

1. **Database Setup**
   ```sql
   CREATE DATABASE ecobazaar;
   ```

2. **Configure Database Connection**
   
   Update `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/ecobazaar
   spring.datasource.username=YOUR_USERNAME
   spring.datasource.password=YOUR_PASSWORD
   ```

3. **Build the Project**
   ```bash
   ./mvnw clean install
   ```

4. **Run the Application**
   ```bash
   ./mvnw spring-boot:run
   ```

5. **Access the API**
   
   The server will start at `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login (returns JWT token)

### Products
- `GET /products/approved` - Get all approved products
- `GET /products/{id}` - Get product by ID
- `GET /products/search?keyword={keyword}` - Search products
- `GET /products/category/{category}` - Get products by category
- `GET /products/filter/price?min={min}&max={max}` - Filter by price range
- `GET /products/filter/carbon?max={max}` - Filter by carbon footprint
- `POST /products` - Create product (Seller)
- `PUT /products/{id}` - Update product (Seller)
- `DELETE /products/{id}` - Delete product (Seller)
- `GET /products/my-products` - Get seller's products

### Cart
- `GET /cart` - Get user's cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/{id}` - Update cart item quantity
- `DELETE /cart/items/{id}` - Remove item from cart
- `DELETE /cart` - Clear cart
- `GET /cart/count` - Get cart item count

### Orders
- `POST /orders` - Create order from cart
- `GET /orders/my-orders` - Get user's orders
- `GET /orders/{id}` - Get order by ID
- `PUT /orders/{id}/cancel` - Cancel order
- `GET /orders/my-carbon-impact` - Get total carbon impact

### Admin
- `GET /products/admin/all` - Get all products
- `GET /products/admin/pending` - Get pending products
- `PUT /products/admin/{id}/approve` - Approve product
- `PUT /products/admin/{id}/unapprove` - Unapprove product
- `PUT /products/admin/{id}/eco-certify` - Eco-certify product
- `GET /api/admin/users` - Get all users
- `GET /api/admin/sellers` - Get all sellers
- `GET /api/admin/regular-users` - Get regular users
- `GET /api/admin/statistics` - Get user statistics
- `PUT /api/admin/users/{id}/ban` - Ban user
- `PUT /api/admin/users/{id}/unban` - Unban user

### Recommendations
- `GET /recommendations` - Get personalized recommendations

## Project Structure

```
src/main/java/com/infosys/springboard/ecobazaar/
├── config/              # Configuration classes
│   ├── PasswordConfig.java
│   └── SecurityConfig.java
├── controller/          # REST controllers
│   ├── AuthController.java
│   ├── ProductController.java
│   ├── CartController.java
│   ├── OrderController.java
│   ├── AdminController.java
│   └── UserController.java
├── entity/             # JPA entities
│   ├── User.java
│   ├── Product.java
│   ├── Cart.java
│   ├── CartItem.java
│   ├── Order.java
│   └── OrderItem.java
├── repository/         # Data repositories
│   ├── UserRepository.java
│   ├── ProductRepository.java
│   ├── CartRepository.java
│   ├── CartItemRepository.java
│   ├── OrderRepository.java
│   └── OrderItemRepository.java
├── security/           # Security utilities
│   └── JwtUtil.java
└── service/            # Business logic services
    ├── ProductService.java
    ├── CartService.java
    ├── OrderService.java
    ├── AdminService.java
    ├── CarbonCalculationService.java
    └── RecommendationService.java
```

## Development

This backend is designed to work seamlessly with the EcoBazaar React frontend. Ensure CORS is properly configured in `SecurityConfig` to allow requests from the frontend application running at `http://localhost:5173`.
