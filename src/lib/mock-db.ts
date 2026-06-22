/**
 * In-memory mock database for local development.
 * Used when USE_MOCK_DB=true or Supabase keys are missing.
 * Data is NOT persisted across server restarts.
 */

import { StoredResult } from '@/types/scoring';

// Module-level store (survives hot-reloads in dev via Next.js module cache)
const store: Map<string, StoredResult> = new Map();

// Mock outcome survey store
export interface MockOutcomeSurvey {
  id: string;
  result_id: string;
  original_score: number;
  launched: boolean;
  got_first_users: boolean;
  paying_customers: boolean;
  monthly_revenue: number;
  raised_funding: boolean;
  shut_down: boolean;
  created_at: string;
}

const outcomeStore: Map<string, MockOutcomeSurvey> = new Map();

export const mockDb = {
  saveResult(result: StoredResult): void {
    store.set(result.id, result);
  },

  getResult(id: string): StoredResult | null {
    return store.get(id) ?? null;
  },

  getResultsByUser(userId: string): StoredResult[] {
    return Array.from(store.values())
      .filter((r) => r.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  mergeAnonResults(anonSessionId: string, userId: string): number {
    let merged = 0;
    for (const [id, result] of store.entries()) {
      if ((result as StoredResult & { anon_session_id?: string }).anon_session_id === anonSessionId) {
        store.set(id, { ...result, user_id: userId });
        merged++;
      }
    }
    return merged;
  },

  saveOutcomeSurvey(survey: MockOutcomeSurvey): void {
    outcomeStore.set(survey.result_id, survey);
  },

  getOutcomeSurvey(resultId: string): MockOutcomeSurvey | null {
    return outcomeStore.get(resultId) ?? null;
  },

  updateNeedHelp(id: string, needHelp: boolean): void {
    const res = store.get(id);
    if (res) {
      store.set(id, { ...res, need_help: needHelp });
    }
  },
};

// Mock user store
interface MockUser {
  id: string;
  email: string;
  plan: 'free' | 'pro';
  free_reports_used: number;
  created_at: string;
}

const userStore: Map<string, MockUser> = new Map();

export const mockUserDb = {
  getUser(id: string): MockUser | null {
    return userStore.get(id) ?? null;
  },

  upsertUser(user: MockUser): void {
    userStore.set(user.id, user);
  },

  incrementUsage(userId: string): void {
    const user = userStore.get(userId);
    if (user) {
      userStore.set(userId, { ...user, free_reports_used: user.free_reports_used + 1 });
    }
  },
};
