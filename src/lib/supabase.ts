import { createClient } from '@supabase/supabase-js';
import { toast } from "sonner";
import { UserProfile } from './types';

// Initialize Supabase client with the provided values
const supabaseUrl = 'https://onvtudfhfpqlzorfflhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9udnR1ZGZoZnBxbHpvcmZmbGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NzcwMjgsImV4cCI6MjA1ODI1MzAyOH0.7cmaodG0QIZbU8-0PKmd8b_fNeIqJbUqP7ILjyY6Ens';

// Create the Supabase client
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

// Manually create the profiles table if it doesn't exist
export const manuallyCreateProfilesTable = async () => {
  try {
    // Check if the profiles table exists by trying to select from it
    const { error } = await supabase.from('profiles').select('id').limit(1);

    if (error && error.code === 'PGRST116') {
      // Table doesn't exist or is empty, let's create it
      const { error: createError } = await supabase.rpc('create_profiles_table');
      
      if (createError) {
        // If the RPC function doesn't exist, create the table directly
        const { error: directCreateError } = await supabase.query(`
          CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT,
            role TEXT CHECK (role IN ('tutor', 'learner')),
            subjects TEXT[],
            availability TEXT[],
            bio TEXT,
            hourly_rate INTEGER,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
          );
        `);
        
        if (directCreateError) {
          console.error("Failed to create profiles table directly:", directCreateError);
          return false;
        }
      }
      
      console.log("Profiles table created successfully");
      return true;
    }
    
    return true; // Table already exists
  } catch (error) {
    console.error('Error creating profiles table:', error);
    return false;
  }
};

// Check if tables exist, create them if they don't
export const initializeDatabase = async () => {
  try {
    // First try the manual table creation approach
    const profilesCreated = await manuallyCreateProfilesTable();
    
    if (!profilesCreated) {
      console.warn("Could not create profiles table manually, trying RPC method");
      
      // Try the RPC method as fallback
      const { error: profilesError } = await supabase.rpc('init_profiles_table');
      
      if (profilesError) {
        console.error("Failed to initialize profiles table:", profilesError);
      }
    }
    
    // For quizzes and quiz_results tables, keep the existing approach
    const { error: quizzesError } = await supabase.from('quizzes').select('id').limit(1);
    if (quizzesError && quizzesError.code === 'PGRST104') {
      await supabase.rpc('init_quizzes_table');
    }
    
    const { error: resultsError } = await supabase.from('quiz_results').select('id').limit(1);
    if (resultsError && resultsError.code === 'PGRST104') {
      await supabase.rpc('init_quiz_results_table');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};
