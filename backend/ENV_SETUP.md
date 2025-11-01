# Environment Setup - Backend

## Required Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## Getting Your Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the following:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY` (⚠️ Keep this secret!)

## Redis Setup

### Windows

- Install [Memurai](https://www.memurai.com/) or use WSL
- Or use a cloud Redis service like [Upstash](https://upstash.com/)

### macOS/Linux

```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt install redis-server
sudo systemctl start redis
```

## Important Notes

⚠️ **NEVER commit your `.env` file to Git!**

- The `.env` file contains sensitive credentials
- It's already added to `.gitignore`
- Share credentials securely through password managers or encrypted channels

✅ **Use `.env.sample` as a template**

- Copy `.env.sample` to `.env`
- Fill in your actual values
