
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { supabase, initializeDatabase, getCurrentUser } from '@/lib/supabase';
import { toast } from 'sonner';
import { SAMPLE_TUTORS, UserProfile, UserRole } from '@/lib/types';

interface LoginProps {
  setUser: (user: UserProfile) => void;
}

const Login: React.FC<LoginProps> = ({ setUser }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize database on component mount
  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
    };
    
    init();
  }, []);

  const handleLogin = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const { email, password } = data;
      
      // Initialize database tables if they don't exist yet
      await initializeDatabase();
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Successfully signed in with Supabase auth', authData.user.id);
      
      // Use the getCurrentUser function to get complete user profile
      const userProfile = await getCurrentUser();
      
      if (userProfile) {
        console.log('Retrieved complete user profile', userProfile);
        // Update app state
        setUser(userProfile);
        
        toast.success('Signed in successfully!', {
          duration: 2000,
        });
        
        navigate('/profile');
        return;
      }
      
      console.log('getCurrentUser failed, falling back to manual profile creation');
      
      // Fallback to sample data or create new profile if getCurrentUser fails
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }
      
      let fallbackProfile: UserProfile;
      
      if (profileData) {
        console.log('Found existing profile data', profileData);
        // Use profile from database
        fallbackProfile = {
          id: authData.user.id,
          email: authData.user.email || email,
          role: profileData.role as UserRole || 'learner',
          subjects: profileData.subjects || [],
          availability: profileData.availability || [],
          bio: profileData.bio,
          hourlyRate: profileData.hourly_rate,
          created_at: profileData.created_at || new Date().toISOString(),
        };
      } else {
        console.log('No profile found, creating new one');
        // Fallback to sample data or create new profile
        const sampleTutor = SAMPLE_TUTORS.find(t => t.email === email);
        
        fallbackProfile = sampleTutor || {
          id: authData.user.id,
          email,
          role: 'learner' as UserRole,
          subjects: [],
          availability: [],
          created_at: new Date().toISOString(),
        };
        
        console.log('Saving new profile to Supabase', fallbackProfile);
        
        // Save this profile to Supabase for future logins
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email,
            role: fallbackProfile.role,
            subjects: fallbackProfile.subjects,
            availability: fallbackProfile.availability,
            bio: fallbackProfile.bio || '',
            hourly_rate: fallbackProfile.hourlyRate || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          
        if (upsertError) {
          console.error('Error creating new profile:', upsertError);
        }
      }
      
      // Store in localStorage
      localStorage.setItem('tutorapp_user', JSON.stringify(fallbackProfile));
      console.log('Saved user profile to localStorage', fallbackProfile);
      
      // Update app state
      setUser(fallbackProfile);
      
      toast.success('Signed in successfully!', {
        duration: 2000,
      });
      
      navigate('/profile');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Create a demo user account for testing purposes
      const newUser: UserProfile = {
        id: 'demo-user',
        email: data.email,
        role: 'learner',
        subjects: [],
        availability: [],
        created_at: new Date().toISOString(),
      };
      
      localStorage.setItem('tutorapp_user', JSON.stringify(newUser));
      setUser(newUser);
      
      toast.success('Signed in with demo account!', {
        duration: 2000,
      });
      navigate('/profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container max-w-md mx-auto mt-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-gray-600">
          Sign in to your TutorConnect account
        </p>
      </div>
      
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-card border border-gray-100">
        <AuthForm type="login" onSubmit={handleLogin} />
        
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-tutorblue-600 hover:text-tutorblue-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500 mb-4">
            For demo purposes, you can sign in with any email and password. 
            Try using sample emails like john.doe@example.com or create your own account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
