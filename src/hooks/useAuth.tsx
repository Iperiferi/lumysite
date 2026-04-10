import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getAuthRedirectUrl } from '@/lib/authRedirect';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscribed: boolean;
  subscriptionEnd: string | null;
  trialEndsAt: string | null;
  isTrialActive: boolean;
  hasStripeSubscription: boolean;
  daysLeftInTrial: number | null;
  checkSubscription: () => Promise<void>;
  signUp: (email: string, password: string, redirectTo?: string) => Promise<{ error: any; session: Session | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [hasStripeSubscription, setHasStripeSubscription] = useState(false);

  const daysLeftInTrial: number | null = (() => {
    if (!trialEndsAt || !isTrialActive) return null;
    const diff = new Date(trialEndsAt).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  })();

  const checkSubscription = useCallback(async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: currentSession?.access_token
          ? { Authorization: `Bearer ${currentSession.access_token}` }
          : undefined,
      });
      if (!error && data) {
        setSubscribed(data.subscribed ?? false);
        setSubscriptionEnd(data.subscription_end ?? null);
        setTrialEndsAt(data.trial_ends_at ?? null);
        setIsTrialActive(data.is_trial_active ?? false);
        setHasStripeSubscription(data.has_stripe_subscription ?? false);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'PASSWORD_RECOVERY') {
        window.location.replace(getAuthRedirectUrl('/aterstall-losenord'));
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setSubscribed(false);
      setSubscriptionEnd(null);
      setTrialEndsAt(null);
      setIsTrialActive(false);
      setHasStripeSubscription(false);
    }
  }, [user, checkSubscription]);

  const signUp = async (email: string, password: string, redirectTo?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo ?? getAuthRedirectUrl() },
    });
    return { error, session: data.session };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      subscribed, subscriptionEnd,
      trialEndsAt, isTrialActive, hasStripeSubscription, daysLeftInTrial,
      checkSubscription, signUp, signIn, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
