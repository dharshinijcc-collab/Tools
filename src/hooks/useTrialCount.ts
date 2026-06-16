'use client';

import { useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const TRIAL_KEY = 'crestcode_trial_count';
const SESSION_KEY = 'crestcode_anon_session_id';

export function useTrialCount() {
  const [trialCount, setTrialCount] = useState(0);
  const [sessionId, setSessionId] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Read from localStorage on mount
    const stored = parseInt(localStorage.getItem(TRIAL_KEY) ?? '0', 10);
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = uuidv4();
      localStorage.setItem(SESSION_KEY, sid);
    }
    const timer = setTimeout(() => {
      setTrialCount(isNaN(stored) ? 0 : stored);
      setSessionId(sid!);
      setIsReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const incrementTrialCount = useCallback(() => {
    setTrialCount((prev) => {
      const next = prev + 1;
      localStorage.setItem(TRIAL_KEY, String(next));
      return next;
    });
  }, []);

  const resetTrialCount = useCallback(() => {
    localStorage.removeItem(TRIAL_KEY);
    setTrialCount(0);
  }, []);

  const canUseTrial = true;

  return {
    trialCount,
    sessionId,
    canUseTrial,
    isReady,
    incrementTrialCount,
    resetTrialCount,
  };
}
