'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/scoring';

const USE_MOCK_DB = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ?? true;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync state with localStorage for mock DB mode
  const syncMockState = () => {
    if (!USE_MOCK_DB) return;
    const stored = localStorage.getItem('crestcode_mock_user');
    if (stored) {
      try {
        const mockUser = JSON.parse(stored);
        setUser({
          id: mockUser.id,
          email: mockUser.email,
          aud: 'authenticated',
          role: 'authenticated',
          created_at: mockUser.created_at,
          app_metadata: {},
          user_metadata: {},
        } as User);
        setProfile({
          id: mockUser.id,
          plan: mockUser.plan,
          free_reports_used: mockUser.free_reports_used,
          created_at: mockUser.created_at,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      setUser(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    if (USE_MOCK_DB) {
      const timer = setTimeout(() => {
        syncMockState();
        setLoading(false);
      }, 0);

      // Listen for local changes to support mock sync across tabs/components
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'crestcode_mock_user') {
          syncMockState();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('storage', handleStorageChange);
      };
    }

    const supabase = createClient();

    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (data) setProfile(data as UserProfile);
    };

    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (USE_MOCK_DB) {
      localStorage.removeItem('crestcode_mock_user');
      setUser(null);
      setProfile(null);
      // Trigger storage event manually for this tab
      window.dispatchEvent(new Event('storage'));
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const mockLogin = (email: string) => {
    if (!USE_MOCK_DB) return;
    const mockUser = {
      id: 'mock-user-id',
      email: email || 'demo@crestcode.com',
      plan: 'free',
      free_reports_used: 1, // Start with 1 so they can test the trial limit easily
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('crestcode_mock_user', JSON.stringify(mockUser));
    syncMockState();
  };

  const mockSignup = (email: string) => {
    if (!USE_MOCK_DB) return;
    const mockUser = {
      id: 'mock-user-id',
      email: email || 'demo@crestcode.com',
      plan: 'free',
      free_reports_used: 0,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('crestcode_mock_user', JSON.stringify(mockUser));
    syncMockState();
  };

  const upgradeToPro = async () => {
    if (USE_MOCK_DB) {
      const stored = localStorage.getItem('crestcode_mock_user');
      if (stored) {
        const mockUser = JSON.parse(stored);
        mockUser.plan = 'pro';
        localStorage.setItem('crestcode_mock_user', JSON.stringify(mockUser));
        syncMockState();
      } else {
        const mockUser = {
          id: 'mock-user-id',
          email: 'demo@crestcode.com',
          plan: 'pro',
          free_reports_used: 0,
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('crestcode_mock_user', JSON.stringify(mockUser));
        syncMockState();
      }
      return true;
    } else {
      const res = await fetch('/api/account/upgrade', { method: 'POST' });
      return res.ok;
    }
  };

  const isPro = profile?.plan === 'pro';
  const freeReportsUsed = profile?.free_reports_used ?? 0;
  const trialExhausted = !isPro && freeReportsUsed >= 2;

  return { user, profile, loading, isPro, freeReportsUsed, trialExhausted, signOut, mockLogin, mockSignup, upgradeToPro };
}
