# Database Setup Guide

## 📋 Overview

This folder contains SQL scripts to set up and populate your UMakEBallot database in Supabase.

## 🗂️ Files

### 1. `schema.sql` ✅

**Complete database schema** - Already exists in your database

- All tables (users, elections, positions, candidates, votes)
- Indexes for performance
- Triggers for timestamps
- Row Level Security (RLS) policies

### 2. `seed-positions.sql` 🆕

**Add positions to an existing election**

- Adds all 11 standard student council positions
- Safe to run multiple times (ON CONFLICT DO NOTHING)

**Usage:**

```sql
-- Step 1: Find your election ID
SELECT id, title FROM elections ORDER BY created_at DESC LIMIT 5;

-- Step 2: Edit the script and replace 'YOUR_ELECTION_ID_HERE' with the actual UUID

-- Step 3: Run the script in Supabase SQL Editor
```

### 3. `sample-data.sql` 🆕

**Complete test data setup**

- Creates a sample election
- Adds all 11 positions
- Creates 6 sample candidates
- Creates test users

**Usage:**

```sql
-- Just run this entire script in Supabase SQL Editor
-- It will create everything automatically!
```

### 4. `create-admin.sql`

**Create admin user**

- Creates an admin account for testing

## 🚀 Quick Start

### Option A: Start Fresh with Sample Data

If you want to test the system with sample data:

```sql
-- Run this in Supabase SQL Editor:
-- File: sample-data.sql
```

This creates:

- ✅ 1 Active Election
- ✅ 11 Positions
- ✅ 6 Sample Candidates
- ✅ 4 Test Users

### Option B: Add Positions to Existing Election

If you already have an election and just need positions:

```sql
-- 1. Find your election ID:
SELECT id, title FROM elections ORDER BY created_at DESC;

-- 2. Edit seed-positions.sql
--    Replace 'YOUR_ELECTION_ID_HERE' with the actual UUID

-- 3. Run seed-positions.sql
```

## 📊 Database Structure

```
users
├── id (UUID)
├── email (TEXT, UNIQUE)
├── name (TEXT)
├── role (admin/student)
└── institute_id (TEXT)

elections
├── id (UUID)
├── title (TEXT)
├── institute_id (TEXT)
├── start_date (TIMESTAMP)
├── end_date (TIMESTAMP)
└── status (upcoming/active/completed)

positions
├── id (UUID)
├── election_id (UUID → elections.id)
├── title (TEXT)
└── display_order (INTEGER)

candidates
├── id (UUID)
├── position_id (UUID → positions.id)
├── name (TEXT)
├── platform (TEXT) -- Format: description|pastLeadership|grades|qualifications
└── image_url (TEXT)

votes
├── id (UUID)
├── user_id (UUID → users.id)
├── election_id (UUID → elections.id)
├── position_id (UUID → positions.id)
├── candidate_id (UUID → candidates.id)
└── UNIQUE(user_id, election_id, position_id)
```

## 🎯 Standard Positions

The system includes 11 standard student council positions:

1. Chairperson
2. Vice Chairperson
3. Secretary
4. Treasurer
5. Auditor
6. 1st Year Representative
7. 2nd Year Representative
8. 3rd Year Representative
9. 4th Year Representative
10. Public Relations Officer
11. Representative

## 🔧 Verification Queries

After running the scripts, verify your data:

```sql
-- Check elections
SELECT * FROM elections ORDER BY created_at DESC;

-- Check positions for an election
SELECT p.title, p.display_order, COUNT(c.id) as candidate_count
FROM positions p
LEFT JOIN candidates c ON p.id = c.position_id
WHERE p.election_id = 'YOUR_ELECTION_ID'
GROUP BY p.id, p.title, p.display_order
ORDER BY p.display_order;

-- Check candidates
SELECT p.title as position, c.name, c.platform
FROM candidates c
JOIN positions p ON c.position_id = p.id
ORDER BY p.display_order, c.name;

-- Check votes
SELECT COUNT(*) as total_votes FROM votes;
```

## 🔐 Security Notes

- All tables have Row Level Security (RLS) enabled
- Students can only vote once per position per election (enforced by UNIQUE constraint)
- Cascade deletes are configured (deleting an election removes all related data)

## 📝 Notes

- **Platform field format**: `description|pastLeadership|grades|qualifications`
- All timestamps are stored with timezone (TIMESTAMP WITH TIME ZONE)
- UUIDs are auto-generated with `gen_random_uuid()`
- The `updated_at` field auto-updates via triggers

## 💡 Tips

1. **For Development**: Use `sample-data.sql` to quickly set up test data
2. **For Production**: Create elections via the admin UI, then use `seed-positions.sql` or the "Add Common Positions" button in the UI
3. **Custom Positions**: You can add custom positions via the UI's "Add Single Position" feature

## 🆘 Troubleshooting

**Error: "Election not found"**

- Make sure you replaced `YOUR_ELECTION_ID_HERE` with an actual UUID from your elections table

**Error: "Duplicate key violation"**

- Positions already exist - this is safe to ignore
- Or use `ON CONFLICT DO NOTHING` (already included in scripts)

**No positions showing in UI**

- Make sure you selected the correct election
- Check that positions exist: `SELECT * FROM positions WHERE election_id = 'YOUR_ID';`
- Verify the frontend is connected to the correct Supabase project
