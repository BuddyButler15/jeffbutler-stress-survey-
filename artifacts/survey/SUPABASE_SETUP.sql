-- ============================================================
-- Supabase setup for: Undergraduate Business Student Survey
-- Run this entire script in the Supabase SQL Editor.
-- Project Settings → SQL Editor → paste → Run
-- ============================================================

-- 1. Create the survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise     text        NOT NULL,
  sleep_hours  text        NOT NULL,
  stress_level integer     NOT NULL CHECK (stress_level >= 1 AND stress_level <= 10),
  major        text[]      NOT NULL,
  other_major  text,
  created_at   timestamptz DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- 3. Allow anonymous users to submit responses (INSERT)
CREATE POLICY "anon_insert"
  ON survey_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 4. Allow anyone to read aggregated results (SELECT)
CREATE POLICY "anon_select"
  ON survey_responses
  FOR SELECT
  TO anon
  USING (true);
