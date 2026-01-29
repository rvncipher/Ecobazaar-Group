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

- **User Authentication & Authorization**: Secure JWT-based authentication system
  - User registration and login endpoints
  - Password encryption using BCrypt
  - Role-based access control
- **User Management**: Complete user lifecycle management
  - User profile management
  - Secure password storage
  - User repository with JPA
- **Security Configuration**: 
  - Spring Security integration
  - JWT token generation and validation
  - CORS configuration for frontend integration
  - Protected API endpoints
- **Database Integration**: MySQL database with JPA/Hibernate ORM
  - Automatic schema generation
  - Entity relationship management
  - Transaction management

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

## Project Structure

```
src/main/java/com/infosys/springboard/ecobazaar/
├── config/              # Configuration classes
│   ├── PasswordConfig.java
│   └── SecurityConfig.java
├── controller/          # REST controllers
│   └── AuthController.java
├── entity/             # JPA entities
│   └── User.java
├── repository/         # Data repositories
│   └── UserRepository.java
├── security/           # Security utilities
│   └── JwtUtil.java
└── service/            # Business logic services
```

## Development

This backend is designed to work seamlessly with the EcoBazaar React frontend. Ensure CORS is properly configured in `SecurityConfig` to allow requests from the frontend application.

## Future Enhancements

- Product catalog management
- Shopping cart functionality
- Order processing system
- Payment gateway integration
- Admin dashboard APIs
- Product review and rating system
