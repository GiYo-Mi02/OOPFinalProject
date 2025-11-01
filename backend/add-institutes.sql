-- Add all UMak Colleges and Institutes to the database
-- Run this in your Supabase SQL Editor

-- ============================================
-- Create Institutes Reference Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.institutes (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('college', 'institute')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_institutes_type ON public.institutes(type);

-- Enable RLS
ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read institutes
CREATE POLICY "Anyone can read institutes" ON public.institutes
  FOR SELECT USING (true);

-- ============================================
-- Insert Colleges
-- ============================================
INSERT INTO public.institutes (code, name, type, created_at, updated_at) VALUES
('CBFS', 'College of Business and Financial Sciences', 'college', NOW(), NOW()),
('CCIS', 'College of Computing and Information Sciences', 'college', NOW(), NOW()),
('CCSE', 'College of Construction Sciences and Engineering', 'college', NOW(), NOW()),
('CET', 'College of Education and Technology', 'college', NOW(), NOW()),
('CGPP', 'College of Governance and Public Policy', 'college', NOW(), NOW()),
('CHK', 'College of Human Kinetics', 'college', NOW(), NOW()),
('CITE', 'College of Innovative Teaching and Education', 'college', NOW(), NOW()),
('CITE-HSU', 'College of Innovative Teaching and Education – Higher School ng UMak', 'college', NOW(), NOW()),
('CTHM', 'College of Tourism and Hospitality Management', 'college', NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- ============================================
-- Insert Institutes
-- ============================================
INSERT INTO public.institutes (code, name, type, created_at, updated_at) VALUES
('IAD', 'Institute of Arts and Design', 'institute', NOW(), NOW()),
('IDEM', 'Institute of Developmental Entrepreneurship and Management', 'institute', NOW(), NOW()),
('IIHS', 'Institute of International and Human Studies', 'institute', NOW(), NOW()),
('IOA', 'Institute of Organization and Administration', 'institute', NOW(), NOW()),
('ION', 'Institute of Nursing', 'institute', NOW(), NOW()),
('IOP', 'Institute of Pharmacy', 'institute', NOW(), NOW()),
('IOPsy', 'Institute of Psychology', 'institute', NOW(), NOW()),
('ISW', 'Institute of Social Work', 'institute', NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- ============================================
-- Add trigger for updated_at
-- ============================================
CREATE TRIGGER update_institutes_updated_at BEFORE UPDATE ON public.institutes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Verify the inserts
-- ============================================
SELECT code, name, type FROM public.institutes ORDER BY type, code;

-- ============================================
-- Summary
-- ============================================
SELECT 
  type,
  COUNT(*) as count
FROM public.institutes
GROUP BY type
ORDER BY type;
