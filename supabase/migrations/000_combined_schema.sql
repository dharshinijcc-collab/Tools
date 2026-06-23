-- ============================================================
-- CrestCode Idea Validator — Full Database Schema (Combined)
-- Run this ONCE in your Supabase SQL Editor to set everything up
-- ============================================================

-- ── 1. USERS TABLE ───────────────────────────────────────────
-- Extends Supabase auth.users with plan & usage tracking
CREATE TABLE IF NOT EXISTS public.users (
  id                uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan              text        NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  free_reports_used int         NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
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

-- ── 2. SCORING RESULTS TABLE ──────────────────────────────────
-- Stores every AI validation result + training data fields
CREATE TABLE IF NOT EXISTS public.scoring_results (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  anon_session_id          text,
  idea_text                text        NOT NULL,
  response                 jsonb       NOT NULL,
  overall_score            int         NOT NULL,
  triage_band              text        NOT NULL,
  unlocked                 boolean     NOT NULL DEFAULT false,
  need_help                boolean     DEFAULT false,
  -- Training data fields
  raw_answers              jsonb,
  extracted_signals        jsonb,
  scoring_factors          jsonb,
  dimension_scores         jsonb,
  startup_quality_score    numeric,
  investor_readiness_score numeric,
  narrative                jsonb,
  created_at               timestamptz NOT NULL DEFAULT now()
);

-- ── 3. OUTCOME SURVEYS TABLE ──────────────────────────────────
-- Collects post-launch outcomes for model training
CREATE TABLE IF NOT EXISTS public.outcome_surveys (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id         uuid        NOT NULL REFERENCES public.scoring_results(id) ON DELETE CASCADE,
  original_score    numeric     NOT NULL,
  launched          boolean     NOT NULL,
  got_first_users   boolean     NOT NULL,
  paying_customers  boolean     NOT NULL,
  monthly_revenue   numeric     NOT NULL,
  raised_funding    boolean     NOT NULL,
  shut_down         boolean     NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ── 4. ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outcome_surveys ENABLE ROW LEVEL SECURITY;

-- Users: can only read/update their own row
CREATE POLICY "users_self_select" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_self_update" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Scoring results: users can see & insert their own results (or anonymous)
CREATE POLICY "results_user_select" ON public.scoring_results
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "results_user_insert" ON public.scoring_results
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Outcome surveys: users can interact with surveys tied to their reports
CREATE POLICY "outcome_surveys_all_policy" ON public.outcome_surveys
  FOR ALL USING (
    result_id IN (
      SELECT id FROM public.scoring_results
      WHERE user_id = auth.uid() OR user_id IS NULL
    )
  )
  WITH CHECK (
    result_id IN (
      SELECT id FROM public.scoring_results
      WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

-- ── 5. INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_scoring_results_user_id
  ON public.scoring_results (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scoring_results_anon
  ON public.scoring_results (anon_session_id);
