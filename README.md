# 🗳️ UMakEBallot - University of Makati Voting System

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)]()
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)]()
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)]()
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)]()
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)]()

A secure, real-time voting system built for the University of Makati (UMak). Features college-based voting, live leaderboards, Redis caching, and comprehensive administrative controls.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Security](#-security)
- [Contributing](#-contributing)

---

## ✨ Features

### 🎓 For Students

- **Email/OTP Authentication** - Secure login via Supabase Auth
- **College Selection** - One-time institute assignment with confirmation
- **Real-time Leaderboard** - Auto-refreshing every 5 seconds
- **Secure Voting** - One vote per user, college-restricted
- **Vote or Abstain** - Freedom of choice with audit trail

### 👨‍💼 For Administrators

- **Candidate Management** - CRUD operations for all candidates
- **Multi-Institute Support** - 17 colleges and institutes
- **Vote Monitoring** - Real-time statistics and analytics
- **User Management** - View and manage voters

### 🚀 Technical Features

- **Redis Caching** - High-performance vote counting (<10ms response)
- **Row Level Security** - Database-level access control
- **Real-time Updates** - Live data synchronization
- **Type Safety** - Full TypeScript coverage
- **Clustered Backend** - Multi-core utilization

---

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** - Fast build tool
- **TanStack Query** - Server state management
- **TailwindCSS** - Utility-first styling
- **React Router** - Client-side routing
- **Lucide React** - Icon library

### Backend

- **Node.js** with Express 5.1
- **TypeScript** - Type-safe development
- **Supabase** - PostgreSQL database + Auth
- **Redis** - In-memory caching
- **Cluster Mode** - Horizontal scaling

### Database & Infrastructure

- **PostgreSQL** (Supabase) - Primary database
- **Redis** - Cache layer
- **Supabase Storage** - Image uploads
- **JWT** - Authentication tokens

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Redis** server (local or cloud)
- **Supabase** account
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/GiYo-Mi02/OOPFinalProject.git
cd OOPFinalProject
```

### 2. Backend Setup

```bash
cd backend
npm install
```

**Create `.env` file:**

```bash
cp .env.sample .env
```

Edit `.env` with your credentials:

```env
PORT=3000
NODE_ENV=development

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

CORS_ORIGIN=http://localhost:5173
```

**Run database migrations:**

```bash
# Execute add-institutes.sql in Supabase SQL Editor
```

**Start backend:**

```bash
npm run dev        # Development mode
npm run build      # Production build
npm start          # Production with clustering
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

**Create `.env` file:**

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Start frontend:**

```bash
npm run dev        # Development mode
npm run build      # Production build
```

### 4. Redis Setup

**macOS:**

```bash
brew install redis
brew services start redis
```

**Linux:**

```bash
sudo apt install redis-server
sudo systemctl start redis
```

**Windows:**

- Install [Memurai](https://www.memurai.com/)
- Or use cloud Redis like [Upstash](https://upstash.com/)

### 5. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Default Admin:** Login with admin email (configure in Supabase)

---

## 📁 Project Structure

```
UMakEBallot/
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Auth & validation
│   │   └── utils/             # Helper functions
│   ├── .env.sample           # Environment template
│   └── add-institutes.sql    # Database migrations
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── contexts/         # React contexts
│   │   ├── api/              # API integration
│   │   ├── hooks/            # Custom hooks
│   │   └── utils/            # Utilities
│   └── .env.example          # Environment template
│
├── DOCUMENTATION.md           # Complete system docs
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

---

## 📖 Documentation

Comprehensive documentation is available in [`DOCUMENTATION.md`](./DOCUMENTATION.md), including:

- **System Architecture** - Technology stack and design
- **OOP Concepts** - Implementation patterns and principles
- **API Reference** - All endpoints with examples
- **Database Schema** - Tables, relationships, and RLS policies
- **Authentication Flow** - Login and authorization
- **Security Features** - Protection mechanisms
- **Deployment Guide** - Production setup

---

## 🔒 Security

### Critical Security Practices

✅ **Environment Variables**

- `.env` files are **never** committed to Git
- Use `.env.sample` as a template
- Rotate credentials regularly

✅ **Authentication**

- OTP-based login (no passwords)
- JWT tokens with expiration
- Secure session management

✅ **Database Security**

- Row Level Security (RLS) policies active
- Parameterized queries (SQL injection prevention)
- One vote per user (database constraint)

✅ **API Security**

- CORS restricted to allowed origins
- Helmet.js security headers
- Request validation on all endpoints

⚠️ **If you accidentally committed `.env` files:**

```bash
# Remove from Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env frontend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (⚠️ coordinate with team first!)
git push origin --force --all
```

---

## 🎯 Key Features Explained

### Real-time Leaderboard

```typescript
// Auto-refresh every 5 seconds
const query = useQuery({
  queryKey: ["leaderboard", instituteId],
  queryFn: () => fetchLeaderboard(instituteId),
  refetchInterval: 5000,
});
```

### Redis Caching

```typescript
// Cache leaderboard for 5 seconds
await redis.setex(`leaderboard:${instituteId}`, 5, JSON.stringify(data));
```

### College Isolation

- Users locked to their selected college
- Cannot view other institutes' data
- RLS policies enforce at database level

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Load Testing

```bash
cd backend
npm run test:load
```

---

## 🚀 Deployment

### Production Checklist

#### Backend

- [ ] Set `NODE_ENV=production`
- [ ] Configure production Redis (TLS)
- [ ] Update CORS origins
- [ ] Enable rate limiting
- [ ] Set up PM2 or Docker
- [ ] Configure reverse proxy (Nginx)
- [ ] Enable HTTPS

#### Frontend

- [ ] Build: `npm run build`
- [ ] Set production API URL
- [ ] Deploy to CDN (Vercel/Netlify)
- [ ] Configure caching headers
- [ ] Enable HTTPS

### Recommended Hosting

- **Frontend:** Vercel, Netlify, Cloudflare Pages
- **Backend:** Railway, Render, Fly.io
- **Database:** Supabase (hosted)
- **Redis:** Upstash, Redis Cloud

---

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Proprietary - University of Makati  
All rights reserved.

---

## 🆘 Support

For technical support or questions:

- **Email:** support@umak.edu.ph
- **GitHub Issues:** [Create an issue](https://github.com/GiYo-Mi02/OOPFinalProject/issues)
- **Documentation:** See [DOCUMENTATION.md](./DOCUMENTATION.md)

---

## 🏫 About

**University of Makati (UMak)**  
Developed by: UMak Development Team  
Year: 2025

### Supported Colleges & Institutes

**Colleges (9):**

- CCIS - College of Computing and Information Sciences
- CTE - College of Teacher Education
- CoE - College of Engineering
- CBA - College of Business and Accountancy
- CHTM - College of Hospitality and Tourism Management
- CoN - College of Nursing
- CASS - College of Arts, Sciences and Sports
- CoL - College of Law
- CHS - College of Health Sciences

**Institutes (8):**

- IOS - Institute of Open Studies
- IET - Institute of Educational Technology
- GS - Graduate School
- OVP-RIE - Office of the Vice President for Research, Innovation and Extension
- ITL - Institute of Technology for Learning
- CMTO - Creative Multimedia and Technology Office
- IPA - Institute of Public Administration
- IPR - Institute for Peace Research

---

**Built with ❤️ at the University of Makati**
