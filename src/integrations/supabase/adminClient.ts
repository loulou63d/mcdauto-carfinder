/**
 * Separate Supabase client for admin sessions.
 * Uses sessionStorage so the admin session is isolated to the current tab
 * and does NOT interfere with customer sessions stored in localStorage.
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: sessionStorage,
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'mcd-admin-auth',
  },
});
