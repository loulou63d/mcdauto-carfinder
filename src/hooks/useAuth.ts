import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdmin = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) {
        console.error('is_admin RPC error:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }
    } catch (err) {
      console.error('is_admin check failed:', err);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Defer admin check to avoid blocking the callback
        setTimeout(() => {
          if (!mounted) return;
          checkAdmin(newSession?.user ?? null).then(() => {
            if (mounted) setLoading(false);
          });
        }, 0);
      }
    );

    // Then get the initial session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!mounted) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      await checkAdmin(initialSession?.user ?? null);
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdmin]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, isAdmin, signIn, signOut };
};
