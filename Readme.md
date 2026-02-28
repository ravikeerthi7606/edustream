# EduStream — Learning Management System

A full-stack LMS with video streaming, built with **React + FastAPI + MongoDB**.

---

## 🏗️ Architecture

```
lms/
├── backend/                  # FastAPI application
│   ├── main.py               # App entry point + CORS
│   ├── config.py             # Settings (env-based)
│   ├── database.py           # MongoDB connection (motor async)
│   ├── models/schemas.py     # Pydantic models
│   ├── routers/
│   │   ├── auth.py           # Register / Login / Me
│   │   └── videos.py         # Upload / Stream / List / Delete
│   ├── utils/
│   │   ├── auth.py           # JWT + password hashing
│   │   └── storage.py        # Storage abstraction (local ↔ S3)
│   ├── storage/videos/       # Local video files
│   └── requirements.txt
└── frontend/                 # React + Vite
    └── src/
        ├── context/AuthContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── VideoCard.jsx
        │   ├── VideoPlayer.jsx
        │   └── ProtectedRoute.jsx
        ├── pages/
        │   ├── LoginPage.jsx    # Login + Register (student/teacher)
        │   ├── HomePage.jsx
        │   ├── StudentPage.jsx  # Browse + watch videos
        │   ├── TeacherPage.jsx  # Dashboard + manage videos
        │   └── UploadPage.jsx   # Drag-and-drop upload
        └── utils/api.js
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10
- Node.js 18+
- MongoDB running locally on port 27017 (MongoDB Compass)

### 1. Clone / Navigate to project
```bash
cd lms
chmod +x start.sh
```

### 2. Start everything
```bash
./start.sh
```
Or manually:

**Backend:**
```bash
cd backend
python3.10 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 3. Open in browser
- **App:** http://localhost:5173
- **API Docs:** http://localhost:8000/docs

---

## 🗄️ MongoDB Setup

The app auto-creates collections and indexes on startup. Just make sure MongoDB is running:

```bash
# Start MongoDB (if not running as a service)
mongod --dbpath /data/db

# Or with MongoDB Compass: connect to mongodb://localhost:27017
# Database: lms_db
```

Collections created:
- `users` — Student and teacher accounts
- `videos` — Video metadata

---

## ⚙️ Configuration

Edit `backend/.env`:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=lms_db
SECRET_KEY=your-super-secret-key-min-32-chars
STORAGE_BACKEND=local           # or "s3" when scaling
LOCAL_STORAGE_PATH=./storage/videos
MAX_VIDEO_SIZE_MB=500
```

---

## 🎥 Video Streaming

Uses **HTTP Range Requests** (RFC 7233) for efficient streaming:
- Browser sends `Range: bytes=X-Y` header
- Server responds with `206 Partial Content`
- Enables seeking, pause/resume without re-downloading

---

## ☁️ Scaling to Cloud

### MongoDB Atlas
```env
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/
```

### Video Storage → AWS S3
1. Install boto3: `pip install boto3`
2. Update `.env`:
   ```env
   STORAGE_BACKEND=s3
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   S3_BUCKET_NAME=lms-videos
   ```
3. Uncomment `S3Storage` class in `backend/utils/storage.py`
4. For streaming: use presigned URLs (already commented in `routers/videos.py`)

### Deployment (Production)
- **Backend:** AWS ECS / Railway / Render — `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Frontend:** Vercel / Netlify — `npm run build`, set `VITE_API_URL` env var
- **DB:** MongoDB Atlas (M0 free tier to start)

---

## 🔐 Auth

- JWT Bearer tokens (stored in `localStorage`)
- Passwords bcrypt-hashed
- Role-based: `student` | `teacher`
- Separate login/register flows per role

---

## 📡 API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | ❌ | Register |
| POST | `/auth/login` | ❌ | Login |
| GET | `/auth/me` | ✅ | Current user |
| POST | `/videos/upload` | Teacher | Upload video |
| GET | `/videos` | Any | List all videos |
| GET | `/videos/my` | Teacher | Teacher's videos |
| GET | `/videos/{id}` | Any | Video metadata |
| GET | `/videos/stream/{id}` | Public | Stream video |
| DELETE | `/videos/{id}` | Teacher | Delete video |

---

## 🎨 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, React Router 7, TanStack Query 5, Vite 7 |
| Styling | Pure CSS-in-JS with CSS variables (no framework) |
| Backend | FastAPI 0.129, Motor (async MongoDB), Python 3.10 |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| DB | MongoDB (local via Compass → Atlas for cloud) |
| Storage | Local filesystem → AWS S3 (pluggable) |
| Streaming | HTTP Range Requests (RFC 7233) |