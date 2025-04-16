import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Please set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables in your .env file.');
}

// Create a fallback URL and key for development only
// In production, this will ensure the app doesn't initialize without proper credentials
const fallbackUrl = 'https://placeholder-project.supabase.co';
const fallbackKey = 'placeholder-key';

// Use fallbacks only in development mode to prevent crashes during initial setup
export const supabase = createClient(
  supabaseUrl || (import.meta.env.DEV ? fallbackUrl : supabaseUrl),
  supabaseAnonKey || (import.meta.env.DEV ? fallbackKey : supabaseAnonKey)
);

// Helper function to check if connection is working
export const checkSupabaseConnection = async () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return { 
        success: false, 
        message: 'Supabase credentials are not configured. Please add them to your .env file.' 
      };
    }
    
    // A simple query to check if connection is working
    const { data, error } = await supabase.from('_auth').select('*').limit(1);
    
    if (error) {
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'Connected to Supabase successfully!' };
  } catch (err) {
    return { success: false, message: `Connection error: ${err.message}` };
  }
};