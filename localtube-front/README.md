# NewsVid - News Video Platform

A modern news video sharing platform built with Next.js React frontend and Spring Boot backend, featuring JWT authentication, user video uploads, and a clean video feed interface.

## 🎬 Features

- **JWT Authentication**: Secure user registration and login
- **Video Upload**: Authenticated users can upload news videos with thumbnails
- **Video Feed**: Browse and watch news videos in a modern grid layout
- **View Tracking**: Track video views and uploader information
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Upload Protection**: Upload icon disabled for unauthenticated users
- **Upload Progress**: Real-time upload progress tracking for videos
- **Video Details**: Dedicated page for each video with metadata and player

## 🛠️ Technology Stack

### Frontend
- **Next.js 16** - React framework with Server Components
- **React 19.2** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Lucide React** - Icon library
- **date-fns** - Date formatting

### Backend (Spring Boot)
- Java 17+
- Spring Boot 3.x
- Spring Security with JWT
- JPA/Hibernate
- MySQL/PostgreSQL
- Jackson for JSON

## 📁 Project Structure

```
/
├── app/
│   ├── page.tsx           # Home/Feed page
│   ├── login/page.tsx     # Login page
│   ├── register/page.tsx  # Registration page
│   ├── upload/page.tsx    # Video upload page
│   ├── explore/page.tsx   # Explore/Browse page
│   ├── video/
│   │   └── [id]/page.tsx  # Video detail page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── navbar.tsx         # Navigation bar
│   ├── video-card.tsx     # Video card component
│   ├── video-feed.tsx     # Video feed component
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── auth-context.tsx   # Authentication context
│   ├── api-client.ts      # API client service
│   └── utils.ts           # Utility functions
├── API_DESIGN.md          # Complete API documentation
├── SETUP.md               # Setup and installation guide
├── .env.example           # Environment variables template
└── package.json           # Dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Spring Boot backend running on `http://localhost:8080`

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd newsvid-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env.local
# Edit .env.local with your API URL
```

4. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 API Documentation

The complete API design with all endpoints is available in [API_DESIGN.md](./API_DESIGN.md)

### Key Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/videos` | Get paginated videos | No |
| GET | `/videos/{id}` | Get video details | No |
| POST | `/videos/upload` | Upload new video | Yes |
| POST | `/videos/{id}/views` | Increment views | No |
| DELETE | `/videos/{id}` | Delete video | Yes |

## 🔐 Authentication Flow

1. User registers or logs in via `/register` or `/login`
2. Backend returns JWT token and user data
3. Frontend stores token in `localStorage`
4. Token is included in all authenticated requests via `Authorization` header
5. Upload functionality is disabled for unauthenticated users

### JWT Token Example
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "USER",
  "iat": 1705318200,
  "exp": 1705404600
}
```

## 📤 Video Upload

### Upload Requirements
- **Title**: Max 100 characters
- **Description**: Max 500 characters
- **Video File**: 
  - Formats: MP4, WebM, AVI, etc.
  - Max size: 500MB
  - With progress tracking
- **Thumbnail**:
  - Formats: JPG, PNG, WebP
  - Recommended: 1280x720px

### Upload Protection
- Only authenticated users can access `/upload`
- Upload button disabled (opacity-50) for logged-out users
- Automatic redirect to login for unauthorized access

## 🎨 UI Components

### Main Components
- **Navbar**: Navigation with auth status and upload button
- **VideoCard**: Displays video thumbnail, title, uploader info
- **VideoFeed**: Grid layout with pagination and loading states
- **Video Player**: Full-featured HTML5 video player

### Pages
- **Home**: Main feed with latest videos
- **Explore**: Browse all videos
- **Login**: User authentication
- **Register**: New user signup
- **Upload**: Video upload form with progress
- **Video Detail**: Single video view with player

## 🌐 Environment Variables

Create `.env.local` file:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# For production
# NEXT_PUBLIC_API_URL=https://api.yoursite.com/api
```

## 🔧 Configuration

### CORS Setup
The backend must be configured to accept requests from your frontend domain.

Example Spring Boot CORS config:
```yaml
cors:
  allowed-origins: http://localhost:3000
  allowed-methods: GET, POST, PUT, DELETE, OPTIONS
  allowed-headers: Content-Type, Authorization
```

### JWT Configuration
Backend should expose:
- Token secret (stored in environment)
- Token expiration (default 24 hours)
- Algorithm (HS256 recommended)

## 🧪 Development

### Build for Production
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

## 📱 Responsive Design

- **Mobile**: Full-width single column layout
- **Tablet**: 2-column grid
- **Desktop**: 3-4 column grid
- **Large screens**: Up to 4 columns with max-width container

## 🔒 Security Features

- **Password Hashing**: Passwords hashed with BCrypt on backend
- **JWT Tokens**: Secure token-based authentication
- **HTTPS Ready**: Configure for HTTPS in production
- **Input Validation**: Client and server-side validation
- **File Upload Security**: Type validation, size limits, virus scanning

## 📊 Performance

- **Lazy Loading**: Videos load on demand with pagination
- **Image Optimization**: Next.js Image component for thumbnails
- **Code Splitting**: Route-based code splitting
- **Caching**: Browser and API-level caching strategies

## 🐛 Troubleshooting

### CORS Errors
- Verify `NEXT_PUBLIC_API_URL` matches your backend URL
- Check backend CORS configuration
- Ensure backend is running

### Login Issues
- Clear browser localStorage
- Verify backend JWT configuration
- Check database connection

### Upload Failures
- Check file size limits
- Verify file format is supported
- Ensure backend storage path exists

See [SETUP.md](./SETUP.md) for detailed troubleshooting.

## 📖 Backend Setup

For complete backend setup instructions, see [SETUP.md](./SETUP.md)

Key steps:
1. Create Spring Boot project with required dependencies
2. Configure database (MySQL/PostgreSQL)
3. Set up JWT authentication
4. Implement endpoints from API design
5. Configure CORS and file uploads
6. Run on `http://localhost:8080`

## 🚀 Deployment

### Frontend Deployment (Vercel, Netlify, etc.)
```bash
npm run build
# Deploy using your platform's CLI or GitHub integration
```

Set environment variable:
```
NEXT_PUBLIC_API_URL=https://api.yoursite.com/api
```

### Backend Deployment
Deploy Spring Boot application to AWS, Azure, DigitalOcean, or similar.

Update frontend API URL to production backend.

## 📄 License

MIT License - feel free to use this project as a template

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions:
1. Check [API_DESIGN.md](./API_DESIGN.md) for API details
2. Check [SETUP.md](./SETUP.md) for setup help
3. Review the troubleshooting section above

---

**Built with ❤️ for modern news sharing**
