/**
 * SkillOra public client configuration.
 * ONLY the project URL and the *publishable* (anon) key belong here - both are
 * designed to be public. Security is enforced by Row Level Security in the
 * database (db/01_secure_schema.sql), NOT by hiding this key.
 *
 * NEVER put an sb_secret_... / service_role key in any file served to a browser.
 */
window.SKILLORA_CONFIG = Object.freeze({
  SUPABASE_URL: "https://fvotuteameyrohyphbrk.supabase.co",
  // Fill in your REAL public contact numbers (digits with country code, e.g. "+91 98XXXXXXXX"). Leave "" to hide.
  SUPPORT_PHONE: "",
  SUPPORT_WHATSAPP: "",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_9bpKJeqSF863GkBogIbE2A_d2s44ntl"
});
