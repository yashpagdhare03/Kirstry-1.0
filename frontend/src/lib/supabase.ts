import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cssmoybkdzoxbntcrzfj.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzc21veWJrZHpveGJudGNyemZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MzY3NDEsImV4cCI6MjEwMTQxMjc0MX0.N-fx0TgOOJcjJBZmlyUX-xmdQwBoR2U-GKYUsMdxbww';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
