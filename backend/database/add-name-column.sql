-- Add name column to users table
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/vhichhbbmwaaauaonbrd/sql/new

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
