# Backend Implementation Guide - Updated Features

This guide covers the changes needed in your Spring Boot backend to support the updated frontend.

---

## Key Changes Summary

1. **Remove**: `POST /auth/register` endpoint
2. **Add**: `PUT /videos/{id}` endpoint for video editing
3. **Keep**: `POST /auth/login` endpoint (unchanged)

---

## 1. Remove Registration Endpoint

### Before (Delete This)
```java
@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody AuthRequest request) {
    // Registration logic here
}
```

Simply remove the register endpoint from your `AuthController`.

---

## 2. Implement Edit Video Endpoint

Add this new endpoint to your `VideoController`:

```java
@PutMapping("/{id}")
public ResponseEntity<?> updateVideoDetails(
    @PathVariable String id,
    @RequestBody UpdateVideoRequest request,
    @RequestHeader("Authorization") String token) {
    
    try {
        // 1. Extract user ID from JWT token
        String userId = jwtService.extractUserId(token);
        
        // 2. Find the video
        Video video = videoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Video not found"));
        
        // 3. Verify ownership - IMPORTANT!
        if (!video.getUploader().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                new ApiResponse(false, "You can only edit your own videos")
            );
        }
        
        // 4. Validate input
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                new ApiResponse(false, "Title is required")
            );
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                new ApiResponse(false, "Description is required")
            );
        }
        
        // 5. Update the video
        video.setTitle(request.getTitle().trim());
        video.setDescription(request.getDescription().trim());
        video.setUpdatedAt(LocalDateTime.now());
        
        Video updatedVideo = videoRepository.save(video);
        
        // 6. Return updated video
        return ResponseEntity.ok(
            new ApiResponse(true, "Video updated successfully", toVideoDTO(updatedVideo))
        );
        
    } catch (JwtException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
            new ApiResponse(false, "Invalid or expired token")
        );
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
            new ApiResponse(false, "Failed to update video: " + e.getMessage())
        );
    }
}
```

---

## 3. Create UpdateVideoRequest DTO

Add this new DTO class:

```java
package com.newsvid.dto;

public class UpdateVideoRequest {
    private String title;
    private String description;
    
    public UpdateVideoRequest() {}
    
    public UpdateVideoRequest(String title, String description) {
        this.title = title;
        this.description = description;
    }
    
    // Getters
    public String getTitle() {
        return title;
    }
    
    public String getDescription() {
        return description;
    }
    
    // Setters
    public void setTitle(String title) {
        this.title = title;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
}
```

---

## 4. Update Video Entity

Ensure your `Video` entity has these fields and they're updatable:

```java
@Entity
@Table(name = "videos")
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private String thumbnailUrl;
    
    @Column(nullable = false)
    private String videoUrl;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id", nullable = false)
    private User uploader;
    
    @Column(nullable = false)
    private Long views = 0L;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
    
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    
    public User getUploader() { return uploader; }
    public void setUploader(User uploader) { this.uploader = uploader; }
    
    public Long getViews() { return views; }
    public void setViews(Long views) { this.views = views; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
```

---

## 5. JWT Token Extraction Helper

Ensure your `JwtService` has this method:

```java
public String extractUserId(String token) {
    // Remove "Bearer " prefix if present
    String jwtToken = token.startsWith("Bearer ") ? token.substring(7) : token;
    
    try {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(Keys.hmacShaKeyFor(secretKey.getBytes()))
            .build()
            .parseClaimsJws(jwtToken)
            .getBody();
        
        return claims.getSubject(); // or claims.get("userId")
    } catch (JwtException e) {
        throw new JwtException("Invalid JWT token", e);
    }
}
```

---

## 6. VideoDTO Helper Method

In your `VideoController`, add this helper method:

```java
private VideoDTO toVideoDTO(Video video) {
    VideoDTO dto = new VideoDTO();
    dto.setId(video.getId());
    dto.setTitle(video.getTitle());
    dto.setDescription(video.getDescription());
    dto.setThumbnailUrl(video.getThumbnailUrl());
    dto.setVideoUrl(video.getVideoUrl());
    dto.setViews(video.getViews());
    dto.setCreatedAt(video.getCreatedAt());
    
    // Uploader info
    UploaderDTO uploaderDTO = new UploaderDTO();
    uploaderDTO.setId(video.getUploader().getId());
    uploaderDTO.setName(video.getUploader().getName());
    dto.setUploader(uploaderDTO);
    
    return dto;
}
```

---

## 7. Error Handling

Ensure your `GlobalExceptionHandler` covers JWT issues:

```java
@ExceptionHandler(JwtException.class)
public ResponseEntity<?> handleJwtException(JwtException ex) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
        new ApiResponse(false, "Authentication failed: " + ex.getMessage())
    );
}

@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<?> handleResourceNotFound(ResourceNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
        new ApiResponse(false, ex.getMessage())
    );
}
```

---

## 8. Testing the New Endpoint

### Using cURL

```bash
# 1. Login first to get token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Copy the token from response

# 2. Edit video details (replace with actual token and video ID)
curl -X PUT http://localhost:8080/api/videos/video-id-here \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "title": "Updated Video Title",
    "description": "This is the updated description"
  }'
```

### Expected Success Response (200 OK)
```json
{
  "success": true,
  "message": "Video updated successfully",
  "data": {
    "id": "video-id",
    "title": "Updated Video Title",
    "description": "This is the updated description",
    "thumbnailUrl": "https://...",
    "videoUrl": "https://...",
    "uploader": {
      "id": "user-id",
      "name": "John Doe"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "views": 150
  }
}
```

### Expected Error Response (403 Forbidden)
```json
{
  "success": false,
  "message": "You can only edit your own videos"
}
```

---

## 9. Database Migration (if needed)

If your videos table doesn't have `updatedAt` column, add it:

```sql
ALTER TABLE videos ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
```

---

## 10. Security Checklist

- [ ] Verify user ownership before allowing edits (CRITICAL)
- [ ] Validate JWT token in Authorization header
- [ ] Sanitize input (title and description)
- [ ] Enforce max length limits:
  - Title: max 100 characters
  - Description: max 500 characters
- [ ] Use `updatedAt` timestamp for audit trail
- [ ] Return 403 Forbidden for non-owners
- [ ] Return 401 Unauthorized for invalid/missing tokens
- [ ] Return 404 Not Found for missing videos

---

## 11. What NOT to Change

Keep these endpoints exactly as they are:
- ✅ `POST /auth/login` - No changes needed
- ✅ `GET /videos` - No changes needed
- ✅ `GET /videos/{id}` - No changes needed
- ✅ `POST /videos/upload` - No changes needed
- ✅ `POST /videos/{id}/views` - No changes needed
- ✅ `DELETE /videos/{id}` - No changes needed (but use same ownership check)

---

## Troubleshooting

### 401 Unauthorized
- Check token is included in Authorization header
- Verify JWT secret matches frontend expectations
- Check token hasn't expired

### 403 Forbidden
- Verify user ID extracted from token matches video uploader
- Check user ID is correctly stored in JWT claims

### 400 Bad Request
- Check request body has both "title" and "description"
- Ensure fields are not empty strings
- Verify JSON format is correct

### 404 Not Found
- Video ID doesn't exist
- Check video ID format matches database

---

## Complete Implementation Checklist

- [ ] Remove `/auth/register` endpoint from AuthController
- [ ] Add `/videos/{id}` PUT endpoint to VideoController
- [ ] Create `UpdateVideoRequest` DTO class
- [ ] Verify `Video` entity has updatable fields
- [ ] Add `extractUserId()` method to JwtService
- [ ] Add ownership verification in PUT endpoint
- [ ] Test with cURL
- [ ] Test from frontend UI
- [ ] Verify error handling
- [ ] Update API documentation
- [ ] Deploy to production
