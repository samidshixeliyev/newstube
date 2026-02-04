# NewsVid - Quick Start Guide

Get the NewsVid platform up and running in 5 minutes!

## ⚡ Quick Setup (Frontend Only - For Testing UI)

```bash
# 1. Install dependencies
npm install

# 2. Set environment
cp .env.example .env.local

# 3. Start dev server
npm run dev

# 4. Open browser
# http://localhost:3000
```

You'll see the UI, but uploads won't work until you set up the backend.

---

## 🏗️ Complete Setup (Frontend + Backend)

### Prerequisites
- Node.js 18+
- Java 17+
- MySQL or PostgreSQL

### Step 1: Start Frontend
```bash
cd newsvid-frontend
npm install
cp .env.example .env.local
npm run dev
# Runs on http://localhost:3000
```

### Step 2: Set Up Backend
Follow the detailed instructions in **SETUP.md**:
- Create Spring Boot project
- Configure database
- Implement API endpoints
- Run on port 8080

### Step 3: Update Environment
Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Step 4: Test Everything
1. Go to http://localhost:3000
2. Click "Login" to sign in
3. Use your credentials to login
4. Click upload icon to upload a video
5. Edit video details by clicking the Edit button
6. Watch your video in the feed!

---

## 📚 Key Files to Know

| File | Purpose |
|------|---------|
| **API_DESIGN.md** | Complete API endpoint specification |
| **SETUP.md** | Detailed setup & backend implementation |
| **README.md** | Full project documentation |
| **.env.example** | Environment variables template |
| **lib/auth-context.tsx** | Authentication system |
| **lib/api-client.ts** | API communication |
| **app/upload/page.tsx** | Video upload page |

---

## 🔑 Key Concepts

### JWT Authentication
```
1. User logs in with email/password
2. Backend sends JWT token
3. Frontend stores in localStorage
4. Include in all requests: Authorization: Bearer <token>
```

### Upload Protection
```
- Upload page checks isAuthenticated
- Upload button disabled for logged-out users
- Redirects to login if unauthorized
```

### Video Upload Flow
```
1. User selects video + thumbnail
2. Frontend shows progress bar
3. Sends to /videos/upload endpoint
4. Backend stores files
5. Returns video data
6. Frontend redirects to home
```

---

## 🧪 API Testing (With Backend Running)

### Login User
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Videos
```bash
curl http://localhost:8080/api/videos?page=1&limit=12
```

### Upload Video
```bash
# Save token from login response
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:8080/api/videos/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=My News Video" \
  -F "description=News description" \
  -F "video=@video.mp4" \
  -F "thumbnail=@thumbnail.jpg"
```

---

## 🎯 Architecture at a Glance

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌──────────────┬──────────────┬────────────────────┐   │
│  │   Navbar     │  Video Feed  │   Upload Page      │   │
│  │  (Auth UI)   │  (Grid View) │  (Form + Progress) │   │
│  └──────────────┴──────────────┴────────────────────┘   │
│                        ↓ HTTP                            │
│           API Client (with JWT token)                    │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                Backend (Spring Boot)                     │
│  ┌──────────────┬──────────────┬────────────────────┐   │
│  │   Auth       │    Video     │    Database        │   │
│  │  (JWT)       │  (Upload/Get)│  (MySQL/Postgres)  │   │
│  └──────────────┴──────────────┴────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Component Hierarchy

```
App
├── AuthProvider
│   ├── Navbar
│   │   ├── Upload Button (disabled if no auth)
│   │   └── Auth Links (Login/Logout)
│   └── Pages
│       ├── Home/Explore
│       │   └── VideoFeed
│       │       └── VideoCard (multiple)
│       ├── Upload
│       │   └── Form (title, description, files)
│       ├── Login
│       │   └── Auth Form
│       └── Video Detail
│           ├── Video Player
│           └── Edit Modal (owner only)
```

---

## 🔧 Customization Quick Tips

### Change Upload File Size Limit
**Frontend** (`app/upload/page.tsx`):
```typescript
if (file.size > 500 * 1024 * 1024) {  // Change this
  setError('File too large');
}
```

### Change Grid Layout
**Frontend** (`components/video-feed.tsx`):
```tsx
// Change this line:
// grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
// To your preferred layout
```

### Change API URL
**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=your-new-url
```

### Change Token Expiration
**Backend** (`application.yml`):
```yaml
jwt:
  expiration: 86400000  # Change this (milliseconds)
```

---

## 🚨 Troubleshooting

### Frontend shows blank page
- Check browser console (F12)
- Verify backend URL in `.env.local`
- Run `npm run dev` again

### Can't upload video
- Is backend running? Check http://localhost:8080
- Are you logged in? Check navbar
- Check browser console for error details

### API returns 401 (Unauthorized)
- Token might be expired
- Logout and login again
- Check JWT secret matches backend

### Upload button disabled
- Login first
- Refresh page
- Clear browser storage and try again

### Database connection error
- Is database service running?
- Check connection string in backend config
- Verify username/password

---

## 📞 Need Help?

1. **Frontend Issues** → Check console (F12)
2. **API Issues** → Test with cURL commands above
3. **Backend Issues** → Check backend logs
4. **Setup Issues** → Read SETUP.md in detail
5. **API Questions** → Read API_DESIGN.md in detail

---

## ✨ What You Can Do Right Now

### With Frontend Only (No Backend)
- ✅ See the UI layout
- ✅ Test navigation
- ✅ Test form validation
- ✅ Test responsive design
- ❌ Login/Register (won't work)
- ❌ Upload videos (won't work)

### With Frontend + Backend
- ✅ Login/Logout
- ✅ Upload videos
- ✅ Edit video details
- ✅ Watch videos
- ✅ Browse video feed
- ✅ See upload progress
- ✅ Track views

---

## 🚀 Deployment Checklist

### Before Going Live
- [ ] Backend running on production server
- [ ] Database backed up
- [ ] Environment variables set correctly
- [ ] HTTPS enabled
- [ ] CORS configured for production domain
- [ ] Upload storage configured (S3, etc.)
- [ ] JWT secret is strong and secure
- [ ] Rate limiting enabled
- [ ] Monitoring/logging set up
- [ ] Tested on real backend

### Deploy Frontend
```bash
npm run build
# Deploy the .next folder to your hosting
# OR use Vercel/Netlify git integration
```

### Deploy Backend
```bash
# Build JAR file
mvn clean package

# Deploy JAR file to server
# Configure environment variables
# Restart application
```

---

## 📊 Project Stats

- **Frontend Code**: ~1,500 lines
- **Components**: 6 main components
- **Pages**: 6 pages
- **API Integration**: 5+ endpoints
- **Documentation**: 1,500+ lines
- **Setup Time**: 5-10 minutes (frontend only)
- **Backend Setup**: 1-2 hours

---

## 🎓 Learning Path

1. **Understand the UI** → Explore app at http://localhost:3000
2. **Read API Design** → Study API_DESIGN.md
3. **Implement Backend** → Follow SETUP.md
4. **Test Integration** → Use provided cURL commands
5. **Deploy** → Follow deployment checklist

---

## 💡 Pro Tips

- Use `npm run build && npm run start` to test production build locally
- Use browser DevTools to debug API calls (Network tab)
- Keep backend logs open while testing
- Use a REST client (Postman, Insomnia) to test API before frontend
- Clear localStorage if auth seems broken: `localStorage.clear()`
- Check network tab in DevTools to see all API calls

---

**Ready to start? Run `npm install && npm run dev` now!** 🚀

Questions? Read the full documentation files (API_DESIGN.md, SETUP.md, README.md)
