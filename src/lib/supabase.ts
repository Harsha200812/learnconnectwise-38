
import { createClient } from '@supabase/supabase-js';
import { toast } from "sonner";
import { UserProfile } from './types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Log warning but don't crash
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or Anonymous Key is missing. Using dummy values for development.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User related functions
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    if (user) {
      // Get the user profile from the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 is the error code for "no rows found"
        console.error('Error fetching profile:', profileError);
      }
        
      if (profile) {
        return {
          id: user.id,
          email: user.email,
          ...profile
        };
      }
      
      // Return basic user if no profile exists
      return {
        id: user.id,
        email: user.email || '',
        role: 'learner',
        subjects: [],
        availability: [],
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const updateUserProfile = async (profile: Partial<UserProfile>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No user logged in');
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString(),
      });
      
    if (error) throw error;
    
    toast.success('Profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.error('Failed to update profile');
    return false;
  }
};

// Check if tables exist, create them if they don't
export const initializeDatabase = async () => {
  try {
    // First check if the profiles table exists
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
      
    // Create profiles table if it doesn't exist
    if (profilesError && profilesError.code === 'PGRST104') {
      // Create profiles table with RLS policies
      await supabase.rpc('init_profiles_table');
    }
    
    // Check if quizzes table exists
    const { error: quizzesError } = await supabase
      .from('quizzes')
      .select('id')
      .limit(1);
      
    // Create quizzes table if it doesn't exist
    if (quizzesError && quizzesError.code === 'PGRST104') {
      // Create quizzes table with RLS policies
      await supabase.rpc('init_quizzes_table');
    }
    
    // Check if quiz_results table exists
    const { error: resultsError } = await supabase
      .from('quiz_results')
      .select('id')
      .limit(1);
      
    // Create quiz_results table if it doesn't exist
    if (resultsError && resultsError.code === 'PGRST104') {
      // Create quiz_results table with RLS policies
      await supabase.rpc('init_quiz_results_table');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};
