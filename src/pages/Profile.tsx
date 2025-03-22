
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { UserProfile, SUBJECTS } from '@/lib/types';
import { supabase, updateUserProfile } from '@/lib/supabase';
import { toast } from 'sonner';
import { Save, Loader2, User, Book, Clock, DollarSign } from 'lucide-react';
import AvailabilityPicker from '@/components/AvailabilityPicker';

interface ProfileProps {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    subjects: [],
    availability: [],
    bio: '',
    hourlyRate: 0,
  });

  // Redirect to login if no user
  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to view your profile');
      navigate('/login');
    } else {
      // Load user data
      setFormData({
        subjects: user.subjects || [],
        availability: user.availability || [],
        bio: user.bio || '',
        hourlyRate: user.hourlyRate || (user.role === 'tutor' ? 30 : 0),
      });
    }
  }, [user, navigate]);

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, bio: e.target.value });
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, hourlyRate: parseInt(e.target.value) || 0 });
  };

  const toggleSubject = (subject: string) => {
    setFormData((prev) => {
      const subjects = prev.subjects || [];
      return {
        ...prev,
        subjects: subjects.includes(subject)
          ? subjects.filter((s) => s !== subject)
          : [...subjects, subject],
      };
    });
  };
  
  const handleAvailabilityChange = (availability: string[]) => {
    setFormData((prev) => ({
      ...prev,
      availability,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Create updated user object
      const updatedUser: UserProfile = {
        ...user,
        subjects: formData.subjects || [],
        availability: formData.availability || [],
        bio: formData.bio,
        hourlyRate: formData.hourlyRate,
      };
      
      // Save to Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          role: user.role,
          subjects: formData.subjects || [],
          availability: formData.availability || [],
          bio: formData.bio,
          hourly_rate: formData.hourlyRate,
          updated_at: new Date().toISOString(),
        });
        
      if (error) {
        throw error;
      }
      
      // Update in localStorage
      localStorage.setItem('tutorapp_user', JSON.stringify(updatedUser));
      
      // Update app state
      setUser(updatedUser);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="page-container flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-tutorblue-500" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="bg-white shadow-sm md:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Account Information</CardTitle>
            <CardDescription>Your basic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-tutorblue-100 flex items-center justify-center text-tutorblue-600">
                <User size={40} />
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="text-gray-900 capitalize">{user.role}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Member Since</p>
                <p className="text-gray-900">
                  {new Date(user.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Card */}
        <Card className="bg-white shadow-sm md:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Edit Profile</CardTitle>
            <CardDescription>Update your preferences and availability</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Bio Section */}
              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">
                  Bio / About
                </label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself, your expertise, or learning goals..."
                  className="resize-none"
                  rows={4}
                  value={formData.bio || ''}
                  onChange={handleBioChange}
                />
              </div>

              {/* Hourly Rate (for tutors) */}
              {user.role === 'tutor' && (
                <div className="space-y-2">
                  <label htmlFor="rate" className="text-sm font-medium flex items-center gap-2">
                    <DollarSign size={16} className="text-tutorblue-500" />
                    Hourly Rate
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">$</span>
                    <Input
                      id="rate"
                      type="number"
                      min="1"
                      max="500"
                      value={formData.hourlyRate || 30}
                      onChange={handleRateChange}
                      className="max-w-[120px]"
                    />
                    <span className="text-gray-500 ml-2">per hour</span>
                  </div>
                </div>
              )}

              {/* Subjects Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Book size={16} className="text-tutorblue-500" />
                  {user.role === 'tutor' ? 'Subjects You Teach' : 'Subjects You Want to Learn'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SUBJECTS.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`subject-${subject}`}
                        checked={(formData.subjects || []).includes(subject)}
                        onCheckedChange={() => toggleSubject(subject)}
                      />
                      <label
                        htmlFor={`subject-${subject}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {subject}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock size={16} className="text-tutorblue-500" />
                  Your Availability
                </label>
                <AvailabilityPicker
                  value={formData.availability || []}
                  onChange={handleAvailabilityChange}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="bg-tutorblue-500 hover:bg-tutorblue-600 w-full md:w-auto"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
