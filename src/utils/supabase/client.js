/// FILE — src/utils/supabase/client.js
/// PURPOSE — Initializes and exports a configured Supabase client for use throughout the application. Handles environment variable validation for Supabase credentials and sets authentication options for session persistence, token refresh, and OAuth session detection.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate that required Supabase environment variables are present before initializing the client
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing SUPABASE environment variables.')
}
console.log(' SUPABASE environment variables.')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    // Configure authentication options for the Supabase client
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
})
