# NewsVid API Design - Spring Boot Backend

## Overview
This document outlines the complete API design for the NewsVid platform with JWT authentication. The frontend communicates with a Spring Boot backend to manage user authentication, video uploads, and video feeds.

## Base URL
```
http://localhost:8080/api
```

## Authentication
All requests use JWT (JSON Web Tokens) for authentication. Include the token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication Endpoints

### 1. User Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## Video Endpoints

### 2. Get All Videos (Public)
**Endpoint:** `GET /videos?page=1&limit=12`

**Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Videos per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "id": "video-uuid",
        "title": "Breaking News: Markets Rise",
        "description": "Today's market update showing positive gains...",
        "thumbnailUrl": "https://cdn.example.com/thumbnails/video-uuid.jpg",
        "videoUrl": "https://cdn.example.com/videos/video-uuid.mp4",
        "uploader": {
          "id": "user-uuid",
          "name": "John Doe"
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "views": 1500
      }
    ],
    "total": 150
  }
}
```

---

### 3. Get Video by ID (Public)
**Endpoint:** `GET /videos/{id}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "video-uuid",
    "title": "Breaking News: Markets Rise",
    "description": "Today's market update showing positive gains...",
    "thumbnailUrl": "https://cdn.example.com/thumbnails/video-uuid.jpg",
    "videoUrl": "https://cdn.example.com/videos/video-uuid.mp4",
    "uploader": {
      "id": "user-uuid",
      "name": "John Doe"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "views": 1500
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Video not found"
}
```

---

### 4. Upload Video (Authenticated)
**Endpoint:** `POST /videos/upload`

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `title` (string, required): Video title (max 100 chars)
- `description` (string, required): Video description (max 500 chars)
- `video` (file, required): Video file (max 500MB, formats: mp4, webm, avi, etc.)
- `thumbnail` (file, required): Thumbnail image (max 5MB, formats: jpg, png, webp)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "new-video-uuid",
    "title": "Breaking News: Markets Rise",
    "description": "Today's market update showing positive gains...",
    "thumbnailUrl": "https://cdn.example.com/thumbnails/new-video-uuid.jpg",
    "videoUrl": "https://cdn.example.com/videos/new-video-uuid.mp4",
    "uploader": {
      "id": "user-uuid",
      "name": "John Doe"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "views": 0
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Unauthorized - Please login to upload videos"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Video file is too large"
}
```

---

### 5. Update Video Views (Public)
**Endpoint:** `POST /videos/{id}/views`

**Description:** Increments the view count for a video

**Response (200 OK):**
```json
{
  "success": true,
  "message": "View count updated"
}
```

---

### 6. Edit Video Details (Authenticated - Owner Only)
**Endpoint:** `PUT /videos/{id}`

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "title": "Updated Video Title",
  "description": "Updated video description..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "video-uuid",
    "title": "Updated Video Title",
    "description": "Updated video description...",
    "thumbnailUrl": "https://cdn.example.com/thumbnails/video-uuid.jpg",
    "videoUrl": "https://cdn.example.com/videos/video-uuid.mp4",
    "uploader": {
      "id": "user-uuid",
      "name": "John Doe"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "views": 1500
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "You can only edit your own videos"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Video not found"
}
```

---

### 7. Delete Video (Authenticated - Owner Only)
**Endpoint:** `DELETE /videos/{id}`

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "You can only delete your own videos"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Video not found"
}
```

---

## Data Models

### User Model
```java
@Entity
@Table(name = "users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Column(unique = true)
  private String email;

  private String password; // BCrypt hashed
  private String name;

  @Enumerated(EnumType.STRING)
  private Role role; // USER, UPLOADER, ADMIN

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
```

### Video Model
```java
@Entity
@Table(name = "videos")
public class Video {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  private String title;
  private String description;
  private String thumbnailUrl;
  private String videoUrl;

  @ManyToOne
  @JoinColumn(name = "uploader_id")
  private User uploader;

  private Long views;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
```

---

## JWT Token Details

### Token Payload Example
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "iat": 1705318200,
  "exp": 1705404600
}
```

### Token Configuration (Spring Boot)
- **Secret Key:** Should be stored in environment variables
- **Expiration Time:** 24 hours (configurable)
- **Algorithm:** HS256

---

## Security Considerations

1. **Password Hashing:** All passwords must be hashed using BCrypt
2. **HTTPS:** Always use HTTPS in production
3. **CORS:** Configure CORS properly for frontend domain
4. **Rate Limiting:** Implement rate limiting on auth endpoints
5. **Input Validation:** Validate all user inputs
6. **File Upload Security:**
   - Validate file types server-side
   - Scan uploads for malware
   - Store files securely (S3, Cloud Storage, etc.)
   - Generate unique filenames

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input or validation error
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User lacks permission for this action
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Frontend Implementation Notes

### Environment Variables Required
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Token Storage
- Store JWT in localStorage with key `authToken`
- Store user info in localStorage with key `user`
- Clear storage on logout

### Upload Progress
- Use XMLHttpRequest for upload progress tracking
- Display progress percentage to user

### Error Handling
- Display user-friendly error messages
- Log errors for debugging
- Redirect to login on 401 responses

---

## Example cURL Commands

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

### Get Videos
```bash
curl http://localhost:8080/api/videos?page=1&limit=12
```

### Upload Video
```bash
curl -X POST http://localhost:8080/api/videos/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Breaking News" \
  -F "description=News description" \
  -F "video=@video.mp4" \
  -F "thumbnail=@thumbnail.jpg"
```
