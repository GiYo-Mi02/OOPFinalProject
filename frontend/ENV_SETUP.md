# Environment Setup - Frontend

## Required Environment Variables

Create a `.env` file in the `frontend/` directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:3000

# Supabase Configuration (for direct client access)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Getting Your Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the following:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

## Environment-Specific Configuration

### Development

```env
VITE_API_URL=http://localhost:3000
```

### Production

```env
VITE_API_URL=https://your-production-api.com
```

## Important Notes

⚠️ **NEVER commit your `.env` file to Git!**

- The `.env` file is already added to `.gitignore`
- Even though `VITE_*` variables are exposed to the browser, keep them out of version control

⚠️ **Only use `VITE_` prefix**

- Vite only exposes variables that start with `VITE_`
- Never put service role keys in frontend (use `VITE_SUPABASE_ANON_KEY` only)

✅ **Create `.env.example` for team members**

- Share the structure without actual values
- Team members can copy and fill their own credentials
