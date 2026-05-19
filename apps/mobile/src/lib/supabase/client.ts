import Constants from "expo-constants";
import { createClient } from "@supabase/supabase-js";

const extras = Constants.expoConfig?.extra ?? {};

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  (typeof extras.supabaseUrl === "string" ? extras.supabaseUrl : "");

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  (typeof extras.supabaseAnonKey === "string" ? extras.supabaseAnonKey : "");

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL or anon key is missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});
