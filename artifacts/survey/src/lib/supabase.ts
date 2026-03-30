import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error("VITE_SUPABASE_URL is not set");
if (!supabaseAnonKey) throw new Error("VITE_SUPABASE_ANON_KEY is not set");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SurveyResponse = {
  id?: string;
  exercise: string;
  sleep_hours: string;
  stress_level: number;
  major: string[];
  other_major: string | null;
  created_at?: string;
};
