
# backend_chantier
=======
# Chantier Project

This is a full-stack application built with Spring Boot and Angular, featuring a robust backend system with security, database integration, and real-time communication capabilities.

## 🚀 Technologies Used

### Backend
- Java 21
- Spring Boot 3.2.4
- Spring Security
- Spring Data JPA
- PostgreSQL Database
- JWT Authentication
- WebSocket Support
- OpenAPI Documentation

### Frontend
- Angular 17.3.12
- TypeScript
- RxJS for reactive programming
- WebSocket client for real-time updates

## 📋 Prerequisites

- Java 21 or higher
- Node.js and npm
- PostgreSQL Database
- Maven

## 🛠️ Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd chantier_back
```

2. Backend Setup:
```bash
# Navigate to the backend directory
cd backend

# Install dependencies using Maven
mvn clean install

# Run the Spring Boot application
mvn spring-boot:run
```

3. Frontend Setup:
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
ng serve
```

## 🔧 Configuration

### Backend Configuration
The application uses Spring Boot's configuration system. Key configurations can be found in:
- `src/main/resources/application.properties` or `application.yml`

### Database Configuration
Make sure to configure your PostgreSQL database connection in the application properties:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/your_database
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## 🔐 Security

The application uses JWT (JSON Web Token) for authentication. Make sure to configure your JWT secret in the application properties:
```properties
jwt.secret=your_jwt_secret
```

## 📚 API Documentation

API documentation is available through Swagger UI when the application is running:
- Access the API documentation at: `http://localhost:8080/swagger-ui.html`

## 📁 Project Structure

```
chantier/
├── backend/           # Spring Boot backend
│   ├── src/          # Source files
│   └── pom.xml       # Maven configuration
├── frontend/         # Angular frontend
│   ├── src/         # Source files
│   │   ├── app/     # Application code
│   │   ├── assets/  # Static assets
│   │   └── environments/ # Environment configurations
│   └── package.json # NPM configuration
└── uploads/         # File uploads directory
```

## 🔄 Real-time Features

The application includes real-time notification capabilities using WebSocket:
- Backend WebSocket endpoint: `ws://localhost:8080/ws`
- Frontend WebSocket client implementation in `NotificationService`

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details. 

