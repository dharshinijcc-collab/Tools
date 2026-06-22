-- ============================================================
-- CrestCode Idea Validator — Migration 002
-- Add training data fields and outcome surveys table
-- ============================================================

-- Alter public.scoring_results to add training columns and split scores
ALTER TABLE public.scoring_results
ADD COLUMN IF NOT EXISTS raw_answers jsonb,
ADD COLUMN IF NOT EXISTS extracted_signals jsonb,
ADD COLUMN IF NOT EXISTS scoring_factors jsonb,
ADD COLUMN IF NOT EXISTS dimension_scores jsonb,
ADD COLUMN IF NOT EXISTS startup_quality_score numeric,
ADD COLUMN IF NOT EXISTS investor_readiness_score numeric,
ADD COLUMN IF NOT EXISTS narrative jsonb,
ADD COLUMN IF NOT EXISTS need_help boolean DEFAULT false;

-- Create outcome_surveys table
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

-- Enable RLS for outcome_surveys
ALTER TABLE public.outcome_surveys ENABLE ROW LEVEL SECURITY;

-- Configure RLS policy for outcome_surveys: users can insert and select outcome surveys
-- for reports they own (user_id matches auth.uid() or result is anonymous)
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
