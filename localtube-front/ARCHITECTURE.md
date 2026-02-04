# NewsVid - Architecture & Design Guide

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Browser)                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React Components & Pages                    │  │
│  │  ┌────────────┐ ┌─────────────┐ ┌────────────────────┐  │  │
│  │  │  Navbar    │ │ VideoFeed   │ │   UploadPage      │  │  │
│  │  │  (Auth)    │ │ (Grid View) │ │   (Protected)     │  │  │
│  │  └────────────┘ └─────────────┘ └────────────────────┘  │  │
│  │  ┌────────────┐ ┌─────────────┐ ┌────────────────────┐  │  │
│  │  │LoginPage   │ │RegisterPage │ │ VideoDetailPage   │  │  │
│  │  └────────────┘ └─────────────┘ └────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 State Management Layer                   │  │
│  │              ┌──────────────────────────┐                │  │
│  │              │  AuthContext (JWT)       │                │  │
│  │              │  - user                  │                │  │
│  │              │  - token                 │                │  │
│  │              │  - isAuthenticated       │                │  │
│  │              │  - login/logout/register │                │  │
│  │              └──────────────────────────┘                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  API Integration Layer                   │  │
│  │                ┌────────────────────────┐                │  │
│  │                │    API Client Service   │                │  │
│  │                │  - getVideos()          │                │  │
│  │                │  - getVideoById()       │                │  │
│  │                │  - uploadVideo()        │                │  │
│  │                │  - updateVideoViews()   │                │  │
│  │                │  - deleteVideo()        │                │  │
│  │                └────────────────────────┘                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              HTTP Client with JWT Auth                   │  │
│  │         Authorization: Bearer <jwt_token>                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                   SERVER LAYER (Spring Boot)                    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  REST API Controllers                    │  │
│  │  ┌────────────────────┐ ┌──────────────────────────────┐ │  │
│  │  │  AuthController    │ │    VideoController          │ │  │
│  │  │  - register        │ │  - getVideos                │ │  │
│  │  │  - login           │ │  - getVideoById             │ │  │
│  │  └────────────────────┘ │  - uploadVideo              │ │  │
│  │                         │  - deleteVideo              │ │  │
│  │                         │  - updateVideoViews         │ │  │
│  │                         └──────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Security & Middleware Layer                │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐   │  │
│  │  │ JWT Filter  │  │ CORS Config  │  │ Error Handler │   │  │
│  │  │ (Auth)      │  │              │  │               │   │  │
│  │  └─────────────┘  └──────────────┘  └───────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Business Logic Layer (Services)             │  │
│  │  ┌──────────────────┐ ┌────────────────────────────────┐ │  │
│  │  │  AuthService     │ │    VideoService              │ │  │
│  │  │  - registerUser  │ │  - getVideos()               │ │  │
│  │  │  - authenticateUser  │  - getVideoById()          │ │  │
│  │  │  - validateToken │ │  - uploadVideo()             │ │  │
│  │  │  - generateToken │ │  - deleteVideo()             │ │  │
│  │  │  (JWT Service)   │ │  - incrementViews()          │ │  │
│  │  └──────────────────┘ └────────────────────────────────┘ │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │ Password Hashing (BCrypt)                            │ │  │
│  │  │ File Storage (S3/Local Storage)                      │ │  │
│  │  │ File Processing (Thumbnail Generation)              │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             Data Access Layer (Repositories)             │  │
│  │  ┌──────────────────┐ ┌────────────────────────────────┐ │  │
│  │  │  UserRepository  │ │    VideoRepository           │ │  │
│  │  │  - findByEmail() │ │  - findAll()                 │ │  │
│  │  │  - save()        │ │  - findById()                │ │  │
│  │  │  - deleteById()  │ │  - save()                    │ │  │
│  │  │  - exists()      │ │  - deleteById()              │ │  │
│  │  └──────────────────┘ │  - findByUploaderId()        │ │  │
│  │                       └────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Entity/Model Layer                     │  │
│  │  ┌──────────────────┐ ┌────────────────────────────────┐ │  │
│  │  │  User Entity     │ │    Video Entity              │ │  │
│  │  │  - id            │ │  - id                        │ │  │
│  │  │  - email         │ │  - title                     │ │  │
│  │  │  - password      │ │  - description               │ │  │
│  │  │  - name          │ │  - thumbnailUrl              │ │  │
│  │  │  - role          │ │  - videoUrl                  │ │  │
│  │  │  - createdAt     │ │  - uploader (User ref)       │ │  │
│  │  │  - updatedAt     │ │  - views                     │ │  │
│  │  │  (One-to-Many)   │ │  - createdAt/updatedAt      │ │  │
│  │  └──────────────────┘ └────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                             │
│                   (MySQL/PostgreSQL)                            │
│                                                                 │
│  ┌──────────────────────┐      ┌──────────────────────────┐    │
│  │   USERS TABLE        │      │    VIDEOS TABLE          │    │
│  │                      │      │                          │    │
│  │ id (UUID) [PK]       │      │ id (UUID) [PK]           │    │
│  │ email (VARCHAR) [UK] │      │ title (VARCHAR)          │    │
│  │ password (VARCHAR)   │      │ description (TEXT)       │    │
│  │ name (VARCHAR)       │      │ thumbnailUrl (VARCHAR)   │    │
│  │ role (ENUM)          │      │ videoUrl (VARCHAR)       │    │
│  │ createdAt (TIMESTAMP)│      │ uploader_id (UUID) [FK]  │    │
│  │ updatedAt (TIMESTAMP)│◄─────│ views (BIGINT)           │    │
│  │                      │      │ createdAt (TIMESTAMP)    │    │
│  └──────────────────────┘      │ updatedAt (TIMESTAMP)    │    │
│                                └──────────────────────────┘    │
│                                                                 │
│              Indices:                                           │
│              - users(email) UNIQUE                              │
│              - videos(uploader_id)                              │
│              - videos(createdAt DESC)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App
│
├─ AuthProvider
│  │
│  ├─ Navbar
│  │  ├─ Logo & Title
│  │  ├─ Navigation Links
│  │  └─ Auth Controls
│  │     ├─ Upload Button (conditional)
│  │     ├─ User Name (conditional)
│  │     └─ Login/Register/Logout (conditional)
│  │
│  └─ Page Router
│     │
│     ├─ / (Home)
│     │  ├─ Page Title & Description
│     │  └─ VideoFeed
│     │     ├─ VideoCard (grid)
│     │     │  ├─ Thumbnail Image
│     │     │  ├─ Title
│     │     │  ├─ Description
│     │     │  ├─ Uploader Info
│     │     │  ├─ View Count
│     │     │  └─ Posted Date
│     │     ├─ Load More Button
│     │     └─ Loading Skeleton
│     │
│     ├─ /explore
│     │  └─ VideoFeed (same as home)
│     │
│     ├─ /login
│     │  ├─ Form Card
│     │  ├─ Email Input
│     │  ├─ Password Input
│     │  ├─ Submit Button
│     │  ├─ Error Message
│     │  └─ Register Link
│     │
│     ├─ /register
│     │  ├─ Form Card
│     │  ├─ Name Input
│     │  ├─ Email Input
│     │  ├─ Password Input
│     │  ├─ Confirm Password Input
│     │  ├─ Submit Button
│     │  ├─ Error Message
│     │  └─ Login Link
│     │
│     ├─ /upload
│     │  ├─ Auth Check (redirect if not logged in)
│     │  ├─ Form Card
│     │  ├─ Title Input
│     │  ├─ Description Input
│     │  ├─ Video File Upload
│     │  ├─ Thumbnail File Upload
│     │  ├─ Upload Progress Bar
│     │  ├─ Success Message
│     │  └─ Error Message
│     │
│     └─ /video/[id]
│        ├─ Video Player
│        │  └─ HTML5 Video Element
│        ├─ Video Title
│        ├─ Video Metadata
│        │  ├─ Uploader Name
│        │  ├─ View Count
│        │  └─ Upload Date
│        └─ Description Card
```

---

## Data Flow Architecture

### 1. Authentication Flow

```
User Input (Login Form)
    ↓
Validation
    ↓
API Call: POST /auth/login
    ↓
Backend: Verify credentials
    ↓
Generate JWT Token
    ↓
Return token + user data
    ↓
Store in localStorage
    ↓
Update AuthContext
    ↓
Components re-render (navbar, buttons)
    ↓
Redirect to home
```

### 2. Video Upload Flow

```
User Input (Upload Form)
    ↓
Validation
    ├─ Title length check
    ├─ Description length check
    ├─ File type validation
    └─ File size validation
    ↓
Create FormData
├─ title
├─ description
├─ video file
└─ thumbnail file
    ↓
API Call: POST /videos/upload
├─ Header: Authorization: Bearer <token>
└─ Body: FormData (multipart)
    ↓
Track upload progress
├─ Update progress bar
└─ Display percentage
    ↓
Backend: Store files + metadata
    ↓
Return video object
    ↓
Show success message
    ↓
Redirect to home
    ↓
Fetch updated video feed
```

### 3. Video Viewing Flow

```
User clicks video
    ↓
Navigate to /video/[id]
    ↓
Load page with loading skeleton
    ↓
API Call: GET /videos/{id}
    ↓
API Call: POST /videos/{id}/views
    ↓
Receive video data
    ↓
Render video player
├─ Display HTML5 video element
├─ Show title & description
└─ Display metadata
    ↓
User interacts with player
├─ Play/pause
├─ Seek
├─ Volume control
└─ Fullscreen
```

### 4. Video Feed Flow

```
Component mounts
    ↓
Load page 1 with loading skeletons
    ↓
API Call: GET /videos?page=1&limit=12
    ↓
Receive video data
    ↓
Render VideoCard components in grid
    ↓
User scrolls down / clicks "Load More"
    ↓
API Call: GET /videos?page=2&limit=12
    ↓
Append to existing videos
    ↓
Update grid view
    ↓
Repeat as needed
```

---

## State Management Architecture

### AuthContext State

```typescript
interface AuthContextType {
  user: User | null              // Current user data
  token: string | null           // JWT token
  isLoading: boolean             // Auth operation in progress
  isAuthenticated: boolean       // Derived: !!user && !!token
  login: (email, password) => Promise<void>
  register: (email, password, name) => Promise<void>
  logout: () => void
}
```

### Component State

```
Page Components:
├─ LoginPage: email, password, error, loading
├─ RegisterPage: name, email, password, confirmPassword, error, loading
├─ UploadPage: title, description, videoFile, thumbnailFile, error, loading, uploadProgress
├─ VideoDetailPage: video, loading, error
└─ VideoFeedPage: videos, loading, page, hasMore

Shared: AuthContext (Authentication state)
```

---

## API Request/Response Cycle

### Request Lifecycle

```
1. Component calls API function
   ↓
2. API Client builds request
   ├─ Method (GET/POST/DELETE)
   ├─ URL
   ├─ Headers (with JWT if needed)
   └─ Body (if applicable)
   ↓
3. Fetch request sent
   ├─ Browser handles HTTP
   ├─ Network transmission
   └─ Server receives
   ↓
4. Server processes (Spring Boot)
   ├─ Validate JWT
   ├─ Check permissions
   ├─ Execute business logic
   └─ Query database
   ↓
5. Server sends response
   ├─ Status code
   ├─ Headers
   └─ JSON body
   ↓
6. Frontend receives response
   ├─ Parse JSON
   ├─ Check success flag
   └─ Extract data or error
   ↓
7. Update component state
   ├─ Set data
   ├─ Clear loading
   └─ Show error if needed
   ↓
8. Re-render component
   └─ Display updated UI
```

### Error Handling Flow

```
API Call Error
    ↓
Error caught in try/catch
    ↓
Check error type
├─ Network error? → "Unable to connect"
├─ 401 Unauthorized? → "Session expired"
├─ 400 Bad Request? → Show validation errors
└─ Other? → "An error occurred"
    ↓
Set error state
    ↓
Display error message to user
    ↓
Log error for debugging
```

---

## Security Architecture

### Frontend Security

```
Authentication
├─ JWT token in localStorage
├─ Token validation on component mount
├─ Auto-logout on token expiration
└─ Secure token transmission (HTTPS)

Authorization
├─ Route protection with isAuthenticated check
├─ UI element conditional rendering
├─ API call rejection without token
└─ Redirect to login on 401

Input Validation
├─ Client-side form validation
├─ File type checking
├─ File size limits
└─ Character limits on text inputs
```

### Backend Security (To Implement)

```
Authentication
├─ Password hashing (BCrypt)
├─ JWT generation with secret
├─ Token expiration (24 hours)
└─ Secure token validation

Authorization
├─ JWT verification on protected endpoints
├─ Role-based access control
├─ Owner-only resource deletion
└─ User isolation (can't access others' data)

API Security
├─ CORS configuration
├─ Rate limiting on auth endpoints
├─ Input validation & sanitization
├─ SQL injection prevention (ORM usage)
├─ File upload security checks
└─ HTTPS enforcement

Data Security
├─ Never expose password in responses
├─ Validate file uploads (type, size, scan)
├─ Secure file storage (S3 or similar)
├─ Database encryption at rest (if needed)
└─ Audit logging
```

---

## Performance Optimization Strategy

### Frontend Optimizations

```
Code Splitting
├─ Route-based code splitting
├─ Dynamic imports for heavy components
└─ Separate vendor bundle

Image Optimization
├─ Next.js Image component (lazy loading)
├─ Responsive image sizes
└─ CDN for thumbnail delivery

Rendering Optimization
├─ Component memoization ready
├─ Pagination instead of infinite scroll
├─ Skeleton screens for loading
└─ Conditional rendering

Bundle Size
├─ Tree-shaking unused code
├─ Minification
└─ Compression (gzip)
```

### Backend Optimizations (To Implement)

```
Database Optimization
├─ Proper indexing
├─ Query optimization
├─ Connection pooling
└─ Caching strategies

API Optimization
├─ Pagination/limiting results
├─ Field selection (GraphQL or custom)
├─ Response compression (gzip)
└─ HTTP caching headers

File Handling
├─ Async file processing
├─ CDN for file delivery
├─ Thumbnail pre-generation
└─ Video streaming (HLS/DASH)

Scaling
├─ Load balancing
├─ Database replication
├─ Cache layer (Redis)
└─ Microservices (future)
```

---

## Deployment Architecture

### Development Environment

```
Local Machine
├─ npm run dev
│  └─ Frontend on :3000
├─ Backend IDE
│  └─ Backend on :8080
└─ Local Database
   └─ MySQL/PostgreSQL
```

### Production Environment

```
Frontend (CDN + Hosting)
├─ Vercel/Netlify/AWS
├─ Static files served via CDN
└─ Environment: NEXT_PUBLIC_API_URL

Backend (Cloud Provider)
├─ AWS/Azure/GCP/DigitalOcean
├─ Containerized (Docker)
├─ Load balanced
└─ Auto-scaling

Database (Managed Service)
├─ AWS RDS / Azure Database
├─ Replicated for HA
├─ Automated backups
└─ Encrypted

File Storage (CDN)
├─ AWS S3 / Google Cloud Storage
├─ CloudFront / CDN distribution
└─ Versioning & lifecycle policies

Monitoring & Logging
├─ CloudWatch / Application Insights
├─ Error tracking (Sentry)
├─ Performance monitoring (Datadog)
└─ Centralized logging (ELK)
```

---

## Technology Selection Rationale

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js | SSR, SSG, API routes, best practices |
| UI | React 19 | Latest features, performance |
| Styling | Tailwind CSS | Utility-first, customizable, small bundle |
| Components | shadcn/ui | Accessible, customizable, no vendor lock-in |
| State | Context API | No extra dependencies, built-in to React |
| HTTP | Fetch API | Native, modern, no external library needed |
| Backend | Spring Boot | Enterprise-ready, large ecosystem, mature |
| Database | JPA/Hibernate | ORM benefits, database agnostic, security |
| Auth | JWT + Spring Security | Stateless, scalable, standard approach |
| Password | BCrypt | Industry standard, configurable rounds |

---

## Future Enhancement Opportunities

```
Phase 2: Enhanced Features
├─ Search & filtering
├─ User profiles
├─ Video categories/tags
├─ Likes & comments
├─ Subscribe to uploaders
└─ Playlists

Phase 3: Advanced Features
├─ Video recommendations
├─ Full-text search (Elasticsearch)
├─ Comments moderation
├─ User roles & permissions
├─ Admin dashboard
└─ Analytics

Phase 4: Scaling
├─ Microservices architecture
├─ Message queues (RabbitMQ)
├─ Video transcoding service
├─ Distributed caching (Redis)
├─ Database sharding
└─ Multi-region deployment
```

---

## Key Architectural Decisions

1. **Context API over Redux** - Simpler, no boilerplate, sufficient for this app
2. **Fetch over Axios** - Native API, no external dependency
3. **localStorage for persistence** - Simple for MVP, upgrade to httpOnly cookies in production
4. **Simple error handling** - User-friendly messages without complex error codes
5. **Pagination over infinite scroll** - Better performance, clearer UX
6. **Separate components** - Reusability and maintainability
7. **TypeScript everywhere** - Type safety and documentation
8. **Tailwind CSS utilities** - No custom CSS needed, consistency
9. **JWT tokens** - Stateless authentication, scalable, RESTful

---

**This architecture is designed to be simple, maintainable, and scalable!**
