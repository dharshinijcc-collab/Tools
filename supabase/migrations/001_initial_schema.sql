-- ============================================================
-- CrestCode Idea Validator — Initial Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan        text        NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  free_reports_used int   NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Auto-create user row on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Scoring results table
CREATE TABLE IF NOT EXISTS public.scoring_results (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  anon_session_id text,
  idea_text       text        NOT NULL,
  response        jsonb       NOT NULL,
  overall_score   int         NOT NULL,
  triage_band     text        NOT NULL,
  unlocked        boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_results ENABLE ROW LEVEL SECURITY;

-- Users: can only read/update their own row
CREATE POLICY "users_self_select" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_self_update" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Scoring results: users can see their own results
CREATE POLICY "results_user_select" ON public.scoring_results FOR SELECT USING (
  user_id = auth.uid() OR user_id IS NULL
);
CREATE POLICY "results_user_insert" ON public.scoring_results FOR INSERT WITH CHECK (
  user_id = auth.uid() OR user_id IS NULL
);

-- Index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_scoring_results_user_id ON public.scoring_results (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scoring_results_anon ON public.scoring_results (anon_session_id);
