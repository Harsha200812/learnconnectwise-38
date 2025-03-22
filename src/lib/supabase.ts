
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
      console.log("Getting profile for user:", user.id);
      
      // Get the user profile from the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        if (profileError.code !== 'PGRST116') { // PGRST116 is "no rows found"
          toast.error('Error loading profile data');
        }
      }
      
      console.log("Profile data retrieved:", profile);
        
      if (profile) {
        // Create a complete user profile by combining auth and profile data
        const userProfile = {
          id: user.id,
          email: user.email || '',
          role: profile.role || 'learner',
          subjects: profile.subjects || [],
          availability: profile.availability || [],
          bio: profile.bio || '',
          hourlyRate: profile.hourly_rate || 0,
          created_at: profile.created_at || new Date().toISOString(),
        };
        
        // Update localStorage to ensure it's in sync with database
        localStorage.setItem('tutorapp_user', JSON.stringify(userProfile));
        
        return userProfile;
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
    // Check if we have a session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      console.error('No auth session found');
      
      // Attempt to sign in with stored credentials if available
      const storedUser = localStorage.getItem('tutorapp_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        // For the demo app, we'll just update the profile without authentication
        // This is only for development purposes
        console.log('Using demo mode to update profile without auth');
        
        const profileData = {
          id: userData.id,
          email: profile.email || userData.email,
          role: profile.role || userData.role || 'learner',
          subjects: profile.subjects || [],
          availability: profile.availability || [],
          bio: profile.bio || '',
          hourly_rate: profile.hourlyRate || 0,
          updated_at: new Date().toISOString(),
        };
        
        // Since we're in demo mode with no authentication, we'll just update localStorage
        const updatedUser = { ...userData, ...profile };
        localStorage.setItem('tutorapp_user', JSON.stringify(updatedUser));
        
        toast.success('Profile updated successfully (Demo Mode)');
        return true;
      }
      
      toast.error('Authentication error: No session found');
      return false;
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error checking user:', authError);
      toast.error('Authentication error: ' + authError.message);
      return false;
    }
    
    if (!user) {
      console.error('No authenticated user found');
      toast.error('No user logged in');
      return false;
    }
    
    console.log('Updating profile for user:', user.id);
    console.log('Profile data to update:', profile);
    
    // Format the data properly for Supabase
    const profileData = {
      id: user.id,
      email: profile.email,
      role: profile.role || 'learner',
      subjects: profile.subjects || [],
      availability: profile.availability || [],
      bio: profile.bio || '',
      hourly_rate: profile.hourlyRate || 0,
      updated_at: new Date().toISOString(),
    };
    
    console.log('Formatted profile data:', profileData);
    
    const { error } = await supabase
      .from('profiles')
      .upsert(profileData);
      
    if (error) {
      console.error('Error updating profile in Supabase:', error);
      toast.error('Failed to update profile: ' + error.message);
      return false;
    }
    
    toast.success('Profile updated successfully');
    return true;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    toast.error('Failed to update profile: ' + (error.message || 'Unknown error'));
    return false;
  }
};

// Manually create the profiles table if it doesn't exist
export const manuallyCreateProfilesTable = async () => {
  try {
    // Check if the profiles table exists by trying to select from it
    const { error } = await supabase.from('profiles').select('id').limit(1);

    if (error && error.code === 'PGRST116') {
      // Table doesn't exist or is empty, let's create it via RPC
      const { error: createError } = await supabase.rpc('create_profiles_table');
      
      if (createError) {
        console.error("Failed to create profiles table via RPC:", createError);
        
        // If RPC fails, we can't use direct SQL queries with the JS client
        // Instead, we'll instruct the user to create the table in Supabase dashboard
        console.warn("Please create the profiles table manually in the Supabase dashboard");
        
        // We'll also try to create it through our API calls
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: '00000000-0000-0000-0000-000000000000',
            email: 'system@example.com',
            role: 'system',
            subjects: [],
            availability: [],
            bio: '',
            hourly_rate: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (upsertError && upsertError.code !== 'PGRST116') {
          console.error("Failed to create profiles table through upsert:", upsertError);
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
