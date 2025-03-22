
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { UserProfile } from '@/lib/types';
import { supabase, updateUserProfile, initializeDatabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface RegisterProps {
  setUser: (user: UserProfile) => void;
}

const Register: React.FC<RegisterProps> = ({ setUser }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize database on component mount
  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
    };
    
    init();
  }, []);

  const handleRegister = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // Destructure form data
      const { email, password, role, subjects, availability } = data;
      
      // Initialize database tables if they don't exist yet
      await initializeDatabase();
      
      // Sign up with Supabase
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (!authData.user) {
        throw new Error('Failed to create user account');
      }
      
      // Create user profile
      const newUser: UserProfile = {
        id: authData.user.id,
        email,
        role: role || 'learner',
        subjects: subjects || [],
        availability: availability || [],
        created_at: new Date().toISOString(),
      };
      
      // Save profile to Supabase database
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email,
          role: role || 'learner',
          subjects: subjects || [],
          availability: availability || [],
          bio: '',
          hourly_rate: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
      if (profileError) {
        console.error('Error saving profile:', profileError);
        toast.error('Account created but profile data not saved completely. Error: ' + profileError.message);
      }
      
      // Store in localStorage for app persistence
      localStorage.setItem('tutorapp_user', JSON.stringify(newUser));
      
      // Update app state
      setUser(newUser);
      
      // Show success message with shorter duration
      toast.success('Account created successfully!', {
        duration: 2000,
      });
      
      // Redirect to profile
      navigate('/profile');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to create account. Please try again.', {
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container max-w-md mx-auto mt-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
        <p className="text-gray-600">
          Join TutorConnect to find tutors or become one
        </p>
      </div>
      
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-card border border-gray-100">
        <AuthForm type="register" onSubmit={handleRegister} />
        
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-tutorblue-600 hover:text-tutorblue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
