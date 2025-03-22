
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile, SUBJECTS, TIME_SLOTS, SAMPLE_TUTORS } from '@/lib/types';
import { toast } from 'sonner';
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react';
import TutorCard from '@/components/TutorCard';

interface BookSessionProps {
  user: UserProfile | null;
}

const BookSession: React.FC<BookSessionProps> = ({ user }) => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [matchedTutors, setMatchedTutors] = useState<UserProfile[]>([]);

  // Redirect to login if no user
  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to book sessions');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSearch = () => {
    if (!subject) {
      toast.error('Please select a subject');
      return;
    }
    
    if (!timeSlot) {
      toast.error('Please select an availability time slot');
      return;
    }
    
    setIsSearching(true);
    setHasSearched(false);
    
    // Simulate API call to find matching tutors
    setTimeout(() => {
      // Filter tutors based on subject and availability
      const filtered = SAMPLE_TUTORS.filter(
        (tutor) => 
          tutor.role === 'tutor' && 
          tutor.subjects.includes(subject) && 
          tutor.availability.includes(timeSlot)
      );
      
      setMatchedTutors(filtered);
      setIsSearching(false);
      setHasSearched(true);
      
      if (filtered.length === 0) {
        toast.info('No tutors found matching your criteria. Try different options.');
      } else {
        toast.success(`Found ${filtered.length} matching tutors!`);
      }
    }, 1500);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="page-container max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">Find Your Perfect Tutor</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select your subject and preferred time slot to find available tutors
        </p>
      </div>
      
      {/* Search Form */}
      <Card className="bg-white shadow-sm mb-12">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Search size={16} className="text-tutorblue-500" />
                Subject
              </label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="select-field">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((subj) => (
                    <SelectItem key={subj} value={subj}>
                      {subj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar size={16} className="text-tutorblue-500" />
                Availability
              </label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger className="select-field">
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                className="bg-tutorblue-500 hover:bg-tutorblue-600 w-full"
                onClick={handleSearch}
                disabled={isSearching || !subject || !timeSlot}
              >
                {isSearching ? (
                  <span className="flex items-center">
                    <Clock className="animate-spin mr-2 h-4 w-4" />
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Find Tutors 
                    <ArrowRight size={16} className="ml-2" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              {matchedTutors.length > 0 
                ? `${matchedTutors.length} Tutors Available` 
                : 'No Tutors Found'}
            </h2>
            <p className="text-sm text-gray-500">
              {subject} · {timeSlot}
            </p>
          </div>

          {matchedTutors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedTutors.map((tutor) => (
                <TutorCard 
                  key={tutor.id}
                  tutor={tutor}
                  selectedSubject={subject}
                  selectedTime={timeSlot}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">No tutors available</h3>
              <p className="text-gray-500 mb-6">
                We couldn't find any tutors matching your criteria. Try a different subject or time slot.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSubject('');
                  setTimeSlot('');
                  setHasSearched(false);
                }}
              >
                Try Different Options
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookSession;
