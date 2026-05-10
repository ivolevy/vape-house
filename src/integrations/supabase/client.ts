import { createClient } from '@supabase/supabase-js';

// Usamos las variables de Vite o las de Vercel como fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://iyqesodasasvmdethkgn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cWVzb2Rhc2Fzdm1kZXRoa2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjk5NTksImV4cCI6MjA5Mzc0NTk1OX0.WOke4YqnzCOufdTfEilck_ziTrbvtMMZp5eCCogaQ5Q";

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error("Faltan las llaves de Supabase. Revisa las variables de entorno.");
}

console.log("[Supabase] Conectando a:", SUPABASE_URL);

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
