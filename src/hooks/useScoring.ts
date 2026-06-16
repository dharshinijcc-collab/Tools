'use client';

import { useState, useCallback } from 'react';
import { ScoreApiResponse, QAAnswers } from '@/types/scoring';

interface UseScoringResult {
  submit: (
    ideaText: string,
    trialCount: number,
    anonSessionId: string,
    qaAnswers?: QAAnswers
  ) => Promise<ScoreApiResponse & { id: string; free_reports_used?: number } | null>;
  loading: boolean;
  error: string | null;
  result: (ScoreApiResponse & { id: string; free_reports_used?: number }) | null;
  reset: () => void;
}

export function useScoring(): UseScoringResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(ScoreApiResponse & { id: string; free_reports_used?: number }) | null>(null);

  const submit = useCallback(async (
    ideaText: string,
    trialCount: number,
    anonSessionId: string,
    qaAnswers?: QAAnswers
  ) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea_text: ideaText,
          trial_count: trialCount,
          anon_session_id: anonSessionId,
          qa_answers: qaAnswers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return null;
      }

      // If cached, fetch the full result
      if (data.cached) {
        const resultRes = await fetch(`/api/results/${data.id}`);
        if (resultRes.ok) {
          const fullData = await resultRes.json();
          setResult(fullData);
          return fullData;
        }
      }

      setResult(data);
      return data;
    } catch {
      setError('Something went wrong. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return { submit, loading, error, result, reset };
}
