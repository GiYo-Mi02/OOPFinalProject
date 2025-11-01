-- Create admin account for UMak eBallot
-- Run this in your Supabase SQL Editor

-- Insert admin user
INSERT INTO public.users (email, name, role, institute_id)
VALUES ('admin@umak.edu.ph', 'System Administrator', 'admin', null)
ON CONFLICT (email) 
DO UPDATE SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Verify the admin was created
SELECT id, email, name, role, created_at 
FROM public.users 
WHERE email = 'admin@umak.edu.ph';
