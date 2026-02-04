# NewsVid - Setup Guide

## Frontend Setup (Next.js/React)

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn
- A running Spring Boot backend (see Backend Setup below)

### Installation

1. **Clone or Download the Project**
```bash
cd your-project-directory
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment Variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

For production, update this to your actual backend URL:
```env
NEXT_PUBLIC_API_URL=https://your-production-api.com/api
```

4. **Start the Development Server**
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Build for Production
```bash
npm run build
npm run start
```

---

## Backend Setup (Spring Boot)

### Prerequisites
- Java 17 or higher
- MySQL or PostgreSQL database
- Maven or Gradle

### Project Structure Expected

```
your-backend-project/
├── src/main/java/
│   └── com/newsvid/
│       ├── controller/
│       │   ├── AuthController.java
│       │   └── VideoController.java
│       ├── service/
│       │   ├── AuthService.java
│       │   ├── VideoService.java
│       │   └── JwtService.java
│       ├── model/
│       │   ├── User.java
│       │   ├── Video.java
│       │   └── Role.java
│       ├── repository/
│       │   ├── UserRepository.java
│       │   └── VideoRepository.java
│       ├── config/
│       │   ├── JwtConfig.java
│       │   ├── SecurityConfig.java
│       │   └── CorsConfig.java
│       ├── exception/
│       │   └── GlobalExceptionHandler.java
│       ├── dto/
│       │   ├── AuthRequest.java
│       │   ├── AuthResponse.java
│       │   ├── VideoDTO.java
│       │   └── ApiResponse.java
│       └── NewsvidApplication.java
├── src/main/resources/
│   ├── application.properties
│   └── application.yml
├── pom.xml
└── README.md
```

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Videos Table
```sql
CREATE TABLE videos (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url VARCHAR(255),
  video_url VARCHAR(255) NOT NULL,
  uploader_id VARCHAR(36) NOT NULL,
  views BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_uploader_id ON videos(uploader_id);
CREATE INDEX idx_created_at ON videos(created_at DESC);
```

### Spring Boot Dependencies (pom.xml)

```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <!-- Database -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.33</version>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.3</version>
    </dependency>

    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>

    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>

    <!-- Lombok (optional, for reducing boilerplate) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>

    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Application Configuration (application.yml)

```yaml
spring:
  application:
    name: newsvid-api
  datasource:
    url: jdbc:mysql://localhost:3306/newsvid_db
    username: root
    password: your_db_password
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
    show-sql: false
  servlet:
    multipart:
      max-file-size: 500MB
      max-request-size: 500MB

server:
  port: 8080
  servlet:
    context-path: /

# JWT Configuration
jwt:
  secret: your-secret-key-at-least-32-characters-long
  expiration: 86400000  # 24 hours in milliseconds

# CORS Configuration
cors:
  allowed-origins: http://localhost:3000, http://localhost:3001
  allowed-methods: GET, POST, PUT, DELETE, OPTIONS
  allowed-headers: Content-Type, Authorization
  allow-credentials: true
```

### Key Spring Boot Components

#### JwtUtil (JWT Token Generation & Validation)
- Generate tokens after successful authentication
- Validate tokens in requests
- Extract user information from tokens

#### SecurityConfig (Spring Security)
- Configure CORS settings
- Set up JWT authentication filter
- Protect endpoints with authentication requirements

#### CorsConfig
- Allow frontend requests from specified origins
- Handle preflight requests

#### AuthController
- `POST /api/auth/login` - User login with JWT token generation

#### VideoController
- `GET /api/videos` - Get paginated videos
- `GET /api/videos/{id}` - Get single video
- `POST /api/videos/upload` - Upload new video (authenticated)
- `PUT /api/videos/{id}` - Edit video details (authenticated, owner only)
- `DELETE /api/videos/{id}` - Delete video (authenticated, owner only)
- `POST /api/videos/{id}/views` - Increment view count

### Running the Backend

1. **Start the application:**
```bash
mvn spring-boot:run
```

Or use your IDE's run button.

2. **Verify it's running:**
```bash
curl http://localhost:8080/api/videos
```

---

## Integration Checklist

- [ ] Backend is running on `http://localhost:8080`
- [ ] Frontend is running on `http://localhost:3000`
- [ ] `.env.local` is configured with correct API URL
- [ ] Database is created and migrations applied
- [ ] JWT secret is configured in backend
- [ ] CORS is properly configured
- [ ] File upload destination is configured (S3, local storage, etc.)

---

## Troubleshooting

### CORS Errors
- Verify `NEXT_PUBLIC_API_URL` matches backend URL
- Check backend CORS configuration
- Ensure backend is running and accessible

### Authentication Issues
- Check JWT secret is consistent in backend
- Verify token expiration times
- Clear localStorage and try login again

### Upload Issues
- Verify file size limits match backend configuration
- Check file upload destination directory permissions
- Ensure content types are allowed

### Database Connection
- Verify database is running
- Check connection string in `application.yml`
- Verify database user credentials

---

## Deployment

### Frontend (Vercel, Netlify, etc.)
1. Set environment variable `NEXT_PUBLIC_API_URL` to production backend URL
2. Deploy to hosting platform
3. Test all functionality with production backend

### Backend (AWS, Azure, DigitalOcean, etc.)
1. Configure database on production
2. Set JWT secret and other sensitive values in environment
3. Update CORS allowed origins
4. Deploy application
5. Update frontend's `NEXT_PUBLIC_API_URL`

---

## Support

For issues or questions, check the API_DESIGN.md file for detailed endpoint documentation.
