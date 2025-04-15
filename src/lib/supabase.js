import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Please set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if connection is working
export const checkSupabaseConnection = async () => {
  try {
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