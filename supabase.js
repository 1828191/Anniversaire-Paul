// Configuration publique Supabase pour GitHub Pages.
// Ne place jamais de clé sb_secret_ dans ce fichier.
const SUPABASE_URL = "https://kyapjrisjzvvyycewgwm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_k0yK0lrsPE31hMcgQC8yoQ_u8zpMwxN";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
